import fs from "fs";
import path from "path";

import dotenv from "dotenv";
import mongoose from "mongoose";

import localQuestions from "../data/questions.js";
import { buildSkillQuestionCoverage, getQuestionSkill, SKILL_GRAPH } from "../data/skillGraph.js";
import Question from "../models/question.model.js";

dotenv.config();

const TARGETS = {
  foundation: 5,
  core: 10,
  "early-intermediate": 5,
  unmapped: 1,
};

const args = new Set(process.argv.slice(2));

const getTargetForSkill = (skill) => {
  if (skill.strand === "Foundation") return TARGETS.foundation;
  if (skill.level === "early-intermediate") return TARGETS["early-intermediate"];
  if (skill.level === "core") return TARGETS.core;
  return TARGETS.core;
};

const writeFile = (filePath, content) => {
  const absolutePath = path.resolve(filePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, content);
  return absolutePath;
};

const countBy = (items, getKey) =>
  items.reduce((lookup, item) => {
    const key = getKey(item);
    lookup[key] = (lookup[key] || 0) + 1;
    return lookup;
  }, {});

const findDuplicateValues = (items, getValue) => {
  const counts = countBy(items, getValue);
  return Object.entries(counts)
    .filter(([, count]) => count > 1)
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
};

const getIndexStatus = async () => {
  const indexes = await Question.collection.indexes();
  const hasQuestionIdUnique = indexes.some((index) => index.unique === true && index.key?.questionId === 1);
  const hasSkillId = indexes.some((index) => index.key?.skillId === 1);
  const hasTopicSubtopic = indexes.some((index) => index.key?.topic === 1 && index.key?.subtopic === 1);
  const hasDifficulty = indexes.some((index) => index.key?.difficulty === 1);

  return {
    hasQuestionIdUnique,
    hasSkillId,
    hasTopicSubtopic,
    hasDifficulty,
    indexes: indexes.map((index) => ({
      name: index.name,
      key: index.key,
      unique: Boolean(index.unique),
    })),
  };
};

const buildAuditReport = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is required for question bank audit");
  }

  await mongoose.connect(process.env.MONGO_URI);

  const db = mongoose.connection.db.databaseName;
  const host = mongoose.connection.host;
  const questions = await Question.find({}).lean();
  const skillIds = new Set(SKILL_GRAPH.map((skill) => skill.id));
  const coverage = buildSkillQuestionCoverage(questions);
  const indexStatus = await getIndexStatus();

  const missingQuestionId = questions
    .filter((question) => !question.questionId)
    .map((question) => String(question._id));
  const missingSkillId = questions
    .filter((question) => !question.skillId)
    .map((question) => question.questionId || String(question._id));
  const invalidSkillIds = questions
    .filter((question) => question.skillId && !skillIds.has(question.skillId))
    .map((question) => ({
      questionId: question.questionId || String(question._id),
      skillId: question.skillId,
      topic: question.topic,
      subtopic: question.subtopic,
    }));
  const generatedFallbacks = questions
    .filter((question) => getQuestionSkill(question).isGeneratedSkill)
    .map((question) => ({
      questionId: question.questionId || String(question._id),
      topic: question.topic,
      subtopic: question.subtopic,
      skillId: question.skillId,
    }));
  const duplicateQuestionIds = findDuplicateValues(
    questions.filter((question) => question.questionId),
    (question) => question.questionId
  );

  const skills = coverage.bySkill.map((skill) => {
    const target = getTargetForSkill(skill);
    const questionCount = skill.questionCount || 0;
    return {
      skillId: skill.id,
      skillName: skill.name,
      strand: skill.strand,
      questionCount,
      target,
      gap: Math.max(0, target - questionCount),
      status: questionCount >= target ? "ready" : questionCount > 0 ? "thin" : "empty",
    };
  });

  const summary = {
    database: db,
    host,
    dbQuestionCount: questions.length,
    localSeedQuestionCount: localQuestions.length,
    expectedQuestionCountMatch: questions.length === localQuestions.length,
    totalSkills: coverage.totalSkills,
    readySkills: skills.filter((skill) => skill.status === "ready").length,
    thinSkills: skills.filter((skill) => skill.status === "thin").length,
    emptySkills: skills.filter((skill) => skill.status === "empty").length,
    totalGap: skills.reduce((sum, skill) => sum + skill.gap, 0),
    generatedFallbackCount: coverage.generatedFallbackCount,
    missingQuestionIdCount: missingQuestionId.length,
    missingSkillIdCount: missingSkillId.length,
    invalidSkillIdCount: invalidSkillIds.length,
    duplicateQuestionIdGroups: duplicateQuestionIds.length,
    indexes: {
      questionIdUnique: indexStatus.hasQuestionIdUnique,
      skillId: indexStatus.hasSkillId,
      topicSubtopic: indexStatus.hasTopicSubtopic,
      difficulty: indexStatus.hasDifficulty,
    },
  };

  const failures = [];
  if (!summary.expectedQuestionCountMatch) failures.push("Atlas question count does not match local seed count");
  if (summary.missingQuestionIdCount > 0) failures.push("Some questions are missing questionId");
  if (summary.missingSkillIdCount > 0) failures.push("Some questions are missing skillId");
  if (summary.invalidSkillIdCount > 0) failures.push("Some questions use skillId values not present in SKILL_GRAPH");
  if (summary.duplicateQuestionIdGroups > 0) failures.push("Duplicate questionId values found");
  if (summary.totalGap > 0) failures.push("Skill coverage has remaining gaps");
  if (summary.generatedFallbackCount > 0) failures.push("Some DB questions only map through generated fallback skills");
  if (!indexStatus.hasQuestionIdUnique) failures.push("Missing unique index on questionId");
  if (!indexStatus.hasSkillId) failures.push("Missing index on skillId");
  if (!indexStatus.hasTopicSubtopic) failures.push("Missing compound index on topic/subtopic");
  if (!indexStatus.hasDifficulty) failures.push("Missing index on difficulty");

  return {
    generatedAt: new Date().toISOString(),
    ok: failures.length === 0,
    failures,
    summary,
    duplicateQuestionIds,
    missingQuestionId,
    missingSkillId,
    invalidSkillIds,
    generatedFallbacks,
    skills,
    indexDetails: indexStatus.indexes,
  };
};

const run = async () => {
  const report = await buildAuditReport();

  console.log("Question bank audit summary:");
  console.log(JSON.stringify(report.summary, null, 2));

  if (report.failures.length) {
    console.log("\nFailures:");
    for (const failure of report.failures) {
      console.log(`- ${failure}`);
    }
  } else {
    console.log("\nQuestion bank audit passed.");
  }

  if (args.has("--write")) {
    const reportPath = writeFile("backend/tests/QUESTION_BANK_AUDIT.json", JSON.stringify(report, null, 2));
    console.log(`\nWrote audit report: ${reportPath}`);
  }

  await mongoose.disconnect();

  if (!report.ok) {
    process.exit(1);
  }
};

run().catch(async (error) => {
  console.error("Question bank audit failed:", error);
  await mongoose.disconnect();
  process.exit(1);
});

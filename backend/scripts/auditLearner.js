import fs from "fs";
import path from "path";

import dotenv from "dotenv";
import mongoose from "mongoose";

import Attempt from "../models/attempt.model.js";
import KnowledgeCoverage from "../models/knowledgeCoverage.model.js";
import Memory from "../models/memory.model.js";
import QuestionExposure from "../models/questionExposure.model.js";
import Session from "../models/session.model.js";
import Skill from "../models/skill.model.js";
import { getQuestionSkill, SKILL_GRAPH } from "../data/skillGraph.js";
import {
  calculateAverageMastery,
  calculateRecentAccuracy,
  countCoveredSkills,
  detectLearnerStage,
  getLastSelectionReport,
  getSessionQuestions,
} from "../services/questionSelection.service.js";

dotenv.config();

const args = process.argv.slice(2);
const userId = args.find((arg) => !arg.startsWith("--")) || "guest";
const shouldWrite = args.includes("--write");

const writeFile = (filePath, content) => {
  const absolutePath = path.resolve(filePath);
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
  fs.writeFileSync(absolutePath, content);
  return absolutePath;
};

const asPercent = (value) => {
  if (typeof value !== "number") return null;
  return Math.round(value * 1000) / 10;
};

const groupBySkill = (records = []) => {
  const groups = new Map();

  for (const record of records) {
    const skill = getQuestionSkill(record);
    const current = groups.get(skill.skillId) || {
      skillId: skill.skillId,
      skillName: skill.skillName,
      attempts: 0,
      correct: 0,
      latestAt: null,
    };

    current.attempts += 1;
    if (record.isCorrect) current.correct += 1;
    const createdAt = record.createdAt ? new Date(record.createdAt) : null;
    if (createdAt && (!current.latestAt || createdAt > new Date(current.latestAt))) {
      current.latestAt = createdAt.toISOString();
    }
    groups.set(skill.skillId, current);
  }

  return [...groups.values()].map((group) => ({
    ...group,
    accuracy: group.attempts > 0 ? group.correct / group.attempts : 0,
  }));
};

const buildSkillMasteryLookup = (skills = []) => {
  const totals = {};
  const counts = {};

  for (const skillRecord of skills) {
    const skill = getQuestionSkill(skillRecord);
    const mastery = typeof skillRecord.mastery === "number" ? skillRecord.mastery : 0;
    totals[skill.skillId] = (totals[skill.skillId] || 0) + mastery;
    counts[skill.skillId] = (counts[skill.skillId] || 0) + 1;
  }

  return {
    bySkill: Object.keys(totals).reduce((lookup, skillId) => {
      lookup[skillId] = counts[skillId] > 0 ? totals[skillId] / counts[skillId] : 0;
      return lookup;
    }, {}),
  };
};

const buildPrerequisiteBlockers = (coverages = [], skills = []) => {
  const coverageLookup = new Map();
  const masteryLookup = buildSkillMasteryLookup(skills);

  for (const coverage of coverages) {
    const skill = getQuestionSkill(coverage);
    const existing = coverageLookup.get(skill.skillId) || { exposureCount: 0 };
    coverageLookup.set(skill.skillId, {
      exposureCount: Math.max(existing.exposureCount || 0, coverage.exposureCount || 0),
    });
  }

  return SKILL_GRAPH.map((skill) => {
    const unmetPrerequisites = (skill.prerequisites || []).filter((prerequisiteSkillId) => {
      const mastery = masteryLookup.bySkill[prerequisiteSkillId];
      const coverage = coverageLookup.get(prerequisiteSkillId);
      return !((typeof mastery === "number" && mastery >= 0.5) || (coverage?.exposureCount || 0) >= 2);
    });

    return {
      skillId: skill.id,
      skillName: skill.name,
      level: skill.level,
      strand: skill.strand,
      prerequisites: skill.prerequisites || [],
      unmetPrerequisites,
      unlocked: unmetPrerequisites.length === 0,
    };
  });
};

const buildReport = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is required for learner audit");
  }

  await mongoose.connect(process.env.MONGO_URI);

  const [sessions, attempts, recentAttempts, skills, memories, coverages, exposures] = await Promise.all([
    Session.find({ userId }).sort({ createdAt: -1 }).lean(),
    Attempt.find({ userId }).sort({ createdAt: -1 }).lean(),
    Attempt.find({ userId }).sort({ createdAt: -1 }).limit(20).lean(),
    Skill.find({ userId }).lean(),
    Memory.find({ userId }).lean(),
    KnowledgeCoverage.find({ userId }).lean(),
    QuestionExposure.find({ userId }).lean(),
  ]);

  const masteryLookup = buildSkillMasteryLookup(skills);
  const weakSkills = Object.entries(masteryLookup.bySkill)
    .filter(([, mastery]) => mastery < 0.4)
    .map(([skillId, mastery]) => ({
      skillId,
      skillName: SKILL_GRAPH.find((skill) => skill.id === skillId)?.name || skillId,
      mastery,
    }))
    .sort((a, b) => a.mastery - b.mastery || a.skillId.localeCompare(b.skillId));

  const strongSkills = Object.entries(masteryLookup.bySkill)
    .filter(([, mastery]) => mastery >= 0.8)
    .map(([skillId, mastery]) => ({
      skillId,
      skillName: SKILL_GRAPH.find((skill) => skill.id === skillId)?.name || skillId,
      mastery,
    }))
    .sort((a, b) => b.mastery - a.mastery || a.skillId.localeCompare(b.skillId));

  const recentAccuracy = calculateRecentAccuracy(recentAttempts);
  const learnerStageMetrics = {
    totalAttemptCount: attempts.length,
    coveredSkillCount: countCoveredSkills(coverages),
    averageMastery: calculateAverageMastery(masteryLookup),
    recentAccuracy,
    weakSkillCount: weakSkills.length,
  };
  const learnerStage = detectLearnerStage(learnerStageMetrics);
  const attemptSkills = groupBySkill(attempts);
  const prerequisiteStatus = buildPrerequisiteBlockers(coverages, skills);
  const unlockedSkills = prerequisiteStatus.filter((skill) => skill.unlocked);
  const blockedSkills = prerequisiteStatus.filter((skill) => !skill.unlocked);
  const dueMemories = memories.filter((memory) => memory.nextReviewDate && new Date(memory.nextReviewDate) <= new Date());
  const lowMemories = memories.filter((memory) => typeof memory.strength === "number" && memory.strength < 0.4);

  const nextQuestions = await getSessionQuestions(userId, 5, { persistExposure: false });
  const selectionReport = getLastSelectionReport();

  return {
    generatedAt: new Date().toISOString(),
    database: mongoose.connection.db.databaseName,
    host: mongoose.connection.host,
    userId,
    summary: {
      learnerStage,
      totalSessions: sessions.length,
      totalAttempts: attempts.length,
      recentAccuracy,
      recentAccuracyPercent: asPercent(recentAccuracy),
      averageMastery: learnerStageMetrics.averageMastery,
      averageMasteryPercent: asPercent(learnerStageMetrics.averageMastery),
      coveredSkillCount: learnerStageMetrics.coveredSkillCount,
      weakSkillCount: weakSkills.length,
      strongSkillCount: strongSkills.length,
      memoryCount: memories.length,
      dueMemoryCount: dueMemories.length,
      lowMemoryCount: lowMemories.length,
      questionExposureCount: exposures.length,
      unlockedSkillCount: unlockedSkills.length,
      blockedSkillCount: blockedSkills.length,
    },
    weakSkills: weakSkills.slice(0, 10),
    strongSkills: strongSkills.slice(0, 10),
    recentAttempts: recentAttempts.slice(0, 10).map((attempt) => ({
      questionId: attempt.questionId,
      skillId: getQuestionSkill(attempt).skillId,
      topic: attempt.topic,
      subtopic: attempt.subtopic,
      difficulty: attempt.difficulty,
      isCorrect: attempt.isCorrect,
      createdAt: attempt.createdAt,
    })),
    attemptedSkills: attemptSkills
      .sort((a, b) => b.attempts - a.attempts || a.skillId.localeCompare(b.skillId))
      .slice(0, 20),
    prerequisiteStatus: {
      unlocked: unlockedSkills.slice(0, 20),
      blocked: blockedSkills.slice(0, 20),
    },
    nextSelectionPreview: {
      learnerStage: selectionReport?.learnerStage,
      stats: selectionReport?.stats,
      difficultyCounts: selectionReport?.difficultyCounts,
      adaptiveInfluence: selectionReport?.adaptiveInfluence,
      selectedQuestionIds: selectionReport?.selectedQuestionIds,
      topReasons: selectionReport?.topReasons,
      questions: nextQuestions.map((question) => ({
        questionId: question.questionId,
        skillId: question.skillId,
        skillName: question.skillName,
        topic: question.topic,
        subtopic: question.subtopic,
        difficulty: question.difficulty,
        reasons: question.reasons,
        unmetPrerequisites: question.unmetPrerequisites || [],
        stageBias: question.stageBias || 0,
      })),
    },
  };
};

const run = async () => {
  const report = await buildReport();

  console.log("Learner audit summary:");
  console.log(JSON.stringify(report.summary, null, 2));
  console.log("\nWeak skills:");
  console.log(JSON.stringify(report.weakSkills, null, 2));
  console.log("\nStrong skills:");
  console.log(JSON.stringify(report.strongSkills, null, 2));
  console.log("\nNext selection preview:");
  console.log(JSON.stringify(report.nextSelectionPreview, null, 2));

  if (shouldWrite) {
    const reportPath = writeFile(`backend/tests/LEARNER_AUDIT_${userId}.json`, JSON.stringify(report, null, 2));
    console.log(`\nWrote learner audit report: ${reportPath}`);
  }

  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error("Learner audit failed:", error);
  await mongoose.disconnect();
  process.exit(1);
});

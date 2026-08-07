import fs from "fs";
import path from "path";

import dotenv from "dotenv";
import mongoose from "mongoose";

import localQuestions from "../data/questions.js";
import Question from "../models/question.model.js";
import { getQuestionSkill } from "../data/skillGraph.js";
import { CHOICE_QUESTION_TYPES, getOptionText, inferQuestionType } from "../utils/questionType.js";

dotenv.config();

const args = new Set(process.argv.slice(2));

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

const unique = (items) => [...new Set(items.filter(Boolean))];

const buildGeneratedOptionPreview = (question, questions) => {
  const inferredType = inferQuestionType(question);
  if (!CHOICE_QUESTION_TYPES.has(inferredType) || !question.correctAnswer) return [];

  const correctAnswer = String(question.correctAnswer).trim();
  const skillId = getQuestionSkill(question).skillId;
  const sameSkillAnswers = questions
    .filter((candidate) => getQuestionSkill(candidate).skillId === skillId)
    .map((candidate) => candidate.correctAnswer);
  const sameTopicAnswers = questions
    .filter((candidate) => candidate.topic === question.topic)
    .map((candidate) => candidate.correctAnswer);
  const fallbackAnswers = questions.map((candidate) => candidate.correctAnswer);

  const distractors = unique([...sameSkillAnswers, ...sameTopicAnswers, ...fallbackAnswers].map((answer) => String(answer || "").trim()))
    .filter((answer) => answer && answer.toLowerCase() !== correctAnswer.toLowerCase())
    .slice(0, 3);

  return [correctAnswer, ...distractors];
};

const buildQuestionTypeAudit = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is required for question type audit");
  }

  await mongoose.connect(process.env.MONGO_URI);

  const db = mongoose.connection.db.databaseName;
  const host = mongoose.connection.host;
  const dbQuestions = await Question.find({}).sort({ questionId: 1 }).lean();
  const questions = dbQuestions.length > 0 ? dbQuestions : localQuestions;
  const source = dbQuestions.length > 0 ? "atlas" : "local";

  const questionReports = questions.map((question) => {
    const explicitType = question.questionType || "";
    const inferredType = inferQuestionType(question);
    const options = (question.options || []).map(getOptionText).filter(Boolean);
    const generatedOptions = buildGeneratedOptionPreview(question, questions);
    const action = [];

    if (!explicitType) {
      action.push("add_question_type");
    } else if (explicitType !== inferredType) {
      action.push("review_type_mismatch");
    }

    if (CHOICE_QUESTION_TYPES.has(inferredType) && options.length < 3) {
      action.push("add_options");
    }

    if (inferredType === "fill_in_blank" && options.length > 0) {
      action.push("remove_or_ignore_options");
    }

    return {
      questionId: question.questionId || String(question._id),
      questionText: question.questionText,
      skillId: getQuestionSkill(question).skillId,
      topic: question.topic,
      subtopic: question.subtopic,
      explicitType: explicitType || null,
      inferredType,
      hasExplicitType: Boolean(explicitType),
      optionCount: options.length,
      generatedOptionPreview: generatedOptions,
      action: action.length > 0 ? action : ["ok"],
    };
  });

  const actionCounts = countBy(
    questionReports.flatMap((question) => question.action),
    (action) => action
  );

  const summary = {
    source,
    database: db,
    host,
    questionCount: questions.length,
    localSeedQuestionCount: localQuestions.length,
    explicitTypeCount: questionReports.filter((question) => question.hasExplicitType).length,
    missingExplicitTypeCount: questionReports.filter((question) => !question.hasExplicitType).length,
    inferredTypeCounts: countBy(questionReports, (question) => question.inferredType),
    choiceQuestionCount: questionReports.filter((question) => CHOICE_QUESTION_TYPES.has(question.inferredType)).length,
    typedQuestionCount: questionReports.filter((question) => question.inferredType === "fill_in_blank").length,
    choiceQuestionsMissingOptions: questionReports.filter(
      (question) => CHOICE_QUESTION_TYPES.has(question.inferredType) && question.optionCount < 3
    ).length,
    typeMismatchCount: questionReports.filter(
      (question) => question.explicitType && question.explicitType !== question.inferredType
    ).length,
    actionCounts,
  };

  return {
    generatedAt: new Date().toISOString(),
    summary,
    needsReview: questionReports.filter((question) => !question.action.includes("ok")),
    questions: questionReports,
  };
};

const buildMarkdownReport = (report) => {
  const lines = [
    "# Question Type Audit",
    "",
    `Generated: ${report.generatedAt}`,
    "",
    "## Summary",
    "",
    `- Source: ${report.summary.source}`,
    `- Questions: ${report.summary.questionCount}`,
    `- Explicit questionType count: ${report.summary.explicitTypeCount}`,
    `- Missing explicit questionType count: ${report.summary.missingExplicitTypeCount}`,
    `- Choice questions missing options: ${report.summary.choiceQuestionsMissingOptions}`,
    `- Type mismatches: ${report.summary.typeMismatchCount}`,
    "",
    "## Inferred Type Counts",
    "",
    ...Object.entries(report.summary.inferredTypeCounts).map(([type, count]) => `- ${type}: ${count}`),
    "",
    "## Action Counts",
    "",
    ...Object.entries(report.summary.actionCounts).map(([action, count]) => `- ${action}: ${count}`),
    "",
    "## First 25 Review Items",
    "",
    "| Question ID | Inferred Type | Actions | Question |",
    "|---|---|---|---|",
    ...report.needsReview.slice(0, 25).map((question) =>
      `| ${question.questionId} | ${question.inferredType} | ${question.action.join(", ")} | ${question.questionText.replace(/\|/g, "\\|")} |`
    ),
    "",
  ];

  return lines.join("\n");
};

const run = async () => {
  const report = await buildQuestionTypeAudit();

  console.log("Question type audit summary:");
  console.log(JSON.stringify(report.summary, null, 2));

  if (args.has("--write")) {
    const jsonPath = writeFile("backend/tests/QUESTION_TYPE_AUDIT.json", JSON.stringify(report, null, 2));
    const markdownPath = writeFile("backend/tests/QUESTION_TYPE_AUDIT.md", buildMarkdownReport(report));
    console.log(`\nWrote JSON report: ${jsonPath}`);
    console.log(`Wrote Markdown report: ${markdownPath}`);
  }

  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error("Question type audit failed:", error);
  await mongoose.disconnect();
  process.exit(1);
});

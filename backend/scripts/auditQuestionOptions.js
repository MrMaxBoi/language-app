import fs from "fs";
import path from "path";

import dotenv from "dotenv";
import mongoose from "mongoose";

import localQuestions from "../data/questions.js";
import Question from "../models/question.model.js";
import { getQuestionSkill } from "../data/skillGraph.js";
import { CHOICE_QUESTION_TYPES, getOptionText } from "../utils/questionType.js";
import { generateOptionDraft } from "../utils/questionOptions.js";

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

const buildQuestionOptionAudit = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is required for question option audit");
  }

  await mongoose.connect(process.env.MONGO_URI);

  const db = mongoose.connection.db.databaseName;
  const host = mongoose.connection.host;
  const dbQuestions = await Question.find({}).sort({ questionId: 1 }).lean();
  const questions = dbQuestions.length > 0 ? dbQuestions : localQuestions;
  const source = dbQuestions.length > 0 ? "atlas" : "local";
  const choiceQuestions = questions.filter((question) => CHOICE_QUESTION_TYPES.has(question.questionType));

  const questionReports = choiceQuestions.map((question) => {
    const existingOptions = (question.options || []).map(getOptionText).filter(Boolean);
    const draft = generateOptionDraft(question, questions);

    return {
      questionId: question.questionId || String(question._id),
      questionText: question.questionText,
      topic: question.topic,
      subtopic: question.subtopic,
      skillId: getQuestionSkill(question).skillId,
      questionType: question.questionType,
      correctAnswer: question.correctAnswer,
      existingOptionCount: existingOptions.length,
      answerStyle: draft.answerStyle,
      suggestedOptions: draft.options,
      warnings: draft.warnings,
      recommendation: draft.recommendation,
      source: draft.source,
    };
  });

  const summary = {
    source,
    database: db,
    host,
    totalQuestions: questions.length,
    choiceQuestionCount: choiceQuestions.length,
    existingOptionsReadyCount: questionReports.filter((question) => question.source === "existing_options").length,
    missingOptionsCount: questionReports.filter((question) => question.existingOptionCount < 4).length,
    recommendationCounts: countBy(questionReports, (question) => question.recommendation),
    warningCounts: countBy(
      questionReports.flatMap((question) => question.warnings.length ? question.warnings : ["none"]),
      (warning) => warning
    ),
    answerStyleCounts: countBy(questionReports, (question) => question.answerStyle),
    byQuestionType: countBy(questionReports, (question) => question.questionType),
  };

  return {
    generatedAt: new Date().toISOString(),
    summary,
    autoReady: questionReports.filter((question) => question.recommendation === "auto_ready"),
    needsReview: questionReports.filter((question) => question.recommendation === "needs_review"),
    manualOnly: questionReports.filter((question) => question.recommendation === "manual_only"),
    questions: questionReports,
  };
};

const optionText = (options) => options.join(" / ").replace(/\|/g, "\\|");

const buildMarkdownSection = (title, questions, limit = 30) => [
  `## ${title}`,
  "",
  "| Question ID | Type | Style | Warnings | Suggested Options | Question |",
  "|---|---|---|---|---|---|",
  ...questions.slice(0, limit).map((question) =>
    `| ${question.questionId} | ${question.questionType} | ${question.answerStyle} | ${question.warnings.join(", ") || "none"} | ${optionText(question.suggestedOptions)} | ${question.questionText.replace(/\|/g, "\\|")} |`
  ),
  "",
];

const buildMarkdownReport = (report) => {
  const lines = [
    "# Question Option Audit",
    "",
    `Generated: ${report.generatedAt}`,
    "",
    "## Summary",
    "",
    `- Source: ${report.summary.source}`,
    `- Total questions: ${report.summary.totalQuestions}`,
    `- Choice questions: ${report.summary.choiceQuestionCount}`,
    `- Missing options: ${report.summary.missingOptionsCount}`,
    "",
    "## Recommendation Counts",
    "",
    ...Object.entries(report.summary.recommendationCounts).map(([recommendation, count]) => `- ${recommendation}: ${count}`),
    "",
    "## Warning Counts",
    "",
    ...Object.entries(report.summary.warningCounts).map(([warning, count]) => `- ${warning}: ${count}`),
    "",
    ...buildMarkdownSection("Auto Ready Samples", report.autoReady, 20),
    ...buildMarkdownSection("Needs Review Samples", report.needsReview, 40),
    ...buildMarkdownSection("Manual Only Samples", report.manualOnly, 40),
  ];

  return lines.join("\n");
};

const run = async () => {
  const report = await buildQuestionOptionAudit();

  console.log("Question option audit summary:");
  console.log(JSON.stringify(report.summary, null, 2));

  if (args.has("--write")) {
    const jsonPath = writeFile("backend/tests/QUESTION_OPTION_AUDIT.json", JSON.stringify(report, null, 2));
    const markdownPath = writeFile("backend/tests/QUESTION_OPTION_AUDIT.md", buildMarkdownReport(report));
    console.log(`\nWrote JSON report: ${jsonPath}`);
    console.log(`Wrote Markdown report: ${markdownPath}`);
  }

  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error("Question option audit failed:", error);
  await mongoose.disconnect();
  process.exit(1);
});

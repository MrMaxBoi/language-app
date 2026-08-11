import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";

import dotenv from "dotenv";
import mongoose from "mongoose";

import Question from "../models/question.model.js";
import { CHOICE_QUESTION_TYPES } from "../utils/questionType.js";

dotenv.config();

const applyChanges = process.argv.includes("--apply");
const questionSourceDirectory = path.resolve("backend/data/questions");

const listQuestionPackFiles = (directory) =>
  fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);

    if (entry.isDirectory()) return listQuestionPackFiles(entryPath);
    if (entry.name === "index.js" || !entry.name.endsWith(".js")) return [];
    return [entryPath];
  });

const normalizeOptions = (options = []) =>
  options.map((option) => ({
    text: String(option?.text || "").trim(),
    isCorrect: Boolean(option?.isCorrect),
  }));

const comparableBaseQuestion = (question, idField) => ({
  questionId: String(question[idField] || ""),
  questionText: question.questionText,
  correctAnswer: question.correctAnswer,
  topic: question.topic,
  subtopic: question.subtopic,
  skillId: question.skillId,
  difficulty: question.difficulty,
  tags: question.tags || [],
  explanation: question.explanation,
  learningObjective: question.learningObjective,
  commonMistakes: question.commonMistakes || [],
  lessonIds: question.lessonIds || [],
  conceptIds: question.conceptIds || [],
});

const buildCanonicalQuestion = (localQuestion, databaseQuestion) => {
  const { _id, questionText, correctAnswer, questionType, options, ...remainingFields } = localQuestion;
  const canonicalOptions = CHOICE_QUESTION_TYPES.has(databaseQuestion.questionType)
    ? normalizeOptions(databaseQuestion.options)
    : [];

  return {
    _id,
    questionText,
    questionType: databaseQuestion.questionType,
    options: canonicalOptions,
    correctAnswer,
    ...remainingFields,
  };
};

const formatPack = (filePath, questions) => {
  const existingSource = fs.readFileSync(filePath, "utf8");
  const heading = existingSource.split("\n", 1)[0];

  return `${heading}\nconst questions = ${JSON.stringify(questions, null, 2)};\n\nexport default questions;\n`;
};

const run = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is required to sync question source metadata");
  }

  const packFiles = listQuestionPackFiles(questionSourceDirectory).sort();
  const packs = [];

  for (const filePath of packFiles) {
    const module = await import(pathToFileURL(filePath).href);
    const questions = module.default;

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error(`Question pack is empty or invalid: ${filePath}`);
    }

    const skillIds = new Set(questions.map((question) => question.skillId));
    if (skillIds.size !== 1) {
      throw new Error(`Question pack contains multiple skills: ${filePath}`);
    }

    packs.push({ filePath, questions });
  }

  const localQuestions = packs.flatMap((pack) => pack.questions);
  const localIds = localQuestions.map((question) => question._id);

  await mongoose.connect(process.env.MONGO_URI);

  const databaseQuestions = await Question.find({ questionId: { $in: localIds } }).lean();
  const databaseById = new Map(
    databaseQuestions.map((question) => [question.questionId, question])
  );
  const missingInAtlas = localIds.filter((questionId) => !databaseById.has(questionId));
  const sourceMismatches = [];
  const changedQuestionIds = [];
  let copiedOptionSets = 0;

  for (const localQuestion of localQuestions) {
    const databaseQuestion = databaseById.get(localQuestion._id);
    if (!databaseQuestion) continue;

    const localBase = comparableBaseQuestion(localQuestion, "_id");
    const databaseBase = comparableBaseQuestion(databaseQuestion, "questionId");

    if (JSON.stringify(localBase) !== JSON.stringify(databaseBase)) {
      sourceMismatches.push(localQuestion._id);
      continue;
    }

    const canonicalQuestion = buildCanonicalQuestion(localQuestion, databaseQuestion);
    if (JSON.stringify(canonicalQuestion) !== JSON.stringify(localQuestion)) {
      changedQuestionIds.push(localQuestion._id);
    }

    if (canonicalQuestion.options.length > 0) copiedOptionSets += 1;
  }

  const atlasOnlyQuestionIds = await Question.find({ questionId: { $nin: localIds } })
    .distinct("questionId");

  const summary = {
    dryRun: !applyChanges,
    packCount: packs.length,
    localQuestionCount: localQuestions.length,
    atlasQuestionCount: databaseQuestions.length + atlasOnlyQuestionIds.length,
    matchedQuestionCount: databaseQuestions.length,
    missingInAtlasCount: missingInAtlas.length,
    atlasOnlyCount: atlasOnlyQuestionIds.length,
    baseContentMismatchCount: sourceMismatches.length,
    metadataChangesPrepared: changedQuestionIds.length,
    choiceOptionSetsAvailable: copiedOptionSets,
  };

  console.log("Question source metadata sync summary:");
  console.log(JSON.stringify(summary, null, 2));

  if (missingInAtlas.length > 0) {
    console.log(`\nMissing in Atlas: ${missingInAtlas.join(", ")}`);
  }

  if (atlasOnlyQuestionIds.length > 0) {
    console.log(`\nAtlas-only questions: ${atlasOnlyQuestionIds.join(", ")}`);
  }

  if (sourceMismatches.length > 0) {
    console.log(`\nBase-content mismatches: ${sourceMismatches.join(", ")}`);
  }

  const hasBlockingDifferences =
    missingInAtlas.length > 0 ||
    atlasOnlyQuestionIds.length > 0 ||
    sourceMismatches.length > 0;

  if (hasBlockingDifferences) {
    throw new Error("Source metadata sync stopped because local and Atlas base content differ");
  }

  if (applyChanges) {
    for (const pack of packs) {
      const canonicalQuestions = pack.questions.map((localQuestion) =>
        buildCanonicalQuestion(localQuestion, databaseById.get(localQuestion._id))
      );
      fs.writeFileSync(pack.filePath, formatPack(pack.filePath, canonicalQuestions));
    }

    console.log(`\nUpdated ${packs.length} source packs`);
  } else {
    console.log("\nDry run only. Use `npm run sync:question-source` to update local packs.");
  }

  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error("Question source metadata sync failed:", error);
  await mongoose.disconnect();
  process.exit(1);
});

import dotenv from "dotenv";
import mongoose from "mongoose";

import { CURATED_QUESTION_OPTIONS } from "../data/curatedQuestionOptions.js";
import Question from "../models/question.model.js";

dotenv.config();

const applyMigration = process.argv.includes("--apply");

const hashString = (value) =>
  String(value || "")
    .split("")
    .reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 0);

const rotateOptions = (options, questionId) => {
  if (!options.length) return options;
  const offset = hashString(questionId) % options.length;
  return [...options.slice(offset), ...options.slice(0, offset)];
};

const normalize = (value) => String(value || "").trim();

const buildOptionDocs = ({ questionId, correctAnswer, options }) => {
  const correct = normalize(correctAnswer).toLowerCase();
  return rotateOptions(options.map(normalize), questionId).map((option) => ({
    text: option,
    isCorrect: option.toLowerCase() === correct,
  }));
};

const run = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is required for curated option migration");
  }

  await mongoose.connect(process.env.MONGO_URI);

  const curatedEntries = Object.entries(CURATED_QUESTION_OPTIONS);
  const questionIds = curatedEntries.map(([questionId]) => questionId);
  const questions = await Question.find({ questionId: { $in: questionIds } }).lean();
  const questionLookup = questions.reduce((lookup, question) => {
    lookup[question.questionId] = question;
    return lookup;
  }, {});

  const missingQuestions = questionIds.filter((questionId) => !questionLookup[questionId]);
  const invalid = [];
  const updates = [];

  for (const [questionId, options] of curatedEntries) {
    const question = questionLookup[questionId];
    if (!question) continue;

    const normalizedOptions = [...new Set(options.map(normalize).filter(Boolean))];
    const correctAnswer = normalize(question.correctAnswer);
    const hasCorrectAnswer = normalizedOptions.some(
      (option) => option.toLowerCase() === correctAnswer.toLowerCase()
    );

    if (normalizedOptions.length !== 4 || !hasCorrectAnswer) {
      invalid.push({
        questionId,
        optionCount: normalizedOptions.length,
        correctAnswer,
        options: normalizedOptions,
      });
      continue;
    }

    updates.push({
      questionId,
      questionText: question.questionText,
      correctAnswer,
      options: buildOptionDocs({ questionId, correctAnswer, options: normalizedOptions }),
    });
  }

  const summary = {
    dryRun: !applyMigration,
    curatedEntries: curatedEntries.length,
    questionsFound: questions.length,
    missingQuestions: missingQuestions.length,
    invalidOptionSets: invalid.length,
    updatesPrepared: updates.length,
  };

  console.log("Curated option migration summary:");
  console.log(JSON.stringify(summary, null, 2));

  if (missingQuestions.length) {
    console.log("\nMissing questions:");
    missingQuestions.forEach((questionId) => console.log(`- ${questionId}`));
  }

  if (invalid.length) {
    console.log("\nInvalid curated option sets:");
    invalid.forEach((item) =>
      console.log(`- ${item.questionId}: correct=${item.correctAnswer}, options=${item.options.join(" / ")}`)
    );
  }

  if (updates.length) {
    console.log("\nFirst 25 curated updates:");
    for (const update of updates.slice(0, 25)) {
      console.log(`- ${update.questionId}: ${update.options.map((option) => option.text).join(" / ")} | ${update.questionText}`);
    }
  }

  if (applyMigration && updates.length && invalid.length === 0 && missingQuestions.length === 0) {
    const result = await Question.bulkWrite(
      updates.map((update) => ({
        updateOne: {
          filter: { questionId: update.questionId },
          update: { $set: { options: update.options } },
        },
      })),
      { ordered: false }
    );

    console.log("\nMigration applied:");
    console.log({
      matched: result.matchedCount || 0,
      modified: result.modifiedCount || 0,
    });
  } else if (!applyMigration) {
    console.log("\nDry run only. Run `npm run migrate:curated-options` to apply these curated options.");
  } else if (invalid.length || missingQuestions.length) {
    console.log("\nMigration not applied because curated data has validation issues.");
    process.exitCode = 1;
  }

  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error("Curated option migration failed:", error);
  await mongoose.disconnect();
  process.exit(1);
});

import dotenv from "dotenv";
import mongoose from "mongoose";

import Question from "../models/question.model.js";
import { generateOptionDraft } from "../utils/questionOptions.js";

dotenv.config();

const applyMigration = process.argv.includes("--apply");

const countBy = (items, getKey) =>
  items.reduce((lookup, item) => {
    const key = getKey(item);
    lookup[key] = (lookup[key] || 0) + 1;
    return lookup;
  }, {});

const hashString = (value) =>
  String(value || "")
    .split("")
    .reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0, 0);

const rotateOptions = (options, questionId) => {
  if (!options.length) return options;
  const offset = hashString(questionId) % options.length;
  return [...options.slice(offset), ...options.slice(0, offset)];
};

const buildOptionDocs = ({ questionId, correctAnswer, options }) => {
  const correct = String(correctAnswer || "").trim().toLowerCase();
  return rotateOptions(options, questionId).map((option) => ({
    text: option,
    isCorrect: String(option || "").trim().toLowerCase() === correct,
  }));
};

const run = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is required for question option migration");
  }

  await mongoose.connect(process.env.MONGO_URI);

  const questions = await Question.find({}).sort({ questionId: 1 }).lean();
  const candidates = questions
    .map((question) => {
      const existingOptionCount = question.options?.length || 0;
      const draft = generateOptionDraft(question, questions);
      if (draft.recommendation !== "auto_ready" || existingOptionCount >= 4) return null;

      return {
        questionId: question.questionId || String(question._id),
        questionText: question.questionText,
        questionType: question.questionType,
        correctAnswer: question.correctAnswer,
        answerStyle: draft.answerStyle,
        options: buildOptionDocs({
          questionId: question.questionId || String(question._id),
          correctAnswer: question.correctAnswer,
          options: draft.options,
        }),
      };
    })
    .filter(Boolean);

  const summary = {
    dryRun: !applyMigration,
    questionCount: questions.length,
    autoReadyOptionsPrepared: candidates.length,
    byQuestionType: countBy(candidates, (question) => question.questionType),
    byAnswerStyle: countBy(candidates, (question) => question.answerStyle),
  };

  console.log("Question option migration summary:");
  console.log(JSON.stringify(summary, null, 2));

  if (candidates.length) {
    console.log("\nFirst 25 proposed option updates:");
    for (const candidate of candidates.slice(0, 25)) {
      console.log(
        `- ${candidate.questionId}: ${candidate.options.map((option) => option.text).join(" / ")} | ${candidate.questionText}`
      );
    }
  }

  if (applyMigration && candidates.length) {
    const bulkOps = candidates.map((candidate) => ({
      updateOne: {
        filter: { questionId: candidate.questionId },
        update: { $set: { options: candidate.options } },
      },
    }));

    const result = await Question.bulkWrite(bulkOps, { ordered: false });
    console.log("\nMigration applied:");
    console.log({
      matched: result.matchedCount || 0,
      modified: result.modifiedCount || 0,
    });
  } else if (!applyMigration) {
    console.log("\nDry run only. Run `npm run migrate:question-options` to apply these option updates.");
  }

  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error("Question option migration failed:", error);
  await mongoose.disconnect();
  process.exit(1);
});

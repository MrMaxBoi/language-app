import dotenv from "dotenv";
import mongoose from "mongoose";

import Question from "../models/question.model.js";
import { inferQuestionType } from "../utils/questionType.js";

dotenv.config();

const applyMigration = process.argv.includes("--apply");

const countBy = (items, getKey) =>
  items.reduce((lookup, item) => {
    const key = getKey(item);
    lookup[key] = (lookup[key] || 0) + 1;
    return lookup;
  }, {});

const run = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is required for question type migration");
  }

  await mongoose.connect(process.env.MONGO_URI);

  const questions = await Question.find({}).sort({ questionId: 1 }).lean();
  const changes = questions
    .map((question) => {
      const currentType = question.questionType || null;
      const inferredType = inferQuestionType(question);

      if (currentType === inferredType) return null;

      return {
        questionId: question.questionId || String(question._id),
        questionText: question.questionText,
        currentType,
        inferredType,
      };
    })
    .filter(Boolean);

  const summary = {
    dryRun: !applyMigration,
    questionCount: questions.length,
    changesPrepared: changes.length,
    currentTypeCounts: countBy(questions, (question) => question.questionType || "missing"),
    inferredTypeCounts: countBy(questions, inferQuestionType),
    changeCounts: countBy(changes, (change) => `${change.currentType || "missing"} -> ${change.inferredType}`),
  };

  console.log("Question type migration summary:");
  console.log(JSON.stringify(summary, null, 2));

  if (changes.length) {
    console.log("\nFirst 25 proposed changes:");
    for (const change of changes.slice(0, 25)) {
      console.log(
        `- ${change.questionId}: ${change.currentType || "missing"} -> ${change.inferredType} | ${change.questionText}`
      );
    }
  }

  if (applyMigration && changes.length) {
    const bulkOps = changes.map((change) => ({
      updateOne: {
        filter: { questionId: change.questionId },
        update: { $set: { questionType: change.inferredType } },
      },
    }));

    const result = await Question.bulkWrite(bulkOps, { ordered: false });
    console.log("\nMigration applied:");
    console.log({
      matched: result.matchedCount || 0,
      modified: result.modifiedCount || 0,
    });
  } else if (!applyMigration) {
    console.log("\nDry run only. Run `npm run migrate:question-types` to apply these questionType updates.");
  }

  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error("Question type migration failed:", error);
  await mongoose.disconnect();
  process.exit(1);
});

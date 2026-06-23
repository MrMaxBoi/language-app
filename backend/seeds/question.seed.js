import mongoose from "mongoose";
import dotenv from "dotenv";

import Question from "../models/question.model.js";
import questions from "../data/questions.js";
import { getQuestionSkill } from "../data/skillGraph.js";

dotenv.config();

const shouldReset = process.argv.includes("--reset");
const dryRun = process.argv.includes("--dry-run");

const seedQuestions = async () => {
  try {
    const enrichedQuestions = questions.map((question) => {
      const skill = getQuestionSkill(question);
      const { _id, ...questionData } = question;

      return {
        ...questionData,
        questionId: question.questionId || String(_id),
        skillId: skill.skillId,
        skillName: skill.skillName,
        skillPath: skill.skillPath,
        prerequisiteSkillIds: skill.prerequisiteSkillIds,
        jlptLevel: skill.jlptLevel,
      };
    });

    const duplicateQuestionIds = enrichedQuestions
      .map((question) => question.questionId)
      .filter((questionId, index, questionIds) => questionIds.indexOf(questionId) !== index);

    if (duplicateQuestionIds.length) {
      throw new Error(`Duplicate questionId values found: ${[...new Set(duplicateQuestionIds)].join(", ")}`);
    }

    if (dryRun) {
      console.log(`Dry run: ${enrichedQuestions.length} questions ready to seed`);
      console.log(`Reset mode: ${shouldReset ? "enabled" : "disabled"}`);
      process.exit();
    }

    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is required to seed questions");
    }

    await mongoose.connect(process.env.MONGO_URI);

    if (shouldReset) {
      await Question.deleteMany();
    }

    const result = await Question.bulkWrite(
      enrichedQuestions.map((question) => ({
        updateOne: {
          filter: { questionId: question.questionId },
          update: { $set: question },
          upsert: true,
        },
      }))
    );

    await Question.createIndexes();

    console.log("Questions seeded successfully");
    console.log({
      sourceQuestions: enrichedQuestions.length,
      reset: shouldReset,
      inserted: result.upsertedCount || 0,
      updated: result.modifiedCount || 0,
      matched: result.matchedCount || 0,
    });

    process.exit();
  } catch (error) {
    console.log("Seed error:", error);
    process.exit(1);
  }
};

seedQuestions();

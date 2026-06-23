import mongoose from "mongoose";
import dotenv from "dotenv";

import Attempt from "../models/attempt.model.js";
import KnowledgeCoverage from "../models/knowledgeCoverage.model.js";
import Memory from "../models/memory.model.js";
import Question from "../models/question.model.js";
import Skill from "../models/skill.model.js";
import { getQuestionSkill } from "../data/skillGraph.js";

dotenv.config();

const buildSkillSet = (record) => {
  const skill = getQuestionSkill(record);
  return {
    skillId: skill.skillId,
    skillName: skill.skillName,
    skillPath: skill.skillPath,
    prerequisiteSkillIds: skill.prerequisiteSkillIds,
    jlptLevel: skill.jlptLevel,
  };
};

const backfillCollection = async ({ model, name, buildFilter }) => {
  const records = await model.find({}).lean();
  if (!records.length) {
    console.log(`${name}: no records found`);
    return { name, matched: 0, modified: 0 };
  }

  const ops = records.map((record) => ({
    updateOne: {
      filter: buildFilter(record),
      update: {
        $set: buildSkillSet(record),
      },
    },
  }));

  const result = await model.bulkWrite(ops, { ordered: false });
  const modified = result.modifiedCount || result.nModified || 0;
  console.log(`${name}: checked ${records.length}, modified ${modified}`);
  return { name, matched: records.length, modified };
};

const run = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is required for skill graph backfill");
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB for skill graph backfill");

  const summaries = [];
  summaries.push(
    await backfillCollection({
      model: Question,
      name: "Question",
      buildFilter: (record) => ({ _id: record._id }),
    })
  );
  summaries.push(
    await backfillCollection({
      model: Attempt,
      name: "Attempt",
      buildFilter: (record) => ({ _id: record._id }),
    })
  );
  summaries.push(
    await backfillCollection({
      model: Skill,
      name: "Skill",
      buildFilter: (record) => ({ _id: record._id }),
    })
  );
  summaries.push(
    await backfillCollection({
      model: Memory,
      name: "Memory",
      buildFilter: (record) => ({ _id: record._id }),
    })
  );
  summaries.push(
    await backfillCollection({
      model: KnowledgeCoverage,
      name: "KnowledgeCoverage",
      buildFilter: (record) => ({ _id: record._id }),
    })
  );

  console.log("Backfill summary:", JSON.stringify(summaries, null, 2));
  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error("Skill graph backfill failed:", error);
  await mongoose.disconnect();
  process.exit(1);
});

import mongoose from "mongoose";
import dotenv from "dotenv";

import KnowledgeCoverage from "../models/knowledgeCoverage.model.js";
import Memory from "../models/memory.model.js";
import Skill from "../models/skill.model.js";

dotenv.config();

const shouldApply = process.argv.includes("--apply");

const latestDate = (records, field) =>
  records
    .map((record) => record[field])
    .filter(Boolean)
    .map((value) => new Date(value))
    .sort((a, b) => b - a)[0] || null;

const earliestDate = (records, field) =>
  records
    .map((record) => record[field])
    .filter(Boolean)
    .map((value) => new Date(value))
    .sort((a, b) => a - b)[0] || null;

const getGroups = async (model) => {
  const rows = await model.find({ skillId: { $exists: true, $ne: null } }).lean();
  const groups = new Map();

  for (const row of rows) {
    const key = `${row.userId || "guest"}||${row.skillId}`;
    const current = groups.get(key) || [];
    current.push(row);
    groups.set(key, current);
  }

  return [...groups.values()].filter((records) => records.length > 1);
};

const pickPrimary = (records) =>
  [...records].sort((a, b) => {
    const aUpdated = new Date(a.updatedAt || a.lastUpdated || a.lastSeenAt || a.lastReviewed || 0);
    const bUpdated = new Date(b.updatedAt || b.lastUpdated || b.lastSeenAt || b.lastReviewed || 0);
    return bUpdated - aUpdated;
  })[0];

const mergeSkillGroups = async () => {
  const groups = await getGroups(Skill);
  let deletedRows = 0;

  for (const records of groups) {
    const primary = pickPrimary(records);
    const duplicateIds = records
      .filter((record) => record._id.toString() !== primary._id.toString())
      .map((record) => record._id);
    const attempts = records.reduce((sum, record) => sum + (record.attempts || 0), 0);
    const correct = records.reduce((sum, record) => sum + (record.correct || 0), 0);
    const mastery = attempts > 0
      ? Math.max(0, Math.min(1, correct / attempts))
      : Math.max(...records.map((record) => record.mastery || 0));

    if (shouldApply) {
      await Skill.updateOne(
        { _id: primary._id },
        {
          $set: {
            attempts,
            correct,
            mastery,
            skillId: primary.skillId,
            skillName: primary.skillName,
            skillPath: primary.skillPath,
            prerequisiteSkillIds: primary.prerequisiteSkillIds,
            jlptLevel: primary.jlptLevel,
            lastUpdated: latestDate(records, "lastUpdated") || new Date(),
          },
        }
      );
      await Skill.deleteMany({ _id: { $in: duplicateIds } });
    }
    deletedRows += duplicateIds.length;
  }

  return { name: "Skill", duplicateGroups: groups.length, rowsToDelete: deletedRows };
};

const mergeMemoryGroups = async () => {
  const groups = await getGroups(Memory);
  let deletedRows = 0;

  for (const records of groups) {
    const primary = pickPrimary(records);
    const duplicateIds = records
      .filter((record) => record._id.toString() !== primary._id.toString())
      .map((record) => record._id);
    const totalReviews = records.reduce((sum, record) => sum + (record.totalReviews || 0), 0);
    const successfulReviews = records.reduce((sum, record) => sum + (record.successfulReviews || 0), 0);
    const strength = Math.min(...records.map((record) => record.strength ?? 0.3));
    const reviewInterval = Math.min(...records.map((record) => record.reviewInterval || 1));

    if (shouldApply) {
      await Memory.updateOne(
        { _id: primary._id },
        {
          $set: {
            strength,
            reviewInterval,
            nextReviewDate: earliestDate(records, "nextReviewDate") || new Date(),
            lastReviewed: latestDate(records, "lastReviewed") || new Date(),
            totalReviews,
            successfulReviews,
            skillId: primary.skillId,
            skillName: primary.skillName,
            skillPath: primary.skillPath,
            prerequisiteSkillIds: primary.prerequisiteSkillIds,
            jlptLevel: primary.jlptLevel,
          },
        }
      );
      await Memory.deleteMany({ _id: { $in: duplicateIds } });
    }
    deletedRows += duplicateIds.length;
  }

  return { name: "Memory", duplicateGroups: groups.length, rowsToDelete: deletedRows };
};

const mergeCoverageGroups = async () => {
  const groups = await getGroups(KnowledgeCoverage);
  let deletedRows = 0;

  for (const records of groups) {
    const primary = pickPrimary(records);
    const duplicateIds = records
      .filter((record) => record._id.toString() !== primary._id.toString())
      .map((record) => record._id);
    const exposureCount = records.reduce((sum, record) => sum + (record.exposureCount || 0), 0);
    const mastery = records.length
      ? records.reduce((sum, record) => sum + (record.mastery || 0), 0) / records.length
      : 0;

    if (shouldApply) {
      await KnowledgeCoverage.updateOne(
        { _id: primary._id },
        {
          $set: {
            exposureCount,
            mastery,
            lastSeenAt: latestDate(records, "lastSeenAt"),
            skillId: primary.skillId,
            skillName: primary.skillName,
            skillPath: primary.skillPath,
            prerequisiteSkillIds: primary.prerequisiteSkillIds,
            jlptLevel: primary.jlptLevel,
          },
        }
      );
      await KnowledgeCoverage.deleteMany({ _id: { $in: duplicateIds } });
    }
    deletedRows += duplicateIds.length;
  }

  return { name: "KnowledgeCoverage", duplicateGroups: groups.length, rowsToDelete: deletedRows };
};

const run = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is required for duplicate merge");
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log(`Connected to MongoDB for skill graph duplicate ${shouldApply ? "merge" : "dry run"}`);

  const summaries = [
    await mergeSkillGroups(),
    await mergeMemoryGroups(),
    await mergeCoverageGroups(),
  ];

  console.log(`${shouldApply ? "Merge" : "Dry run"} summary:`, JSON.stringify(summaries, null, 2));
  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error("Skill graph duplicate merge failed:", error);
  await mongoose.disconnect();
  process.exit(1);
});

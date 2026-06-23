import mongoose from "mongoose";
import dotenv from "dotenv";

import KnowledgeCoverage from "../models/knowledgeCoverage.model.js";
import Memory from "../models/memory.model.js";
import Skill from "../models/skill.model.js";

dotenv.config();

const groupDuplicates = async ({ model, name }) => {
  const rows = await model.find({ skillId: { $exists: true, $ne: null } }).lean();
  const groups = new Map();

  for (const row of rows) {
    const key = `${row.userId || "guest"}||${row.skillId}`;
    const current = groups.get(key) || [];
    current.push(row);
    groups.set(key, current);
  }

  const duplicates = [...groups.entries()]
    .filter(([, records]) => records.length > 1)
    .map(([key, records]) => {
      const [userId, skillId] = key.split("||");
      const first = records[0] || {};
      return {
        userId,
        skillId,
        skillName: first.skillName,
        count: records.length,
        legacyPairs: records.map((record) => ({
          id: record._id.toString(),
          topic: record.topic,
          subtopic: record.subtopic,
          attempts: record.attempts,
          correct: record.correct,
          exposureCount: record.exposureCount,
          strength: record.strength,
          totalReviews: record.totalReviews,
        })),
      };
    })
    .sort((a, b) => b.count - a.count || a.skillId.localeCompare(b.skillId));

  return {
    name,
    totalRows: rows.length,
    duplicateGroups: duplicates.length,
    duplicateRows: duplicates.reduce((sum, group) => sum + group.count, 0),
    duplicates,
  };
};

const run = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is required for duplicate audit");
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB for skill graph duplicate audit");

  const reports = [
    await groupDuplicates({ model: Skill, name: "Skill" }),
    await groupDuplicates({ model: Memory, name: "Memory" }),
    await groupDuplicates({ model: KnowledgeCoverage, name: "KnowledgeCoverage" }),
  ];

  for (const report of reports) {
    console.log(
      `${report.name}: ${report.duplicateGroups} duplicate groups, ${report.duplicateRows} rows involved out of ${report.totalRows}`
    );
    for (const group of report.duplicates.slice(0, 10)) {
      console.log(
        `  - ${group.userId} / ${group.skillId} (${group.skillName || "unnamed"}): ${group.count} rows`
      );
      for (const pair of group.legacyPairs.slice(0, 5)) {
        console.log(`      ${pair.topic} / ${pair.subtopic} [${pair.id}]`);
      }
    }
  }

  console.log("Duplicate audit JSON:", JSON.stringify(reports, null, 2));
  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error("Skill graph duplicate audit failed:", error);
  await mongoose.disconnect();
  process.exit(1);
});

import dotenv from "dotenv";
import mongoose from "mongoose";

import Attempt from "../models/attempt.model.js";
import Session from "../models/session.model.js";

dotenv.config();

const dryRun = process.argv.includes("--dry-run");

const run = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is required for attempt userId backfill");
  }

  await mongoose.connect(process.env.MONGO_URI);

  const attempts = await Attempt.find({
    $or: [{ userId: { $exists: false } }, { userId: null }, { userId: "" }],
  }).lean();

  const sessionIds = [...new Set(attempts.map((attempt) => String(attempt.sessionId)).filter(Boolean))];
  const sessions = await Session.find({ _id: { $in: sessionIds } }).lean();
  const sessionUserLookup = sessions.reduce((lookup, session) => {
    lookup[String(session._id)] = session.userId || "guest";
    return lookup;
  }, {});

  const bulkOps = attempts
    .map((attempt) => {
      const userId = sessionUserLookup[String(attempt.sessionId)];
      if (!userId) return null;
      return {
        updateOne: {
          filter: { _id: attempt._id },
          update: { $set: { userId } },
        },
      };
    })
    .filter(Boolean);

  console.log({
    dryRun,
    attemptsMissingUserId: attempts.length,
    sessionsFound: sessions.length,
    updatesPrepared: bulkOps.length,
  });

  if (!dryRun && bulkOps.length) {
    const result = await Attempt.bulkWrite(bulkOps);
    console.log({
      matched: result.matchedCount || 0,
      modified: result.modifiedCount || 0,
    });
  }

  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error("Attempt userId backfill failed:", error);
  await mongoose.disconnect();
  process.exit(1);
});

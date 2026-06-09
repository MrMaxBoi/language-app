import dotenv from "dotenv";
import fs from "fs";
import mongoose from "mongoose";

import Session from "../models/session.model.js";
import Question from "../models/question.model.js";
import Skill from "../models/skill.model.js";
import Memory from "../models/memory.model.js";
import KnowledgeCoverage from "../models/knowledgeCoverage.model.js";

import mockQuestions from "../data/questions.js";

import { getSessionQuestions } from "../services/questionSelection.service.js";
import * as SessionController from "../controllers/session.controller.js";

dotenv.config();

const MONGO = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/language-app-test";

const learnerProfiles = {
  learnerA: {
    vocabulary: 0.8,
    grammar: 0.8,
    particles: 0.2,
    travel: 0.1,
    verbs: 0.6,
  },
  learnerB: {
    vocabulary: 0.2,
    grammar: 0.3,
    particles: 0.9,
    travel: 0.8,
    verbs: 0.4,
  },
  beginner: {
    default: 0.25,
  },
  advanced: {
    default: 0.8,
  },
};

const DEFAULT_SESSION_COUNT = parseInt(process.env.SIM_SESSIONS, 10) || 100;

const fakeResFactory = () => {
  let statusCode = 200;
  let body = null;
  return {
    status(code) {
      statusCode = code;
      return this;
    },
    json(payload) {
      body = payload;
      return payload;
    },
    _get() {
      return { statusCode, body };
    },
  };
};

const ensureConnected = async () => {
  if (mongoose.connection.readyState === 1) return;
  // Avoid passing driver-specific options here; rely on mongoose defaults
  await mongoose.connect(MONGO);
  console.log("Connected to MongoDB for simulation:", MONGO);
};

const buildQuestionComboSet = async () => {
  const db = await Question.find({}).lean();
  const combined = [...db, ...mockQuestions];
  const set = new Set();
  for (const q of combined) {
    const topic = String(q.topic || "unknown").trim();
    const sub = String(q.subtopic || "unknown").trim();
    set.add(`${topic}||${sub}`);
  }
  return { total: set.size, combos: Array.from(set) };
};

const computeCoverageForUser = async (userId, combos) => {
  const coverages = await KnowledgeCoverage.find({ userId }).lean();
  const covered = coverages.filter((c) => (c.exposureCount || 0) >= 3);
  const coveredKeys = covered.map((c) => `${c.topic}||${c.subtopic}`);
  const coveredSet = new Set(coveredKeys);
  const coveragePercent = combos.length === 0 ? 0 : Math.round((coveredSet.size / combos.length) * 100);
  return { coveragePercent, coveredConcepts: Array.from(coveredSet) };
};

const avgSkillMastery = async (userId) => {
  const skills = await Skill.find({ userId }).lean();
  if (!skills.length) return 0;
  const sum = skills.reduce((s, sk) => s + (typeof sk.mastery === "number" ? sk.mastery : 0), 0);
  return sum / skills.length;
};

const avgMemoryStrength = async (userId) => {
  const mems = await Memory.find({ userId }).lean();
  if (!mems.length) return 0;
  const sum = mems.reduce((s, m) => s + (typeof m.strength === "number" ? m.strength : 0), 0);
  return sum / mems.length;
};

const runSimulation = async (profileName, sessions = DEFAULT_SESSION_COUNT) => {
  await ensureConnected();

  const userId = `auto_${profileName}`;
  const profile = learnerProfiles[profileName];
  if (!profile) throw new Error(`Unknown profile: ${profileName}`);

  // In-memory learner mastery that drives answer correctness (do not write to Skill/Memory directly)
  const learnerMastery = { ...(profile.default ? { default: profile.default } : {}) };
  for (const k of Object.keys(profile)) learnerMastery[k] = profile[k];

  const questionCombos = await buildQuestionComboSet();

  const timeline = [];
  let totalCorrect = 0;
  let totalIncorrect = 0;
  let totalQuestions = 0;

  const initialAvgSkill = await avgSkillMastery(userId);
  const initialMemory = await avgMemoryStrength(userId);
  const initialCoverage = (await computeCoverageForUser(userId, questionCombos.combos)).coveragePercent;

  for (let i = 1; i <= sessions; i++) {
    // Create a fresh session document (mirrors startSession behaviour)
    const sessionDoc = new Session({ userId });
    await sessionDoc.save();

    // Obtain questions using real engine
    const questions = await getSessionQuestions(userId, 5, { persistExposure: true });

    // Answer each question via real controller submitAnswer
    for (const q of questions) {
      const topic = String(q.topic || "default").trim();
      const mastery = typeof learnerMastery[topic] === "number" ? learnerMastery[topic] : learnerMastery.default || 0.25;

      const noise = Math.random() * 0.15;
      const correctChance = Math.min(mastery + noise, 0.95);
      const isCorrect = Math.random() < correctChance;

      // Find canonical question to supply correctAnswer when needed
      let canonical = null;
      if (mongoose.Types.ObjectId.isValid(q.questionId)) {
        canonical = await Question.findById(q.questionId).lean();
      }
      if (!canonical) canonical = mockQuestions.find((m) => String(m._id) === String(q.questionId));
      const correctAnswer = canonical ? canonical.correctAnswer : "";
      const userAnswer = isCorrect ? correctAnswer : `__incorrect_${Math.random().toString(36).slice(2, 8)}`;

      const req = { params: { id: String(sessionDoc._id) }, body: { questionId: q.questionId, userAnswer } };
      const res = fakeResFactory();
      await SessionController.submitAnswer(req, res);
      const resp = res._get().body;
      if (resp && resp.data && typeof resp.data.isCorrect === "boolean") {
        if (resp.data.isCorrect) totalCorrect++; else totalIncorrect++;
        totalQuestions++;
      }
    }

    // Complete session via controller
    const creq = { params: { id: String(sessionDoc._id) } };
    const cres = fakeResFactory();
    await SessionController.completeSession(creq, cres);
    const cbody = cres._get().body;

    // Post-session: adjust learnerMastery according to learning effect rules
    if (cbody && cbody.data && Array.isArray(cbody.data.answers)) {
      for (const attempt of cbody.data.answers) {
        const topic = String(attempt.topic || "default").trim();
        const key = topic;
        const current = typeof learnerMastery[key] === "number" ? learnerMastery[key] : learnerMastery.default || 0.25;
        const delta = attempt.isCorrect ? 0.01 : 0.002;
        learnerMastery[key] = Math.max(0.05, Math.min(0.95, current + delta));
      }
    }

    // Collect metrics
    const sessionAccuracy = cbody && cbody.data && cbody.data.score ? cbody.data.score.percentage : 0;
    const recommendationEffectiveness = cbody && cbody.data && cbody.data.analytics ? (cbody.data.analytics.recommendationEffectiveness || 0) : 0;
    const avgSkill = await avgSkillMastery(userId);
    const avgMemory = await avgMemoryStrength(userId);
    const coverage = await computeCoverageForUser(userId, questionCombos.combos);

    const attempts = cbody && cbody.data && cbody.data.answers ? cbody.data.answers : [];
    const topicsInSession = new Set(attempts.map((a) => a.topic));
    const diversityScore = (topicsInSession.size / (attempts.length || 1)) * 100;

    const skills = await Skill.find({ userId }).lean();
    const sortedSkills = skills.slice().sort((a, b) => (a.mastery || 0) - (b.mastery || 0));
    const weakestTopics = sortedSkills.slice(0, 3).map((s) => ({ topic: s.topic, subtopic: s.subtopic, mastery: s.mastery }));
    const strongestTopics = sortedSkills.slice(-3).reverse().map((s) => ({ topic: s.topic, subtopic: s.subtopic, mastery: s.mastery }));

    const metrics = {
      sessionNumber: i,
      sessionAccuracy,
      recommendationEffectiveness,
      avgSkillMastery: avgSkill,
      avgMemoryStrength: avgMemory,
      coveragePercent: coverage.coveragePercent,
      coveredConcepts: coverage.coveredConcepts,
      repeatRate: 0, // placeholder (could be derived from attempts / lastSession)
      diversityScore,
      weakestTopics,
      strongestTopics,
    };

    timeline.push(metrics);

    // small progress log
    if (i % 10 === 0) console.log(`Profile ${profileName} - completed session ${i}/${sessions}`);
  }

  const finalAvgSkill = await avgSkillMastery(userId);
  const finalMemory = await avgMemoryStrength(userId);
  const finalCoverage = (await computeCoverageForUser(userId, questionCombos.combos)).coveragePercent;

  const summary = {
    sessionsRun: sessions,
    initialAvgSkill,
    finalAvgSkill: finalAvgSkill,
    initialMemoryStrength: initialMemory,
    finalMemoryStrength: finalMemory,
    initialCoverage,
    finalCoverage,
    initialRecommendationEffectiveness: timeline.length ? timeline[0].recommendationEffectiveness : 0,
    finalRecommendationEffectiveness: timeline.length ? timeline[timeline.length - 1].recommendationEffectiveness : 0,
    totalQuestionsAnswered: totalQuestions,
    totalCorrect,
    totalIncorrect,
  };

  // Write outputs for this profile
  const timelinePath = `./backend/tests/AUTO_LEARNER_TIMELINE_${profileName}.json`;
  const summaryPath = `./backend/tests/AUTO_LEARNER_SUMMARY_${profileName}.json`;
  fs.writeFileSync(timelinePath, JSON.stringify(timeline, null, 2));
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));

  return { timeline, summary };
};

const runMulti = async () => {
  await ensureConnected();
  const profiles = Object.keys(learnerProfiles);
  const comparison = {};

  for (const p of profiles) {
    console.log(`Starting simulation for ${p}`);
    const result = await runSimulation(p, DEFAULT_SESSION_COUNT);
    comparison[p] = {
      summary: result.summary,
      timelineFile: `AUTO_LEARNER_TIMELINE_${p}.json`,
      summaryFile: `AUTO_LEARNER_SUMMARY_${p}.json`,
    };
  }

  fs.writeFileSync(`./backend/tests/MULTI_LEARNER_COMPARISON.json`, JSON.stringify(comparison, null, 2));

  // Final validation print
  console.log("=== AUTO LEARNER RESULTS ===");
  for (const p of Object.keys(comparison)) {
    const s = comparison[p].summary;
    console.log(`Profile: ${p}`);
    console.log(`Sessions: ${s.sessionsRun}`);
    console.log(`Accuracy Start: ${s.initialAvgSkill.toFixed(3)} End: ${s.finalAvgSkill.toFixed(3)}`);
    console.log(`Coverage Start: ${s.initialCoverage}% End: ${s.finalCoverage}%`);
    console.log(`Recommendation Start: ${s.initialRecommendationEffectiveness} End: ${s.finalRecommendationEffectiveness}`);
    console.log("");
  }

  await mongoose.disconnect();
  console.log("Simulation complete. DB disconnected.");
};

// If this file is run directly, execute multi-run
if (process.argv[1] && process.argv[1].includes("autoLearnerSimulation.js")) {
  runMulti().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

export { runSimulation, runMulti };

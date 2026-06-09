/**
 * ============================================================
 * ADAPTIVE ENGINE 100-SESSION VALIDATION
 * ============================================================
 * Stress tests the adaptive learning engine with 4 simulated
 * learner personas over 100 sessions (5 questions each).
 *
 * Validates:
 *   - Personalization Quality
 *   - Coverage Growth
 *   - Reinforcement Quality
 *   - Recommendation Stability
 *   - Exploration vs Exploitation Balance
 *
 * Output files (written to backend/tests/):
 *   STRESS_TIMELINE.json
 *   STRESS_OVERLAP_MATRIX.json
 *   STRESS_EXPOSURE_REPORT.json
 *   STRESS_COVERAGE_CURVE.json
 *   STRESS_SUMMARY.json
 *   STRESS_FAILURES.json
 *   STRESS_FINAL_REPORT.md
 *
 * Usage:
 *   node backend/tests/ADAPTIVE_ENGINE_100_SESSION_VALIDATION.js
 *
 * Requires a running MongoDB instance.
 * ============================================================
 */

import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

import Session from "../models/session.model.js";
import Attempt from "../models/attempt.model.js";
import QuestionExposure from "../models/questionExposure.model.js";
import KnowledgeCoverage from "../models/knowledgeCoverage.model.js";
import Skill from "../models/skill.model.js";
import Memory from "../models/memory.model.js";
import Question from "../models/question.model.js";

import mockQuestions from "../data/questions.js";
import { getSessionQuestions } from "../services/questionSelection.service.js";
import * as SessionController from "../controllers/session.controller.js";

// ============================================================
// CONFIGURATION
// ============================================================

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/language-app-test";
const OUTPUT_DIR = path.resolve(__dirname);

const SESSIONS_PER_LEARNER = 100;
const QUESTIONS_PER_SESSION = 5;
const TOTAL_QUESTIONS_PER_LEARNER = SESSIONS_PER_LEARNER * QUESTIONS_PER_SESSION;

// ============================================================
// LEARNER PERSONA PROFILES
// ============================================================
// Each persona has per-topic accuracy rates and a global default.
// accuracy = baseline correct probability (0-1).
// learningRate = how quickly mastery improves per correct answer.
// decayRate = how much mastery decays per incorrect answer.

const PERSONAS = {
  USER_A_HIGH_PERFORMER: {
    id: "USER_A_HIGH_PERFORMER",
    label: "High Performer",
    description: "Consistently high accuracy (80-95%) across all topics.",
    // Per-topic baseline accuracy
    topicAccuracy: {
      default: 0.87,
    },
    learningRate: 0.012,
    decayRate: 0.003,
    // Variance added per session (± this range)
    sessionVariance: 0.08,
  },

  USER_B_AVERAGE: {
    id: "USER_B_AVERAGE",
    label: "Average Learner",
    description: "Average accuracy (50-70%), some topics stronger than others.",
    topicAccuracy: {
      default: 0.60,
      vocabulary: 0.65,
      grammar: 0.50,
      particles: 0.45,
      verbs: 0.58,
      greetings: 0.75,
      numbers: 0.70,
    },
    learningRate: 0.008,
    decayRate: 0.005,
    sessionVariance: 0.10,
  },

  USER_C_GRAMMAR_SPECIALIST: {
    id: "USER_C_GRAMMAR_SPECIALIST",
    label: "Grammar Specialist",
    description: "Strong grammar skills, weak vocabulary.",
    topicAccuracy: {
      default: 0.55,
      grammar: 0.88,
      particles: 0.90,
      verbs: 0.82,
      vocabulary: 0.35,
      food: 0.40,
      greetings: 0.65,
      adjectives: 0.55,
    },
    learningRate: 0.010,
    decayRate: 0.004,
    sessionVariance: 0.09,
  },

  USER_D_VOCAB_SPECIALIST: {
    id: "USER_D_VOCAB_SPECIALIST",
    label: "Vocabulary Specialist",
    description: "Strong vocabulary, weak grammar.",
    topicAccuracy: {
      default: 0.55,
      vocabulary: 0.88,
      food: 0.85,
      greetings: 0.80,
      adjectives: 0.75,
      grammar: 0.30,
      particles: 0.35,
      verbs: 0.40,
      time_date: 0.45,
    },
    learningRate: 0.010,
    decayRate: 0.004,
    sessionVariance: 0.09,
  },
};

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

/** Ensure MongoDB connection is active */
const ensureConnected = async () => {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(MONGO_URI);
  console.log(`🔗 Connected to MongoDB: ${MONGO_URI}`);
};

/** Factory for a mock Express response object */
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

/** Build the universe of all possible topic||subtopic combos */
const buildQuestionComboSet = async () => {
  const db = (await Question.find({}).lean()) || [];
  const combined = [...db, ...mockQuestions];
  const set = new Set();
  for (const q of combined) {
    const topic = String(q.topic || "unknown").trim();
    const sub = String(q.subtopic || "unknown").trim();
    set.add(`${topic}||${sub}`);
  }
  return { total: set.size, combos: Array.from(set) };
};

/** Compute coverage percent for a user */
const computeCoverageForUser = async (userId, combos) => {
  const coverages = await KnowledgeCoverage.find({ userId }).lean();
  const coveredSet = new Set();
  for (const c of coverages) {
    if ((c.exposureCount || 0) > 0) {
      coveredSet.add(`${c.topic}||${c.subtopic}`);
    }
  }
  const coveragePercent = combos.length === 0 ? 0 : Math.round((coveredSet.size / combos.length) * 10000) / 100;
  return { coveragePercent, coveredCount: coveredSet.size, totalCombos: combos.length };
};

/** Compute average skill mastery across all skills for a user */
const avgSkillMastery = async (userId) => {
  const skills = await Skill.find({ userId }).lean();
  if (!skills.length) return 0;
  const sum = skills.reduce((s, sk) => s + (typeof sk.mastery === "number" ? sk.mastery : 0), 0);
  return Math.round((sum / skills.length) * 10000) / 10000;
};

/** Compute average memory strength across all memories for a user */
const avgMemoryStrength = async (userId) => {
  const mems = await Memory.find({ userId }).lean();
  if (!mems.length) return 0;
  const sum = mems.reduce((s, m) => s + (typeof m.strength === "number" ? m.strength : 0), 0);
  return Math.round((sum / mems.length) * 10000) / 10000;
};

/** Compute Gini coefficient for a distribution of counts */
const computeGini = (values) => {
  if (!values || values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  const mean = sorted.reduce((s, v) => s + v, 0) / n;
  if (mean === 0) return 0;
  let sumOfAbsoluteDifferences = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      sumOfAbsoluteDifferences += Math.abs(sorted[i] - sorted[j]);
    }
  }
  return sumOfAbsoluteDifferences / (2 * n * n * mean);
};

/** Compute Jaccard overlap between two sets */
const jaccardOverlap = (setA, setB) => {
  const inter = [...setA].filter((x) => setB.has(x));
  const union = new Set([...setA, ...setB]);
  if (union.size === 0) return 0;
  return inter.length / union.size;
};

/** Detect if coverage has stagnated: <0.5% change over last 20 sessions */
const detectCoverageStagnation = (timeline, threshold = 20, minChange = 0.5) => {
  if (timeline.length < threshold) return false;
  const recent = timeline.slice(-threshold);
  const first = recent[0].coveragePercent;
  const last = recent[recent.length - 1].coveragePercent;
  return Math.abs(last - first) < minChange && last < 99;
};

/** Detect if recommendation effectiveness decreases continuously for 10 sessions */
const detectRecEffectivenessDecline = (timeline, threshold = 10) => {
  if (timeline.length < threshold) return false;
  const recent = timeline.slice(-threshold);
  let declining = true;
  for (let i = 1; i < recent.length; i++) {
    if (recent[i].recommendationEffectiveness >= recent[i - 1].recommendationEffectiveness - 0.001) {
      // Allow tiny epsilon but check for strict decline
      if (recent[i].recommendationEffectiveness >= recent[i - 1].recommendationEffectiveness) {
        declining = false;
        break;
      }
    }
  }
  return declining;
};

/** Check if coverage jumps from <50% to >95% in a single session */
const detectCoverageJump = (timeline) => {
  for (let i = 1; i < timeline.length; i++) {
    const prev = timeline[i - 1].coveragePercent;
    const curr = timeline[i].coveragePercent;
    if (prev < 50 && curr > 95) return { session: i + 1, from: prev, to: curr };
  }
  return null;
};

/** Create a unique test user ID */
const createTestUserId = (label) =>
  `stress_v2_${label.toLowerCase().replace(/_/g, "")}_${Date.now()}_${Math.floor(Math.random() * 100000)}`;

/** Clean up all collections for a specific user */
const cleanupUser = async (userId) => {
  await Promise.all([
    Skill.deleteMany({ userId }),
    Memory.deleteMany({ userId }),
    Attempt.deleteMany({ userId }),
    Session.deleteMany({ userId }),
    QuestionExposure.deleteMany({ userId }),
    KnowledgeCoverage.deleteMany({ userId }),
  ]);
};

// ============================================================
// CORE SIMULATION: RUN 100 SESSIONS FOR A PERSONA
// ============================================================

const runForPersona = async (personaConfig, combos) => {
  const userId = createTestUserId(personaConfig.id);
  await cleanupUser(userId);

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`🎭 Starting: ${personaConfig.label} (${userId})`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

  // In-memory learner state (drift model based on accuracy and learning/decay rates)
  const learnerMastery = {};
  // Initialize from persona topicAccuracy
  for (const [topic, accuracy] of Object.entries(personaConfig.topicAccuracy)) {
    learnerMastery[topic] = accuracy;
  }

  const timeline = [];
  const selectedQuestionPool = new Set();   // unique question IDs seen
  const selectedSubtopicPool = new Set();   // unique topic||subtopic
  let totalSelections = 0;

  // Overlap tracking over time (for pairwise overlap trend)
  const questionSelectionBySession = [];  // array of Sets per session

  // Memory and skill audits every 10 sessions
  const memoryAudit = [];
  const skillAudit = [];

  // Track recommendation effectiveness history
  const recEffectivenessHistory = [];

  for (let sessionNum = 1; sessionNum <= SESSIONS_PER_LEARNER; sessionNum++) {
    // 1. Create session document
    const sessionDoc = new Session({ userId });
    await sessionDoc.save();

    // 2. Get questions from the engine
    const questions = await getSessionQuestions(userId, QUESTIONS_PER_SESSION, { persistExposure: true });

    const selectedQuestionIds = questions.map((q) => String(q.questionId));
    const selectedTopics = questions.map((q) => q.topic || "unknown");
    const selectedSubtopics = questions.map(
      (q) => `${String(q.topic || "unknown").trim()}||${String(q.subtopic || "unknown").trim()}`
    );

    // Record for overlap tracking
    questionSelectionBySession.push(new Set(selectedQuestionIds));

    // Track unique pools
    for (const qid of selectedQuestionIds) selectedQuestionPool.add(qid);
    for (const st of selectedSubtopics) selectedSubtopicPool.add(st);
    totalSelections += selectedQuestionIds.length;

    // 3. Submit answers with realistic correctness probabilities
    for (const q of questions) {
      const topic = String(q.topic || "default").trim();

      // Get current mastery for this topic
      let currentAccuracy = learnerMastery[topic];
      if (typeof currentAccuracy !== "number") {
        currentAccuracy = learnerMastery["default"] || personaConfig.topicAccuracy["default"] || 0.5;
      }

      // Add session-level variance
      const varianceSign = Math.random() > 0.5 ? 1 : -1;
      const varianceAmount = Math.random() * personaConfig.sessionVariance;
      const effectiveAccuracy = Math.max(0.03, Math.min(0.97, currentAccuracy + varianceSign * varianceAmount));

      const isCorrect = Math.random() < effectiveAccuracy;

      // Find canonical question for correct answer
      let canonical = null;
      if (mongoose.Types.ObjectId.isValid(q.questionId)) {
        try {
          canonical = await Question.findById(q.questionId).lean();
        } catch (_) { /* fall through */ }
      }
      if (!canonical) {
        canonical = mockQuestions.find((m) => String(m._id) === String(q.questionId));
      }
      const correctAnswer = canonical ? canonical.correctAnswer : "N/A";
      const userAnswer = isCorrect
        ? correctAnswer
        : `wrong_${Math.random().toString(36).slice(2, 8)}`;

      // Submit to the real controller
      const req = {
        params: { id: String(sessionDoc._id) },
        body: { questionId: q.questionId, userAnswer },
      };
      const res = fakeResFactory();
      await SessionController.submitAnswer(req, res);

      // Update in-memory learner mastery (drift)
      const prevMastery = typeof learnerMastery[topic] === "number"
        ? learnerMastery[topic]
        : (learnerMastery["default"] || 0.5);

      const delta = isCorrect ? personaConfig.learningRate : -personaConfig.decayRate;
      learnerMastery[topic] = Math.max(0.02, Math.min(0.99, prevMastery + delta));
    }

    // 4. Complete the session
    const creq = { params: { id: String(sessionDoc._id) } };
    const cres = fakeResFactory();
    await SessionController.completeSession(creq, cres);
    const cbody = cres._get().body;

    // 5. Collect metrics
    const accuracy = cbody && cbody.data && cbody.data.score ? cbody.data.score.percentage : 0;
    const avgSkill = await avgSkillMastery(userId);
    const avgMem = await avgMemoryStrength(userId);
    const recEffectiveness =
      cbody && cbody.data && cbody.data.analytics
        ? (cbody.data.analytics.recommendationEffectiveness || 0)
        : 0;
    const coverage = await computeCoverageForUser(userId, combos.combos);
    const uniqueQuestionsSeen = selectedQuestionPool.size;
    const uniqueSubtopicsSeen = selectedSubtopicPool.size;
    const repeatRate =
      totalSelections === 0
        ? 0
        : Math.round(((totalSelections - new Set([...selectedQuestionPool]).size) / totalSelections) * 10000) / 10000;
    // Diversity: unique topics in this session / total questions
    const uniqueTopicsThisSession = new Set(selectedTopics).size;
    const diversityScore = Math.round((uniqueTopicsThisSession / QUESTIONS_PER_SESSION) * 10000) / 100;

    // Weakest and strongest topics from skill collection
    const skills = await Skill.find({ userId }).lean();
    const sortedByMastery = [...skills].sort((a, b) => (a.mastery || 0) - (b.mastery || 0));
    const weakest = sortedByMastery.slice(0, 3).map((s) => ({
      topic: s.topic,
      subtopic: s.subtopic,
      mastery: s.mastery,
    }));
    const strongest = [...sortedByMastery].reverse().slice(0, 3).map((s) => ({
      topic: s.topic,
      subtopic: s.subtopic,
      mastery: s.mastery,
    }));

    // Build session entry
    const entry = {
      sessionNumber: sessionNum,
      accuracy,
      averageSkillMastery: Math.round(avgSkill * 10000) / 10000,
      averageMemoryStrength: Math.round(avgMem * 10000) / 10000,
      recommendationEffectiveness: Math.round(recEffectiveness * 10000) / 10000,
      coveragePercent: coverage.coveragePercent,
      repeatRate,
      diversityScore,
      uniqueQuestionsSeen,
      uniqueSubtopicsSeen,
      weakestTopics: weakest,
      strongestTopics: strongest,
      selectedQuestionIds,
      selectedTopics,
      selectedSubtopics,
    };

    timeline.push(entry);
    recEffectivenessHistory.push(recEffectiveness);

    // Progress logging
    if (sessionNum % 10 === 0 || sessionNum === 1 || sessionNum === SESSIONS_PER_LEARNER) {
      memoryAudit.push({ session: sessionNum, avgMemory: avgMem });
      skillAudit.push({ session: sessionNum, avgSkill });
      console.log(
        `  📊 Session ${String(sessionNum).padStart(3)} | Acc: ${String(accuracy).padStart(3)}% | ` +
        `Cov: ${String(coverage.coveragePercent).padStart(6)}% | ` +
        `Skill: ${avgSkill.toFixed(3)} | Mem: ${avgMem.toFixed(3)} | ` +
        `RecEff: ${recEffectiveness.toFixed(3)} | ` +
        `UniqQ: ${uniqueQuestionsSeen} | UniqSub: ${uniqueSubtopicsSeen}`
      );
    }
  }

  // 6. Compile final exposure report for this user
  const exposures = await QuestionExposure.find({ userId }).lean();
  const exposureList = exposures
    .map((e) => ({
      questionId: String(e.questionId),
      exposureCount: e.exposureCount || 0,
      firstSeenAt: e.firstSeenAt || null,
      lastSeenAt: e.lastSeenAt || null,
    }))
    .sort((a, b) => b.exposureCount - a.exposureCount);

  const finalCoverage = timeline.length > 0 ? timeline[timeline.length - 1].coveragePercent : 0;

  console.log(`\n  ✅ ${personaConfig.label} complete:`);
  console.log(`     Final coverage: ${finalCoverage}%`);
  console.log(`     Unique questions seen: ${selectedQuestionPool.size}`);
  console.log(`     Unique subtopics seen: ${selectedSubtopicPool.size}`);

  return {
    userId,
    personaId: personaConfig.id,
    label: personaConfig.label,
    description: personaConfig.description,
    timeline,
    selectedQuestionSet: Array.from(selectedQuestionPool),
    selectedSubtopicSet: Array.from(selectedSubtopicPool),
    questionSelectionBySession,  // Array of Sets for overlap trend
    exposures: exposureList,
    memoryAudit,
    skillAudit,
    recEffectivenessHistory,
    finalCoverage,
    finalSkillMastery: timeline.length > 0 ? timeline[timeline.length - 1].averageSkillMastery : 0,
    finalMemoryStrength: timeline.length > 0 ? timeline[timeline.length - 1].averageMemoryStrength : 0,
    finalRecEffectiveness:
      timeline.length > 0 ? timeline[timeline.length - 1].recommendationEffectiveness : 0,
    finalRepeatRate: timeline.length > 0 ? timeline[timeline.length - 1].repeatRate : 0,
    finalUniqueQuestions: selectedQuestionPool.size,
    finalUniqueSubtopics: selectedSubtopicPool.size,
  };
};

// ============================================================
// MAIN STRESS TEST RUNNER
// ============================================================

const runStressTest = async () => {
  const startTime = Date.now();
  console.log("╔══════════════════════════════════════════════════════════╗");
  console.log("║  ADAPTIVE ENGINE 100-SESSION VALIDATION                  ║");
  console.log("║  4 Personas × 100 Sessions × 5 Questions = 2000 Answers  ║");
  console.log("╚══════════════════════════════════════════════════════════╝");
  console.log("");

  await ensureConnected();

  // Build topic universe
  const combos = await buildQuestionComboSet();
  console.log(`📚 Question bank: ${combos.total} unique topic||subtopic combinations\n`);

  // Run all 4 personas
  const results = {};
  const personaKeys = Object.keys(PERSONAS);

  for (const key of personaKeys) {
    const result = await runForPersona(PERSONAS[key], combos);
    results[key] = result;

    // Write per-persona timeline immediately (for crash safety)
    const timelineFile = path.join(OUTPUT_DIR, `STRESS_TIMELINE_${key}.json`);
    fs.writeFileSync(timelineFile, JSON.stringify(result.timeline, null, 2));
    console.log(`  💾 Saved: ${path.basename(timelineFile)}`);
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📊 COMPUTING CROSS-LEARNER METRICS");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // ==========================================================
  // STRESS_TIMELINE.json (aggregate)
  // ==========================================================
  const timelineAggregate = {};
  for (const key of personaKeys) {
    timelineAggregate[key] = results[key].timeline;
  }
  fs.writeFileSync(
    path.join(OUTPUT_DIR, "STRESS_TIMELINE.json"),
    JSON.stringify(timelineAggregate, null, 2)
  );
  console.log("✅ STRESS_TIMELINE.json written");

  // ==========================================================
  // STRESS_OVERLAP_MATRIX.json
  // ==========================================================
  // Pairwise Jaccard overlap of selected question sets
  const overlapMatrix = {};
  const overlapTrend = {};  // overlap computed at 10-session intervals

  for (let i = 0; i < personaKeys.length; i++) {
    for (let j = i + 1; j < personaKeys.length; j++) {
      const keyA = personaKeys[i];
      const keyB = personaKeys[j];
      const pairLabel = `${keyA}_vs_${keyB}`;

      // Overall overlap
      const setA = new Set(results[keyA].selectedQuestionSet);
      const setB = new Set(results[keyB].selectedQuestionSet);
      const overallPct = Math.round(jaccardOverlap(setA, setB) * 10000) / 100;

      overlapMatrix[pairLabel] = {
        overlapPercent: overallPct,
        commonQuestions: [...setA].filter((x) => setB.has(x)).length,
        totalUniqueInA: setA.size,
        totalUniqueInB: setB.size,
        unionSize: new Set([...setA, ...setB]).size,
      };

      // Overlap trend (at 10-session intervals)
      const trend = [];
      const maxSessions = Math.max(
        results[keyA].questionSelectionBySession.length,
        results[keyB].questionSelectionBySession.length
      );
      for (let s = 0; s < maxSessions; s += 10) {
        // Accumulate sets up to this point
        const accumA = new Set();
        const accumB = new Set();
        for (let k = 0; k <= s && k < results[keyA].questionSelectionBySession.length; k++) {
          for (const qid of results[keyA].questionSelectionBySession[k]) accumA.add(qid);
        }
        for (let k = 0; k <= s && k < results[keyB].questionSelectionBySession.length; k++) {
          for (const qid of results[keyB].questionSelectionBySession[k]) accumB.add(qid);
        }
        const overlapAtSession = Math.round(jaccardOverlap(accumA, accumB) * 10000) / 100;
        trend.push({ upToSession: s + 1, overlapPercent: overlapAtSession });
      }
      overlapTrend[pairLabel] = trend;
    }
  }

  const overlapOutput = {
    pairwiseOverlap: overlapMatrix,
    overlapTrendOverTime: overlapTrend,
    interpretation: {
      good: "Overlap < 40% indicates strong personalization differentiation",
      warning: "Overlap 40-70% suggests moderate differentiation",
      problem: "Overlap > 70% indicates personas are not receiving differentiated content",
    },
  };

  fs.writeFileSync(
    path.join(OUTPUT_DIR, "STRESS_OVERLAP_MATRIX.json"),
    JSON.stringify(overlapOutput, null, 2)
  );
  console.log("✅ STRESS_OVERLAP_MATRIX.json written");

  // ==========================================================
  // STRESS_EXPOSURE_REPORT.json
  // ==========================================================
  // Aggregate exposure across all users
  const exposureAgg = {};
  for (const key of personaKeys) {
    for (const exp of results[key].exposures) {
      const id = String(exp.questionId);
      if (!exposureAgg[id]) {
        exposureAgg[id] = { questionId: id, totalExposure: 0, perPersona: {} };
      }
      exposureAgg[id].totalExposure += exp.exposureCount;
      exposureAgg[id].perPersona[key] = (exposureAgg[id].perPersona[key] || 0) + exp.exposureCount;
    }
  }

  const exposureList = Object.values(exposureAgg).sort(
    (a, b) => b.totalExposure - a.totalExposure
  );

  const mostSelected = exposureList.slice(0, 10);
  const leastSelected = exposureList.reverse().slice(0, 10); // actually least from the end

  // Properly compute least selected (those with lowest exposure, including 0 if any)
  const allQuestionIds = new Set();
  for (const q of mockQuestions) allQuestionIds.add(String(q._id));
  for (const id of Object.keys(exposureAgg)) allQuestionIds.add(id);

  const allExposureCounts = [];
  for (const id of allQuestionIds) {
    allExposureCounts.push({
      questionId: id,
      totalExposure: (exposureAgg[id] && exposureAgg[id].totalExposure) || 0,
    });
  }
  allExposureCounts.sort((a, b) => a.totalExposure - b.totalExposure);
  const trulyLeastSelected = allExposureCounts.slice(0, 10);

  // Gini coefficient of exposure distribution
  const giniValues = allExposureCounts.map((e) => e.totalExposure);
  const giniCoefficient = Math.round(computeGini(giniValues) * 10000) / 10000;

  const exposureReport = {
    totalQuestionsInBank: allQuestionIds.size,
    mostSelected,
    leastSelected: trulyLeastSelected,
    exposureDistribution: allExposureCounts.slice(0, 50), // top 50 for compactness
    giniCoefficient,
    interpretation: {
      gini: {
        low: "< 0.3: Very uniform exposure (excellent balance)",
        moderate: "0.3-0.5: Moderate concentration (acceptable)",
        high: "> 0.5: High concentration (some questions over-exposed)",
        extreme: "> 0.7: Extreme concentration (engine needs better spread)",
      },
    },
  };

  fs.writeFileSync(
    path.join(OUTPUT_DIR, "STRESS_EXPOSURE_REPORT.json"),
    JSON.stringify(exposureReport, null, 2)
  );
  console.log("✅ STRESS_EXPOSURE_REPORT.json written");

  // ==========================================================
  // STRESS_COVERAGE_CURVE.json
  // ==========================================================
  const coverageCurve = {};
  for (const key of personaKeys) {
    coverageCurve[key] = results[key].timeline.map((entry) => ({
      sessionNumber: entry.sessionNumber,
      coveragePercent: entry.coveragePercent,
      uniqueQuestionsSeen: entry.uniqueQuestionsSeen,
      uniqueSubtopicsSeen: entry.uniqueSubtopicsSeen,
    }));
  }

  fs.writeFileSync(
    path.join(OUTPUT_DIR, "STRESS_COVERAGE_CURVE.json"),
    JSON.stringify(coverageCurve, null, 2)
  );
  console.log("✅ STRESS_COVERAGE_CURVE.json written");

  // ==========================================================
  // STRESS_FAILURES.json
  // ==========================================================
  const failures = [];

  // 1. Overlap > 70%
  for (const [pairLabel, data] of Object.entries(overlapMatrix)) {
    if (data.overlapPercent > 70) {
      failures.push({
        type: "overlap_excessive",
        severity: "HIGH",
        detail: `${pairLabel} overlap is ${data.overlapPercent}% (> 70% threshold)`,
        pair: pairLabel,
        value: data.overlapPercent,
        threshold: 70,
      });
    }
  }

  // 2. Repeat rate > 30%
  for (const key of personaKeys) {
    const finalRepeatRate = results[key].finalRepeatRate;
    if (finalRepeatRate > 0.30) {
      failures.push({
        type: "repeat_rate_high",
        severity: "MEDIUM",
        detail: `${PERSONAS[key].label} final repeat rate is ${(finalRepeatRate * 100).toFixed(1)}% (> 30% threshold)`,
        persona: key,
        value: finalRepeatRate,
        threshold: 0.30,
      });
    }
  }

  // 3. Coverage growth stagnation (20+ sessions)
  for (const key of personaKeys) {
    if (detectCoverageStagnation(results[key].timeline, 20, 0.5)) {
      const last20 = results[key].timeline.slice(-20);
      failures.push({
        type: "coverage_stagnation",
        severity: "HIGH",
        detail: `${PERSONAS[key].label} coverage stagnated: ${last20[0].coveragePercent}% → ${last20[last20.length - 1].coveragePercent}% over last 20 sessions`,
        persona: key,
        startValue: last20[0].coveragePercent,
        endValue: last20[last20.length - 1].coveragePercent,
        threshold: "Change < 0.5% over 20 sessions",
      });
    }
  }

  // 4. Recommendation effectiveness decreases continuously for 10 sessions
  for (const key of personaKeys) {
    if (detectRecEffectivenessDecline(results[key].timeline, 10)) {
      const recent10 = results[key].recEffectivenessHistory.slice(-10);
      failures.push({
        type: "recommendation_effectiveness_decline",
        severity: "HIGH",
        detail: `${PERSONAS[key].label} recommendation effectiveness declined over last 10 sessions: ${recent10.join(" → ")}`,
        persona: key,
        values: recent10,
        threshold: "Continuous decrease for 10 sessions",
      });
    }
  }

  // 5. Coverage jumps directly to 100%
  for (const key of personaKeys) {
    const jump = detectCoverageJump(results[key].timeline);
    if (jump) {
      failures.push({
        type: "coverage_jump_to_full",
        severity: "HIGH",
        detail: `${PERSONAS[key].label} coverage jumped from ${jump.from}% to ${jump.to}% at session ${jump.session}`,
        persona: key,
        ...jump,
      });
    }
  }

  // 6. Persona differentiation disappears (all selects converge)
  const allSelectedSets = personaKeys.map((k) => new Set(results[k].selectedQuestionSet));
  let maxPairwiseOverlap = 0;
  let allOverlapPairs = [];
  for (let i = 0; i < allSelectedSets.length; i++) {
    for (let j = i + 1; j < allSelectedSets.length; j++) {
      const overlap = jaccardOverlap(allSelectedSets[i], allSelectedSets[j]);
      allOverlapPairs.push({ i, j, overlap });
      if (overlap > maxPairwiseOverlap) maxPairwiseOverlap = overlap;
    }
  }

  // If all pairwise overlaps exceed 80%, differentiation has disappeared
  const allHighOverlap = allOverlapPairs.every((p) => p.overlap > 0.80);
  if (allHighOverlap) {
    failures.push({
      type: "persona_differentiation_lost",
      severity: "CRITICAL",
      detail: `All persona pairs have > 80% question overlap. Personalization has effectively disappeared.`,
      pairwiseOverlaps: allOverlapPairs.map((p) => ({
        pair: `${personaKeys[p.i]}_vs_${personaKeys[p.j]}`,
        overlap: Math.round(p.overlap * 10000) / 10000,
      })),
    });
  }

  // Check coverage never reached 50% for any persona
  for (const key of personaKeys) {
    if (results[key].finalCoverage < 50) {
      failures.push({
        type: "coverage_insufficient",
        severity: "MEDIUM",
        detail: `${PERSONAS[key].label} final coverage is only ${results[key].finalCoverage}% (< 50%)`,
        persona: key,
        value: results[key].finalCoverage,
        threshold: 50,
      });
    }
  }

  // Skill mastery should increase over time for average learner
  for (const key of personaKeys) {
    const skillAudit = results[key].skillAudit;
    if (skillAudit.length >= 3) {
      const firstSkill = skillAudit[0].avgSkill;
      const lastSkill = skillAudit[skillAudit.length - 1].avgSkill;
      if (lastSkill < firstSkill - 0.03) {
        failures.push({
          type: "skill_regression",
          severity: "LOW",
          detail: `${PERSONAS[key].label} skill mastery decreased: ${firstSkill.toFixed(4)} → ${lastSkill.toFixed(4)}`,
          persona: key,
          initial: firstSkill,
          final: lastSkill,
        });
      }
    }
  }

  fs.writeFileSync(
    path.join(OUTPUT_DIR, "STRESS_FAILURES.json"),
    JSON.stringify({ failures, totalFailures: failures.length }, null, 2)
  );
  console.log("✅ STRESS_FAILURES.json written");

  // ==========================================================
  // STRESS_SUMMARY.json
  // ==========================================================
  const summary = {
    testConfiguration: {
      personas: Object.keys(PERSONAS).length,
      sessionsPerLearner: SESSIONS_PER_LEARNER,
      questionsPerSession: QUESTIONS_PER_SESSION,
      totalAnswersSimulated: Object.keys(PERSONAS).length * TOTAL_QUESTIONS_PER_LEARNER,
      questionBankSize: combos.total,
    },
    finalLearnerStatistics: {},
    overlapSummary: {
      pairwiseOverlap: overlapMatrix,
      averageOverlap:
        Object.values(overlapMatrix).reduce((s, v) => s + v.overlapPercent, 0) /
        Object.values(overlapMatrix).length || 0,
    },
    repeatSummary: {},
    recommendationEffectivenessSummary: {},
    coverageGrowthSummary: {},
    failureCount: failures.length,
    failuresBySeverity: {
      CRITICAL: failures.filter((f) => f.severity === "CRITICAL").length,
      HIGH: failures.filter((f) => f.severity === "HIGH").length,
      MEDIUM: failures.filter((f) => f.severity === "MEDIUM").length,
      LOW: failures.filter((f) => f.severity === "LOW").length,
    },
    giniCoefficient,
  };

  for (const key of personaKeys) {
    const r = results[key];
    summary.finalLearnerStatistics[key] = {
      label: r.label,
      description: r.description,
      finalCoverage: r.finalCoverage,
      finalSkillMastery: r.finalSkillMastery,
      finalMemoryStrength: r.finalMemoryStrength,
      finalRecEffectiveness: r.finalRecEffectiveness,
      finalRepeatRate: r.finalRepeatRate,
      uniqueQuestionsSeen: r.finalUniqueQuestions,
      uniqueSubtopicsSeen: r.finalUniqueSubtopics,
      totalExposures: r.exposures.reduce((s, e) => s + e.exposureCount, 0),
    };

    summary.repeatSummary[key] = {
      label: r.label,
      finalRepeatRate: r.finalRepeatRate,
      uniqueQuestionsSeen: r.finalUniqueQuestions,
      totalSelections: TOTAL_QUESTIONS_PER_LEARNER,
    };

    summary.recommendationEffectivenessSummary[key] = {
      label: r.label,
      initial: r.timeline.length > 0 ? r.timeline[0].recommendationEffectiveness : 0,
      final: r.finalRecEffectiveness,
      trend:
        r.timeline.length > 0
          ? r.finalRecEffectiveness - r.timeline[0].recommendationEffectiveness
          : 0,
    };

    // Coverage growth: sessions to reach 25%, 50%, 75%, 90%
    const tl = r.timeline;
    summary.coverageGrowthSummary[key] = {
      label: r.label,
      initial: tl.length > 0 ? tl[0].coveragePercent : 0,
      final: r.finalCoverage,
      sessionsTo25: tl.find((e) => e.coveragePercent >= 25)?.sessionNumber || null,
      sessionsTo50: tl.find((e) => e.coveragePercent >= 50)?.sessionNumber || null,
      sessionsTo75: tl.find((e) => e.coveragePercent >= 75)?.sessionNumber || null,
      sessionsTo90: tl.find((e) => e.coveragePercent >= 90)?.sessionNumber || null,
    };
  }

  fs.writeFileSync(
    path.join(OUTPUT_DIR, "STRESS_SUMMARY.json"),
    JSON.stringify(summary, null, 2)
  );
  console.log("✅ STRESS_SUMMARY.json written");

  // ==========================================================
  // CONSUMER READINESS SCORE
  // ==========================================================
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📐 CALCULATING CONSUMER READINESS SCORE");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Sub-scores (0-100 each)

  // A. Personalization (0-30): lower average overlap = better
  const avgOverlap = summary.overlapSummary.averageOverlap;
  const personalizationScore = Math.max(0, Math.min(30, Math.round((1 - avgOverlap / 100) * 30)));
  console.log(`  A. Personalization:    ${personalizationScore}/30  (avg overlap: ${avgOverlap.toFixed(1)}%)`);

  // B. Coverage (0-20): average final coverage, gradient
  const avgFinalCoverage =
    personaKeys.reduce((s, k) => s + results[k].finalCoverage, 0) / personaKeys.length;
  const coverageScore = Math.max(0, Math.min(20, Math.round((avgFinalCoverage / 100) * 20)));
  console.log(`  B. Coverage:           ${coverageScore}/20  (avg final: ${avgFinalCoverage.toFixed(1)}%)`);

  // C. Repeat Control (0-20): lower repeat rate = better
  const avgRepeatRate =
    personaKeys.reduce((s, k) => s + results[k].finalRepeatRate, 0) / personaKeys.length;
  const repeatScore = Math.max(0, Math.min(20, Math.round((1 - avgRepeatRate) * 20)));
  console.log(`  C. Repeat Control:     ${repeatScore}/20  (avg repeat: ${(avgRepeatRate * 100).toFixed(1)}%)`);

  // D. Stability (0-15): recommendation effectiveness trend
  const recTrends = personaKeys.map((k) => {
    const tl = results[k].timeline;
    if (tl.length < 2) return 0;
    return tl[tl.length - 1].recommendationEffectiveness - tl[0].recommendationEffectiveness;
  });
  const avgRecTrend = recTrends.reduce((s, v) => s + v, 0) / recTrends.length;
  const stabilityScore = Math.max(0, Math.min(15, Math.round((avgRecTrend + 0.1) * 75 + 7.5)));
  console.log(`  D. Stability:          ${stabilityScore}/15  (avg rec trend: ${avgRecTrend.toFixed(4)})`);

  // E. Reinforcement Quality (0-15): Gini coefficient interpretation
  let reinforcementScore = 15;
  if (giniCoefficient > 0.7) reinforcementScore = 3;
  else if (giniCoefficient > 0.5) reinforcementScore = 8;
  else if (giniCoefficient > 0.3) reinforcementScore = 12;
  console.log(`  E. Reinforcement:      ${reinforcementScore}/15  (Gini: ${giniCoefficient.toFixed(4)})`);

  const totalReadinessScore =
    personalizationScore + coverageScore + repeatScore + stabilityScore + reinforcementScore;

  console.log(`\n  🏆 CONSUMER READINESS SCORE: ${totalReadinessScore}/100`);

  // Determine PASS / WARNING / FAIL
  let verdict = "PASS";
  let verdictReason = [];

  if (failures.filter((f) => f.severity === "CRITICAL").length > 0) {
    verdict = "FAIL";
    verdictReason.push("Critical failures detected");
  } else if (totalReadinessScore < 60) {
    verdict = "FAIL";
    verdictReason.push(`Readiness score ${totalReadinessScore} < 60`);
  } else if (totalReadinessScore < 75 || failures.filter((f) => f.severity === "HIGH").length > 0) {
    verdict = "WARNING";
    verdictReason.push(
      `Readiness score ${totalReadinessScore} in warning range or HIGH-severity failures present`
    );
  } else {
    verdictReason.push("All checks passed within acceptable thresholds");
  }

  console.log(`\n  📋 VERDICT: ${verdict}`);
  console.log(`     ${verdictReason.join(". ")}`);

  // ==========================================================
  // STRESS_FINAL_REPORT.md
  // ==========================================================
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📝 GENERATING STRESS_FINAL_REPORT.md");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  const md = [];

  md.push("# Adaptive Engine 100-Session Validation Report");
  md.push("");
  md.push(`**Generated:** ${new Date().toISOString()}`);
  md.push(`**Test Duration:** ${((Date.now() - startTime) / 1000).toFixed(1)}s`);
  md.push(`**Database:** ${MONGO_URI}`);
  md.push("");
  md.push("---");
  md.push("");

  // Overview
  md.push("## 1. Test Configuration");
  md.push("");
  md.push("| Parameter | Value |");
  md.push("|-----------|-------|");
  md.push(`| Personas | ${personaKeys.length} |`);
  md.push(`| Sessions per persona | ${SESSIONS_PER_LEARNER} |`);
  md.push(`| Questions per session | ${QUESTIONS_PER_SESSION} |`);
  md.push(`| Total answers simulated | ${personaKeys.length * TOTAL_QUESTIONS_PER_LEARNER} |`);
  md.push(`| Question bank topics | ${combos.total} |`);
  md.push("");

  // Persona descriptions
  md.push("## 2. Persona Profiles");
  md.push("");
  for (const key of personaKeys) {
    md.push(`### ${PERSONAS[key].label} (${key})`);
    md.push(`- **Description:** ${PERSONAS[key].description}`);
    md.push(`- **Default accuracy:** ${((PERSONAS[key].topicAccuracy.default || 0.55) * 100).toFixed(0)}%`);
    md.push(`- **Learning rate:** ${PERSONAS[key].learningRate}`);
    md.push(`- **Decay rate:** ${PERSONAS[key].decayRate}`);
    if (Object.keys(PERSONAS[key].topicAccuracy).length > 1) {
      md.push(`- **Topic strengths/weaknesses:**`);
      for (const [topic, acc] of Object.entries(PERSONAS[key].topicAccuracy)) {
        if (topic !== "default") {
          md.push(`  - ${topic}: ${(acc * 100).toFixed(0)}%`);
        }
      }
    }
    md.push("");
  }

  // Final learner statistics
  md.push("## 3. Final Learner Statistics");
  md.push("");
  md.push("| Persona | Coverage | Skill Mastery | Memory Strength | Rec. Eff. | Repeat Rate | Unique Qs | Unique Subs |");
  md.push("|---------|----------|---------------|-----------------|-----------|-------------|-----------|-------------|");
  for (const key of personaKeys) {
    const s = summary.finalLearnerStatistics[key];
    md.push(
      `| ${s.label} | ${s.finalCoverage}% | ${s.finalSkillMastery.toFixed(3)} | ${s.finalMemoryStrength.toFixed(3)} | ${s.finalRecEffectiveness.toFixed(3)} | ${(s.finalRepeatRate * 100).toFixed(1)}% | ${s.uniqueQuestionsSeen} | ${s.uniqueSubtopicsSeen} |`
    );
  }
  md.push("");

  // Coverage growth
  md.push("## 4. Coverage Growth");
  md.push("");
  md.push("| Persona | Start | Final | Sessions to 25% | to 50% | to 75% | to 90% |");
  md.push("|---------|-------|-------|-----------------|--------|--------|--------|");
  for (const key of personaKeys) {
    const c = summary.coverageGrowthSummary[key];
    md.push(
      `| ${c.label} | ${c.initial}% | ${c.final}% | ${c.sessionsTo25 ?? "—"} | ${c.sessionsTo50 ?? "—"} | ${c.sessionsTo75 ?? "—"} | ${c.sessionsTo90 ?? "—"} |`
    );
  }
  md.push("");

  // Overlap analysis
  md.push("## 5. Personalization Quality (Overlap Analysis)");
  md.push("");
  md.push(`**Average pairwise overlap:** ${avgOverlap.toFixed(1)}%`);
  md.push("");
  md.push("| Pair | Overlap % | Common Questions | Interpretation |");
  md.push("|------|-----------|------------------|----------------|");
  for (const [pairLabel, data] of Object.entries(overlapMatrix)) {
    let interpretation = "✅ Good differentiation";
    if (data.overlapPercent > 70) interpretation = "❌ Too similar";
    else if (data.overlapPercent > 40) interpretation = "⚠️ Moderate differentiation";
    md.push(
      `| ${pairLabel} | ${data.overlapPercent}% | ${data.commonQuestions} | ${interpretation} |`
    );
  }
  md.push("");

  // Reinforcement quality
  md.push("## 6. Reinforcement Quality (Exposure Balance)");
  md.push("");
  md.push(`- **Gini coefficient:** ${giniCoefficient.toFixed(4)}`);
  let giniInterpretation = "✅ Very uniform exposure (excellent balance)";
  if (giniCoefficient > 0.7) giniInterpretation = "❌ Extreme concentration (engine needs better spread)";
  else if (giniCoefficient > 0.5) giniInterpretation = "⚠️ High concentration (some questions over-exposed)";
  else if (giniCoefficient > 0.3) giniInterpretation = "⚠️ Moderate concentration (acceptable)";
  md.push(`- **Interpretation:** ${giniInterpretation}`);
  md.push("");
  md.push("### Most Selected Questions");
  md.push("");
  md.push("| Question ID | Total Exposure |");
  md.push("|-------------|----------------|");
  for (const q of mostSelected.slice(0, 5)) {
    md.push(`| ${q.questionId} | ${q.totalExposure} |`);
  }
  md.push("");
  md.push("### Least Selected Questions");
  md.push("");
  md.push("| Question ID | Total Exposure |");
  md.push("|-------------|----------------|");
  for (const q of trulyLeastSelected.slice(0, 5)) {
    md.push(`| ${q.questionId} | ${q.totalExposure} |`);
  }
  md.push("");

  // Recommendation stability
  md.push("## 7. Recommendation Stability");
  md.push("");
  md.push("| Persona | Initial RecEff | Final RecEff | Trend |");
  md.push("|---------|----------------|--------------|-------|");
  for (const key of personaKeys) {
    const r = summary.recommendationEffectivenessSummary[key];
    const trendIcon = r.trend > 0.02 ? "📈 Improving" : r.trend < -0.02 ? "📉 Declining" : "➡️ Stable";
    md.push(
      `| ${r.label} | ${r.initial.toFixed(3)} | ${r.final.toFixed(3)} | ${trendIcon} (${(r.trend >= 0 ? "+" : "")}${r.trend.toFixed(4)}) |`
    );
  }
  md.push("");

  // Exploration vs Exploitation
  md.push("## 8. Exploration vs Exploitation Balance");
  md.push("");
  md.push("| Persona | Diversity Score | Unique Subtopics | Repeat Rate | Assessment |");
  md.push("|---------|-----------------|------------------|-------------|------------|");
  for (const key of personaKeys) {
    const r = results[key];
    const avgDiversity =
      r.timeline.reduce((s, t) => s + t.diversityScore, 0) / r.timeline.length || 0;
    const assessment =
      r.finalRepeatRate < 0.15 && avgDiversity > 60
        ? "✅ Good exploration"
        : avgDiversity < 40
          ? "⚠️ Over-exploitation"
          : "⚠️ Moderate balance";
    md.push(
      `| ${r.label} | ${avgDiversity.toFixed(1)}% | ${r.finalUniqueSubtopics} | ${(r.finalRepeatRate * 100).toFixed(1)}% | ${assessment} |`
    );
  }
  md.push("");

  // Failures
  md.push("## 9. Detected Failures");
  md.push("");
  if (failures.length === 0) {
    md.push("✅ **No failures detected.** All validation checks passed.");
  } else {
    md.push(`**Total failures:** ${failures.length}`);
    md.push("");
    md.push("| # | Type | Severity | Detail |");
    md.push("|---|------|----------|--------|");
    failures.forEach((f, i) => {
      md.push(`| ${i + 1} | ${f.type} | ${f.severity} | ${f.detail} |`);
    });
  }
  md.push("");

  // Consumer Readiness Score
  md.push("## 10. Consumer Readiness Score");
  md.push("");
  md.push("| Dimension | Score | Max | Notes |");
  md.push("|-----------|-------|-----|-------|");
  md.push(
    `| A. Personalization Quality | ${personalizationScore} | 30 | Avg overlap: ${avgOverlap.toFixed(1)}% |`
  );
  md.push(
    `| B. Coverage Growth | ${coverageScore} | 20 | Avg final coverage: ${avgFinalCoverage.toFixed(1)}% |`
  );
  md.push(
    `| C. Repeat Control | ${repeatScore} | 20 | Avg repeat rate: ${(avgRepeatRate * 100).toFixed(1)}% |`
  );
  md.push(
    `| D. Recommendation Stability | ${stabilityScore} | 15 | Avg rec trend: ${avgRecTrend.toFixed(4)} |`
  );
  md.push(
    `| E. Reinforcement Quality | ${reinforcementScore} | 15 | Gini: ${giniCoefficient.toFixed(4)} |`
  );
  md.push(`| **TOTAL** | **${totalReadinessScore}** | **100** | |`);
  md.push("");

  // Verdict
  md.push("## 11. Final Verdict");
  md.push("");
  const verdictEmoji = verdict === "PASS" ? "✅" : verdict === "WARNING" ? "⚠️" : "❌";
  md.push(`### ${verdictEmoji} **${verdict}**`);
  md.push("");
  md.push(`**Reasons:**`);
  for (const reason of verdictReason) {
    md.push(`- ${reason}`);
  }
  md.push("");

  // Recommendations
  md.push("## 12. Recommendations");
  md.push("");

  if (verdict === "PASS") {
    md.push("The adaptive engine is performing well. Minor suggestions:");
    md.push("");
    if (giniCoefficient > 0.4) {
      md.push("- Consider adding more aggressive exposure decay for frequently-selected questions");
    }
    if (avgOverlap > 30) {
      md.push("- Persona weighting could be strengthened to increase differentiation");
    }
    if (avgFinalCoverage < 80) {
      md.push(
        "- Coverage injection strength could be increased to reach more subtopics within 100 sessions"
      );
    }
    md.push("- Continue monitoring coverage growth curves in production");
  } else if (verdict === "WARNING") {
    md.push("The engine has areas requiring attention before production deployment:");
    md.push("");
    const highFailures = failures.filter((f) => f.severity === "HIGH");
    for (const f of highFailures) {
      md.push(`- **${f.type}:** ${f.detail}`);
    }
    md.push("");
    md.push("Suggested actions:");
    if (avgOverlap > 50) {
      md.push("- Tune persona weighting to increase selection differentiation");
    }
    if (giniCoefficient > 0.5) {
      md.push("- Strengthen exposure penalty to prevent question concentration");
    }
    if (failures.some((f) => f.type === "coverage_stagnation")) {
      md.push("- Boost coverage injection rate or lower the exposure threshold for unseen subtopics");
    }
  } else {
    md.push("**CRITICAL ISSUES DETECTED** — not ready for production:");
    md.push("");
    const criticalFailures = failures.filter((f) => f.severity === "CRITICAL");
    for (const f of criticalFailures) {
      md.push(`- **${f.type}:** ${f.detail}`);
    }
    md.push("");
    md.push("Required actions before production:");
    if (failures.some((f) => f.type === "persona_differentiation_lost")) {
      md.push("- **Urgent:** Persona weighting has no measurable effect. Review `detectPersonaType()` and scoring deltas.");
    }
    md.push("- Run additional targeted tests after each fix to verify improvement");
    md.push("- Consider reducing `temperature` parameter in softmax to increase exploitation of weak topics");
  }
  md.push("");

  // Footer
  md.push("---");
  md.push("");
  md.push("### Output Files");
  md.push("");
  md.push("| File | Description |");
  md.push("|------|-------------|");
  md.push("| `STRESS_TIMELINE.json` | Session-by-session metrics for all personas |");
  md.push("| `STRESS_OVERLAP_MATRIX.json` | Pairwise overlap percentages and overlap trends |");
  md.push("| `STRESS_EXPOSURE_REPORT.json` | Exposure distribution, Gini coefficient, most/least selected |");
  md.push("| `STRESS_COVERAGE_CURVE.json` | Coverage growth curves per persona |");
  md.push("| `STRESS_SUMMARY.json` | Aggregated final statistics |");
  md.push("| `STRESS_FAILURES.json` | All detected failures with details |");
  md.push("| `STRESS_FINAL_REPORT.md` | This report |");
  md.push("");

  fs.writeFileSync(path.join(OUTPUT_DIR, "STRESS_FINAL_REPORT.md"), md.join("\n"));
  console.log("✅ STRESS_FINAL_REPORT.md written");

  // ==========================================================
  // DONE
  // ==========================================================
  console.log("\n╔══════════════════════════════════════════════════════════╗");
  console.log("║  VALIDATION COMPLETE                                     ║");
  console.log("╚══════════════════════════════════════════════════════════╝");
  console.log(`\n📋 Verdict: ${verdictEmoji} ${verdict}`);
  console.log(`🏆 Readiness Score: ${totalReadinessScore}/100`);
  console.log(`⚠️  Failures: ${failures.length}`);
  console.log(`📁 Output directory: ${OUTPUT_DIR}/`);
  console.log(`⏱️  Total time: ${((Date.now() - startTime) / 1000).toFixed(1)}s\n`);

  await mongoose.disconnect();
  console.log("🔌 Disconnected from MongoDB");

  return { verdict, totalReadinessScore, failures };
};

// ============================================================
// EXECUTION ENTRY POINT
// ============================================================

if (
  process.argv[1] &&
  (process.argv[1].includes("ADAPTIVE_ENGINE_100_SESSION_VALIDATION.js") ||
    process.argv[1].includes("ADAPTIVE_ENGINE_100_SESSION_VALIDATION"))
) {
  runStressTest()
    .then(({ verdict, totalReadinessScore, failures }) => {
      if (verdict === "FAIL") {
        process.exit(1);
      }
      process.exit(0);
    })
    .catch((err) => {
      console.error("❌ Fatal error during stress test:", err);
      process.exit(1);
    });
}

export { runStressTest, PERSONAS, SESSIONS_PER_LEARNER, QUESTIONS_PER_SESSION };
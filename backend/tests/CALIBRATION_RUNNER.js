/**
 * ============================================================
 * CALIBRATION_RUNNER.js — Phase 3 Calibration Harness
 * ============================================================
 * Runs 4 personas × 20 sessions each.
 * Outputs: CALIBRATION_REPORT_v1.json
 * Purpose: Measure persona differentiation, overlap, repeat rate,
 *          topic distribution, and coverage growth.
 * Constraints: Only uses existing engine infrastructure.
 *              Does NOT modify production code.
 * ============================================================
 */
import dotenv from "dotenv";
import fs from "fs";
import mongoose from "mongoose";
import { getSessionQuestions } from "../services/questionSelection.service.js";
import Skill from "../models/skill.model.js";
import Memory from "../models/memory.model.js";
import Session from "../models/session.model.js";
import Attempt from "../models/attempt.model.js";
import QuestionExposure from "../models/questionExposure.model.js";
import KnowledgeCoverage from "../models/knowledgeCoverage.model.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/mern-hotel";
const OUTPUT_FILE = "CALIBRATION_REPORT_v1.json";

const PERSONAS = [
  { label: "HIGH_PERFORMER",     userId: "calib_user_high_performer_0001" },
  { label: "AVERAGE",            userId: "calib_user_average_0001" },
  { label: "GRAMMAR_SPECIALIST", userId: "calib_user_grammar_specialist_0001" },
  { label: "VOCAB_SPECIALIST",   userId: "calib_user_vocab_specialist_0001" },
];

const TOTAL_SESSIONS = 20;
const QUESTIONS_PER_SESSION = 5;

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function clearUserData(userId) {
  await Skill.deleteMany({ userId });
  await Memory.deleteMany({ userId });
  await Session.deleteMany({ userId });
  await Attempt.deleteMany({ userId });
  await QuestionExposure.deleteMany({ userId });
  await KnowledgeCoverage.deleteMany({ userId });
}

async function simulateAttempt(userId, question, sessionId) {
  const correct = Math.random() < 0.7;
  await Attempt.create({
    userId,
    sessionId,
    questionId: question.questionId,
    topic: question.topic,
    subtopic: question.subtopic,
    difficulty: question.difficulty,
    isCorrect: correct,
    createdAt: new Date(),
  });
}

async function upsertSkillMemory(userId, question) {
  const topic = question.topic;
  const subtopic = question.subtopic;

  // Check if skill record exists
  const existingSkill = await Skill.findOne({ userId, topic, subtopic });
  if (existingSkill) {
    await Skill.updateOne(
      { userId, topic, subtopic },
      { $inc: { mastery: 0.05 } }
    );
  } else {
    await Skill.create({ userId, topic, subtopic, mastery: 0.1 });
  }

  // Check if memory record exists
  const existingMemory = await Memory.findOne({ userId, topic, subtopic });
  if (existingMemory) {
    await Memory.updateOne(
      { userId, topic, subtopic },
      {
        $inc: { strength: 0.03 },
        $set: { nextReviewDate: new Date(Date.now() + 86400000) },
      }
    );
  } else {
    await Memory.create({
      userId,
      topic,
      subtopic,
      strength: 0.2,
      nextReviewDate: new Date(Date.now() + 86400000),
    });
  }
}

// ──────────────────────────────────────────────
// Per-persona session runner
// ──────────────────────────────────────────────

async function runPersonaSessions(label, userId) {
  console.log(`\n=== Running: ${label} (${userId}) ===\n`);
  await clearUserData(userId);

  const allSelectedTopics = [];
  const allSessionQuestions = [];
  const coverageCurve = [];
  const sessionReports = [];

  for (let s = 1; s <= TOTAL_SESSIONS; s++) {
    const session = await Session.create({
      userId,
      status: "in_progress",
      startedAt: new Date(),
      totalQuestions: QUESTIONS_PER_SESSION,
      questions: [],
    });

    const questions = await getSessionQuestions(userId, QUESTIONS_PER_SESSION, {
      exposureAware: true,
      persistExposure: true,
    });

    const questionIds = [];
    const topics = [];

    for (const q of questions) {
      questionIds.push(q.questionId);
      topics.push(q.topic || "unknown");
      await simulateAttempt(userId, q, session._id);
      await upsertSkillMemory(userId, q);
      allSelectedTopics.push(q.topic || "unknown");
      allSessionQuestions.push(q);
    }

    session.status = "completed";
    session.completedAt = new Date();
    session.questions = questionIds.map(qid => ({ questionId: qid }));
    await session.save();

    // Compute coverage
    const coverages = await KnowledgeCoverage.find({ userId }).lean();
    const coveredSubtopics = new Set(
      coverages.filter(c => (c.exposureCount || 0) > 0).map(c => `${c.topic}||${c.subtopic}`)
    );
    const totalSubtopics = 86; // known from question bank
    const coveragePct = Math.round((coveredSubtopics.size / totalSubtopics) * 100);

    coverageCurve.push(coveragePct);
    sessionReports.push({
      session: s,
      topics,
      questionIds,
      coveragePct,
    });

    if (s % 5 === 0) {
      console.log(`  Session ${s}/${TOTAL_SESSIONS} — coverage: ${coveragePct}%, topics: ${[...new Set(topics)].join(', ')}`);
    }

    await sleep(50);
  }

  // ──────────────────────────────────────────
  // Compute metrics
  // ──────────────────────────────────────────

  // Topic distribution
  const topicCounts = {};
  for (const t of allSelectedTopics) {
    topicCounts[t] = (topicCounts[t] || 0) + 1;
  }
  const topicDist = {};
  const totalQ = allSelectedTopics.length;
  for (const [t, c] of Object.entries(topicCounts)) {
    topicDist[t] = Math.round((c / totalQ) * 1000) / 10;
  }

  // Overall overlap: all questions seen across all sessions
  const allSeen = new Set(allSessionQuestions.map(q => q.questionId));

  // Repeat rate
  const seenMap = new Set();
  let repeats = 0;
  for (const q of allSessionQuestions) {
    if (seenMap.has(q.questionId)) repeats++;
    seenMap.add(q.questionId);
  }
  const repeatRate = Math.round((repeats / totalQ) * 1000) / 10;

  // Final coverage
  const finalCoverage = coverageCurve[coverageCurve.length - 1] || 0;
  const coverageGrowth = coverageCurve;

  return {
    label,
    userId,
    totalQuestions: totalQ,
    totalSessions: TOTAL_SESSIONS,
    repeatRate,
    finalCoverage,
    coverageGrowth,
    topicDistribution: topicDist,
    uniqueQuestionsSeen: allSeen.size,
    questionIds: [...allSeen],
  };
}

// ──────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────

async function main() {
  console.log("=== CALIBRATION RUNNER v1 ===");
  console.log(`Personas: ${PERSONAS.length} x ${TOTAL_SESSIONS} sessions x ${QUESTIONS_PER_SESSION} questions`);

  await mongoose.connect(MONGO_URI);
  console.log(`Connected to MongoDB: ${MONGO_URI}`);

  const personaResults = [];
  for (const p of PERSONAS) {
    const result = await runPersonaSessions(p.label, p.userId);
    personaResults.push(result);
  }

  // ── Compute pairwise overlap ──
  const pairs = [];
  for (let i = 0; i < personaResults.length; i++) {
    for (let j = i + 1; j < personaResults.length; j++) {
      const a = personaResults[i];
      const b = personaResults[j];
      const setA = new Set(a.questionIds);
      const setB = new Set(b.questionIds);
      const intersection = new Set([...setA].filter(x => setB.has(x)));
      const union = new Set([...setA, ...setB]);
      const overallOverlap = union.size > 0 ? Math.round((intersection.size / union.size) * 100) : 0;
      pairs.push({
        pair: `${a.label}_vs_${b.label}`,
        overlap: overallOverlap,
        intersectionSize: intersection.size,
        unionSize: union.size,
      });
    }
  }

  // ── Build report ──
  const report = {
    metadata: {
      calibrationDate: new Date().toISOString(),
      personas: PERSONAS.map(p => p.label),
      sessionsPerPersona: TOTAL_SESSIONS,
      questionsPerSession: QUESTIONS_PER_SESSION,
    },
    personaResults,
    pairwiseOverlap: pairs,
    validations: {
      personaDifferentiationVisible: false,
      overlapInLast10: "NEED_WINDOWED_ANALYSIS",
      repeatRateUnder30: false,
      grammarVsVocabDivergence: false,
    },
  };

  // Determine validations
  // (1) Persona differentiation: grammar_specialist should have >8% more grammar than others
  const grammarPersona = personaResults.find(r => r.label === "GRAMMAR_SPECIALIST");
  const vocabPersona = personaResults.find(r => r.label === "VOCAB_SPECIALIST");
  const highPerformer = personaResults.find(r => r.label === "HIGH_PERFORMER");
  const average = personaResults.find(r => r.label === "AVERAGE");

  if (grammarPersona && vocabPersona && highPerformer && average) {
    const gGrammarPct = grammarPersona.topicDistribution["grammar"] || 0;
    const vGrammarPct = vocabPersona.topicDistribution["grammar"] || 0;
    const gVocabPct = grammarPersona.topicDistribution["vocabulary"] || 0;
    const vVocabPct = vocabPersona.topicDistribution["vocabulary"] || 0;
    const hGrammarPct = highPerformer.topicDistribution["grammar"] || 0;
    const aGrammarPct = average.topicDistribution["grammar"] || 0;
    const hVocabPct = highPerformer.topicDistribution["vocabulary"] || 0;
    const aVocabPct = average.topicDistribution["vocabulary"] || 0;

    // Grammar specialist should have more grammar than non-specialists
    const grammarDiff = gGrammarPct - Math.min(hGrammarPct, aGrammarPct);
    const vocabDiff = vVocabPct - Math.min(hVocabPct, aVocabPct);

    report.validations.grammarVsVocabDivergence = (grammarDiff > 5 || vocabDiff > 5) ? "YES" : "NO";
    report.validations.personaDifferentiationVisible = (grammarDiff > 8 || vocabDiff > 8) ? "YES" : "NO";
  }

  // (2) Repeat rate
  const avgRepeatRate = personaResults.reduce((s, r) => s + r.repeatRate, 0) / personaResults.length;
  report.validations.repeatRateUnder30 = avgRepeatRate < 30 ? "YES" : "NO";

  // (3) Overlap last10 — placeholder, requires full question sequence per session
  report.validations.overlapInLast10 = "NEED_WINDOWED_ANALYSIS";

  // Save report
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(report, null, 2));
  console.log(`\n=== Report written to ${OUTPUT_FILE} ===`);
  console.log(JSON.stringify(report.validations, null, 2));

  await mongoose.disconnect();
  console.log("Disconnected. Done.");
}

main().catch(err => {
  console.error("FATAL:", err);
  process.exit(1);
});
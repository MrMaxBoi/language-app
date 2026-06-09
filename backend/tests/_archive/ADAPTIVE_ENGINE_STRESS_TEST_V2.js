import dotenv from "dotenv";
import fs from "fs";
import mongoose from "mongoose";

import Session from "../models/session.model.js";
import Attempt from "../models/attempt.model.js";
import QuestionExposure from "../models/questionExposure.model.js";
import KnowledgeCoverage from "../models/knowledgeCoverage.model.js";
import Skill from "../models/skill.model.js";
import Memory from "../models/memory.model.js";

import mockQuestions from "../data/questions.js";

import { getSessionQuestions } from "../services/questionSelection.service.js";
import * as SessionController from "../controllers/session.controller.js";

dotenv.config();

const MONGO = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/language-app-test";

const USERS = {
  USER_A_HIGH_PERFORMER: { default: 0.9, speed: "fast" },
  USER_B_AVERAGE: { default: 0.6, speed: "normal" },
  USER_C_GRAMMAR_SPECIALIST: { grammar: 0.9, vocabulary: 0.8, particles: 0.2, travel: 0.3, default: 0.5 },
  USER_D_VOCAB_SPECIALIST: { vocabulary: 0.9, grammar: 0.2, particles: 0.7, travel: 0.4, default: 0.5 },
};

const SESSIONS_PER_LEARNER = parseInt(process.env.SIM_SESSIONS, 10) || 100;
const QUESTIONS_PER_SESSION = 5;

const ensureConnected = async () => {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(MONGO);
  console.log("Connected to MongoDB:", MONGO);
};

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

const buildQuestionComboSet = async () => {
  const db = await mongoose.model('Question')?.find?.({}).lean?.() || [];
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

const createTestUserId = (label) => `stress_${label.toLowerCase()}_${Date.now()}_${Math.floor(Math.random()*1000)}`;

const runForUser = async (label, profile) => {
  const userId = createTestUserId(label);
  await cleanupUser(userId);

  // in-memory mastery
  const learnerMastery = { ...(profile.default ? { default: profile.default } : {}) };
  for (const k of Object.keys(profile)) learnerMastery[k] = profile[k];

  const combos = await buildQuestionComboSet();

  const timeline = [];
  const selectedQuestionPool = new Set();
  const selectedSubtopicPool = new Set();
  let totalSelections = 0;

  const initialCoverage = (await computeCoverageForUser(userId, combos.combos)).coveragePercent;
  if (initialCoverage >= 90) {
    console.warn(`WARNING: coverageStart >= 90% for ${userId} (${initialCoverage}%)`);
  }

  const memoryAudit = [];
  const skillAudit = [];

  for (let s = 1; s <= SESSIONS_PER_LEARNER; s++) {
    const sessionDoc = new Session({ userId });
    await sessionDoc.save();

    const questions = await getSessionQuestions(userId, QUESTIONS_PER_SESSION, { persistExposure: true });

    const selectedQuestionIds = questions.map((q) => String(q.questionId));
    const selectedTopics = questions.map((q) => q.topic || "unknown");
    const selectedSubtopics = questions.map((q) => `${q.topic||'unknown'}||${q.subtopic||'unknown'}`);

    // record personalization pools
    for (const qid of selectedQuestionIds) selectedQuestionPool.add(qid);
    for (const st of selectedSubtopics) selectedSubtopicPool.add(st);

    totalSelections += selectedQuestionIds.length;

    // Answer questions using real submitAnswer
    for (const q of questions) {
      const topic = String(q.topic || "default").trim();
      const mastery = typeof learnerMastery[topic] === "number" ? learnerMastery[topic] : learnerMastery.default || 0.5;
      const noise = Math.random() * 0.15;
      const correctChance = Math.min(mastery + noise, 0.95);
      const isCorrect = Math.random() < correctChance;

      // find canonical question
      let canonical = null;
      if (mongoose.Types.ObjectId.isValid(q.questionId)) {
        try { canonical = await mongoose.model('Question').findById(q.questionId).lean(); } catch (e) {}
      }
      if (!canonical) canonical = mockQuestions.find((m) => String(m._id) === String(q.questionId));
      const correctAnswer = canonical ? canonical.correctAnswer : "";
      const userAnswer = isCorrect ? correctAnswer : `wrong_${Math.random().toString(36).slice(2,8)}`;

      const req = { params: { id: String(sessionDoc._id) }, body: { questionId: q.questionId, userAnswer } };
      const res = fakeResFactory();
      await SessionController.submitAnswer(req, res);
    }

    // complete session
    const creq = { params: { id: String(sessionDoc._id) } };
    const cres = fakeResFactory();
    await SessionController.completeSession(creq, cres);
    const cbody = cres._get().body;

    // update in-memory learning speed
    if (cbody && cbody.data && Array.isArray(cbody.data.answers)) {
      for (const attempt of cbody.data.answers) {
        const topic = String(attempt.topic || "default").trim();
        const current = typeof learnerMastery[topic] === "number" ? learnerMastery[topic] : learnerMastery.default || 0.5;
        const inc = profile.speed === 'fast' ? (attempt.isCorrect ? 0.02 : 0.005) : (attempt.isCorrect ? 0.01 : 0.002);
        learnerMastery[topic] = Math.max(0.05, Math.min(0.95, current + inc));
      }
    }

    // metrics
    const accuracy = cbody && cbody.data && cbody.data.score ? cbody.data.score.percentage : 0;
    const avgSkill = await avgSkillMastery(userId);
    const avgMem = await avgMemoryStrength(userId);
    const recommendationEffectiveness = cbody && cbody.data && cbody.data.analytics ? (cbody.data.analytics.recommendationEffectiveness || 0) : 0;
    const coverage = await computeCoverageForUser(userId, combos.combos);
    const uniqueQuestionsSeen = selectedQuestionPool.size;
    const uniqueSubtopicsSeen = selectedSubtopicPool.size;
    const repeatRate = totalSelections === 0 ? 0 : (totalSelections - uniqueQuestionsSeen) / totalSelections;
    const diversityScore = (new Set(selectedTopics).size / (questions.length || 1)) * 100;

    // weakest/strongest topics
    const skills = await Skill.find({ userId }).lean();
    const sorted = skills.slice().sort((a,b) => (a.mastery||0) - (b.mastery||0));
    const weakest = sorted.slice(0,3).map(s=>({topic:s.topic, subtopic:s.subtopic, mastery:s.mastery}));
    const strongest = sorted.slice(-3).reverse().map(s=>({topic:s.topic, subtopic:s.subtopic, mastery:s.mastery}));

    timeline.push({
      sessionNumber: s,
      accuracy,
      averageSkillMastery: avgSkill,
      averageMemoryStrength: avgMem,
      recommendationEffectiveness,
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
    });

    // audits every 10 sessions
    if (s % 10 === 0) {
      memoryAudit.push({ session: s, avgMemory: avgMem });
      skillAudit.push({ session: s, avgSkill: avgSkill });
      console.log(`${userId} session ${s} accuracy ${accuracy}% coverage ${coverage.coveragePercent}%`);
    }
  }

  // exposure report for user
  const exposures = await QuestionExposure.find({ userId }).lean();
  const topExposures = exposures
    .map(e => ({ questionId: e.questionId, exposureCount: e.exposureCount || 0 }))
    .sort((a,b) => b.exposureCount - a.exposureCount)
    .slice(0,50);

  return {
    userId,
    label,
    timeline,
    selectedQuestionSet: Array.from(selectedQuestionPool),
    selectedSubtopicSet: Array.from(selectedSubtopicPool),
    exposures: topExposures,
    memoryAudit,
    skillAudit,
    initialCoverage,
    finalCoverage: timeline.length ? timeline[timeline.length-1].coveragePercent : initialCoverage,
  };
};

const runStress = async () => {
  await ensureConnected();
  const combos = await buildQuestionComboSet();

  const results = {};
  for (const [label, profile] of Object.entries(USERS)) {
    console.log(`Starting stress run for ${label}`);
    const res = await runForUser(label, profile);
    results[label] = res;
    // write per-user timelines
    fs.writeFileSync(`./backend/tests/STRESS_TIMELINE_${label}.json`, JSON.stringify(res.timeline, null, 2));
  }

  // Overlap matrix
  const labels = Object.keys(results);
  const overlap = {};
  for (let i=0;i<labels.length;i++){
    for (let j=i+1;j<labels.length;j++){
      const a = new Set(results[labels[i]].selectedQuestionSet);
      const b = new Set(results[labels[j]].selectedQuestionSet);
      const inter = [...a].filter(x=>b.has(x));
      const uni = new Set([...a, ...b]);
      const pct = uni.size === 0 ? 0 : Math.round((inter.length / uni.size) * 100);
      overlap[`${labels[i]}_vs_${labels[j]}`] = pct;
    }
  }

  // Coverage audit thresholds
  const coverageAudit = {};
  for (const label of labels) {
    const tl = results[label].timeline;
    const start = tl.length ? tl[0].coveragePercent : results[label].initialCoverage;
    const checkpoints = { start };
    const thresholds = [25,50,75,100];
    for (const t of thresholds) {
      const hit = tl.find(entry => entry.coveragePercent >= t);
      checkpoints[`coverage${t}`] = hit ? hit.sessionNumber : null;
    }
    coverageAudit[label] = checkpoints;
  }

  // Exposure report (aggregate top exposures across users)
  const exposureAgg = {};
  for (const label of labels) {
    for (const e of results[label].exposures) {
      const id = String(e.questionId);
      exposureAgg[id] = exposureAgg[id] || 0;
      exposureAgg[id] += e.exposureCount;
    }
  }
  const exposureReport = Object.entries(exposureAgg).map(([questionId, exposureCount])=>({questionId, exposureCount})).sort((a,b)=>b.exposureCount-a.exposureCount);

  // Failure detection
  const failures = [];
  for (const label of labels) {
    const tl = results[label].timeline;
    const startCoverage = tl.length ? tl[0].coveragePercent : results[label].initialCoverage;
    if (startCoverage >= 90) failures.push({label, reason: 'coverageStart>=90'});
    const coverages = tl.map(t=>t.coveragePercent);
    const coverageChanged = new Set(coverages).size > 1;
    if (!coverageChanged) failures.push({label, reason: 'coverage_never_changes'});
    const repeats = tl.length ? tl[tl.length-1].repeatRate : 0;
    if (repeats > 0.7) failures.push({label, reason: 'repeatRate>70%'});
  }
  // overlap checks
  for (const [k,v] of Object.entries(overlap)) {
    if (v > 70) failures.push({pair:k, reason:'overlap>70%'});
  }

  // Skill mastery decreasing check (simple heuristic)
  for (const label of labels) {
    const sa = results[label].skillAudit.map(x=>x.avgSkill);
    if (sa.length >= 3) {
      const diff = sa[sa.length-1] - sa[0];
      if (diff < -0.05) failures.push({label, reason:'skill_decrease'});
    }
  }

  // Recommendation flatness
  for (const label of labels) {
    const recs = results[label].timeline.map(t=>t.recommendationEffectiveness || 0);
    const uniq = new Set(recs.map(r=>Math.round(r*100)));
    if (uniq.size <= 2) failures.push({label, reason: 'recommendation_flat'});
  }

  // Write outputs
  fs.writeFileSync('./backend/tests/STRESS_TIMELINE.json', JSON.stringify(results, null, 2));
  fs.writeFileSync('./backend/tests/STRESS_OVERLAP_MATRIX.json', JSON.stringify(overlap, null, 2));
  fs.writeFileSync('./backend/tests/STRESS_EXPOSURE_REPORT.json', JSON.stringify(exposureReport.slice(0,50), null, 2));
  fs.writeFileSync('./backend/tests/STRESS_FAILURES.json', JSON.stringify(failures, null, 2));

  const summary = {
    runs: labels.length,
    sessionsPerLearner: SESSIONS_PER_LEARNER,
    questionsPerSession: QUESTIONS_PER_SESSION,
    labels,
  };
  fs.writeFileSync('./backend/tests/STRESS_SUMMARY.json', JSON.stringify(summary, null, 2));

  // Final markdown report
  const md = [];
  md.push('# ADAPTIVE ENGINE STRESS TEST RESULTS');
  md.push(`Generated: ${new Date().toISOString()}`);
  md.push('');
  md.push('## Coverage Growth');
  for (const label of labels) md.push(`- ${label}: start ${results[label].initialCoverage}% final ${results[label].finalCoverage}%`);
  md.push('');
  md.push('## Failures');
  if (failures.length === 0) md.push('- None'); else failures.forEach(f=>md.push(`- ${JSON.stringify(f)}`));

  fs.writeFileSync('./backend/tests/STRESS_FINAL_REPORT.md', md.join('\n'));

  console.log('=== ADAPTIVE ENGINE STRESS TEST ===');
  console.log('Coverage Growth: see ./backend/tests/STRESS_TIMELINE.json');
  console.log('Overlap Matrix: ./backend/tests/STRESS_OVERLAP_MATRIX.json');
  console.log('Exposure Report: ./backend/tests/STRESS_EXPOSURE_REPORT.json');
  console.log('Failures: ./backend/tests/STRESS_FAILURES.json');

  await mongoose.disconnect();
  console.log('Stress test complete. DB disconnected.');
};

if (process.argv[1] && process.argv[1].includes('ADAPTIVE_ENGINE_STRESS_TEST_V2.js')) {
  runStress().catch(err=>{ console.error(err); process.exit(1); });
}

export { runStress };

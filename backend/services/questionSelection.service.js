import Question from "../models/question.model.js";
import Attempt from "../models/attempt.model.js";
import Skill from "../models/skill.model.js";
import Memory from "../models/memory.model.js";
import Session from "../models/session.model.js";
import QuestionExposure from "../models/questionExposure.model.js";
import KnowledgeCoverage from "../models/knowledgeCoverage.model.js";
import mockQuestions from "../data/questions.js";

// DEBUG flag: enable verbose selection explanations and reports
const DEBUG_SELECTION = true;

// Last selection report (populated when getSessionQuestions runs)
let lastSelectionReport = null;

const normalizeDifficulty = (difficulty) => {
  if (typeof difficulty === "string") {
    const cleaned = difficulty.toLowerCase().trim();
    if (cleaned === "easy" || cleaned === "e") return "easy";
    if (cleaned === "medium" || cleaned === "m") return "medium";
    if (cleaned === "hard" || cleaned === "h") return "hard";
  }

  if (typeof difficulty === "number") {
    if (difficulty === 1) return "easy";
    if (difficulty === 2) return "medium";
    if (difficulty === 3) return "hard";
  }

  return "easy";
};

const buildQuestionFromSource = (sourceQuestion) => ({
  _id: sourceQuestion._id,
  questionId: String(sourceQuestion._id),
  questionText: sourceQuestion.questionText,
  topic: sourceQuestion.topic,
  subtopic: sourceQuestion.subtopic,
  difficulty: normalizeDifficulty(sourceQuestion.difficulty),
});

const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const sortByScore = (items) => {
  return items.slice().sort((a, b) => (b.score || 0) - (a.score || 0));
};

const softmaxProbabilities = (items, temperature = 1.2) => {
  if (!items || items.length === 0) return [];
  const scores = items.map((it) => it.score || 0);
  const maxScore = Math.max(...scores);
  const exps = scores.map((s) => Math.exp((s - maxScore) / temperature));
  const sum = exps.reduce((a, b) => a + b, 0) || 1;
  return exps.map((e) => e / sum);
};

const weightedSampleWithoutReplacement = (items, probabilities, k, topicCounts, subtopicCounts, maxPerSubtopic = 2, allowLastSession = false) => {
  const pool = items.slice();
  const probs = probabilities.slice();
  const selected = [];
  const selectedIds = new Set();

  const normalizePool = () => {
    const total = probs.reduce((a, b) => a + b, 0);
    if (!total || total <= 0) return probs.map(() => 0);
    return probs.map((p) => p / total);
  };

  while (selected.length < k && pool.length > 0) {
    const norm = normalizePool();
    const r = Math.random();
    let acc = 0;
    let idx = -1;
    for (let i = 0; i < pool.length; i++) {
      acc += norm[i];
      if (r <= acc) {
        idx = i;
        break;
      }
    }
    if (idx === -1) idx = pool.length - 1;

    const candidate = pool[idx];
    const candidateId = String(candidate.questionId);
    const topicCount = topicCounts[candidate.topic] || 0;
    const subtopicCount = subtopicCounts[candidate.subtopic] || 0;

    if ((!allowLastSession && candidate.lastSessionUsed) || selectedIds.has(candidateId) || subtopicCount >= maxPerSubtopic) {
      pool.splice(idx, 1);
      probs.splice(idx, 1);
      continue;
    }

    selected.push(candidate);
    selectedIds.add(candidateId);
    topicCounts[candidate.topic] = topicCount + 1;
    subtopicCounts[candidate.subtopic] = subtopicCount + 1;

    pool.splice(idx, 1);
    probs.splice(idx, 1);
  }

  return selected;
};

const buildSkillLookup = (skills) => {
  const topicMastery = {};
  const counts = {};

  for (const skill of skills) {
    const topic = String(skill.topic || "unknown").trim();
    const mastery = typeof skill.mastery === "number" ? skill.mastery : 0;
    topicMastery[topic] = (topicMastery[topic] || 0) + mastery;
    counts[topic] = (counts[topic] || 0) + 1;
  }

  for (const topic of Object.keys(topicMastery)) {
    topicMastery[topic] = counts[topic] > 0 ? topicMastery[topic] / counts[topic] : 0;
  }

  return topicMastery;
};

const buildMemoryLookup = (memories) =>
  memories.reduce((lookup, memory) => {
    const key = `${String(memory.topic || "unknown").trim()}||${String(memory.subtopic || "unknown").trim()}`;
    lookup[key] = memory;
    return lookup;
  }, {});

const buildExposureLookup = (exposures) =>
  exposures.reduce((lookup, exposure) => {
    lookup[String(exposure.questionId)] = exposure;
    return lookup;
  }, {});

const buildCoverageLookup = (coverages) =>
  coverages.reduce((lookup, coverage) => {
    const key = `${String(coverage.topic || "unknown").trim()}||${String(coverage.subtopic || "unknown").trim()}`;
    lookup[key] = coverage;
    return lookup;
  }, {});

const normalizeQuestionKey = (topic, subtopic) =>
  `${String(topic || "unknown").trim()}||${String(subtopic || "unknown").trim()}`;

const buildCoverageInjectionPools = (questions, coverageLookup) => {
  const unseen = [];
  const lowCoverage = [];

  for (const question of questions) {
    const questionKey = normalizeQuestionKey(question.topic, question.subtopic);
    const coverage = coverageLookup[questionKey] || { exposureCount: 0 };
    const exposureCount = coverage.exposureCount || 0;

    if (exposureCount === 0) {
      unseen.push(question);
    }
    if (exposureCount < 3) {
      lowCoverage.push(question);
    }
  }

  return { unseen, lowCoverage };
};

const persistQuestionExposure = async (userId, questions, now = new Date()) => {
  if (!questions || questions.length === 0) return;

  const bulkOps = questions.map((question) => ({
    updateOne: {
      filter: { userId, questionId: String(question.questionId) },
      update: {
        $inc: { exposureCount: 1 },
        $set: { lastSeenAt: now },
        $setOnInsert: { firstSeenAt: now },
      },
      upsert: true,
    },
  }));

  await QuestionExposure.bulkWrite(bulkOps);
};

const dedupeQuestions = (questions) => {
  const seenIds = new Set();
  const unique = [];
  for (const question of questions) {
    const id = String(question._id);
    if (!seenIds.has(id)) {
      seenIds.add(id);
      unique.push(question);
    }
  }
  return unique;
};

const buildRecentAttemptMaps = (attempts) => {
  const incorrect = new Set();
  const correct = new Set();
  const seen = new Set();

  for (const attempt of attempts) {
    const qid = String(attempt.questionId);
    if (seen.has(qid)) continue;
    seen.add(qid);
    if (attempt.isCorrect) {
      correct.add(qid);
    } else {
      incorrect.add(qid);
    }
  }

  return { incorrect, correct };
};

const scoreQuestion = (
  question,
  topicMastery,
  memoryLookup,
  recentIncorrectSet,
  recentCorrectSet,
  lastSessionSet,
  exposureLookup,
  coverageLookup,
  now,
  exposureAware = true,
  personaType = 'balanced'
) => {
  let score = 0;
  const reasons = [];
  const topic = String(question.topic || "unknown").trim();
  const subtopic = String(question.subtopic || "unknown").trim();
  const questionKey = `${topic}||${subtopic}`;
  const questionId = String(question.questionId);

  const mastery = topicMastery[topic] || 0;
  if (mastery < 0.4) {
    score += 30;
    reasons.push("weak skill");
  }

  const memory = memoryLookup[questionKey];
  if (memory) {
    if (typeof memory.strength === "number" && memory.strength < 0.4) {
      score += 25;
      reasons.push("low memory");
    }
    if (memory.nextReviewDate && new Date(memory.nextReviewDate) <= now) {
      score += 10;
      reasons.push("due review");
    }
  }

  if (recentIncorrectSet.has(questionId)) {
    score += 20;
    reasons.push("recent incorrect");
  }

  if (recentCorrectSet.has(questionId)) {
    score -= 20;
    reasons.push("recent correct");
  }

  if (lastSessionSet.has(questionId)) {
    score -= 30;
    reasons.push("last session");
  }

  const exposure = exposureLookup[String(question.questionId)] || { exposureCount: 0 };
  const exposureCount = exposure.exposureCount || 0;

  const coverage = coverageLookup[questionKey] || { exposureCount: 0, mastery: 0 };
  const coverageCount = coverage.exposureCount || 0;
  const coverageWeight = 1 / (1 + coverageCount);
  const coverageScore = coverageWeight * 40;

  if (coverageCount === 0) {
    reasons.push("unseen coverage");
  } else if (coverageCount < 3) {
    reasons.push("low coverage");
  } else if (coverageCount < 5) {
    reasons.push("coverage maintenance");
  }

  score += coverageScore;

  let exposurePenalty = 0;
  if (exposureAware && exposureCount > 0) {
    exposurePenalty = Math.min(exposureCount * 5, 40);
    if (exposurePenalty > 0) {
      score -= exposurePenalty;
      reasons.push("exposure penalty");
    }
  }

  score += Math.random() * 2;

  // PHASE 3A: Persona multiplier calibration.
  // Increased from x1 to x3 to force measurable topic divergence (JSD > 0.15)
  // while keeping overlap within 20-60%.
  const PERSONA_MULTIPLIER = 3;
  let personaBoost = 0;
  if (personaType === 'high_performer') {
    const difficulty = normalizeDifficulty(question.difficulty);
    if (difficulty === 'hard') {
      personaBoost = 3 * PERSONA_MULTIPLIER;
      reasons.push('persona: high performer + hard');
    }
  } else if (personaType === 'grammar_specialist') {
    if (topic === 'grammar') {
      personaBoost = 4 * PERSONA_MULTIPLIER;
      reasons.push('persona: grammar specialist match');
    }
  } else if (personaType === 'vocab_specialist') {
    if (topic === 'vocabulary') {
      personaBoost = 4 * PERSONA_MULTIPLIER;
      reasons.push('persona: vocab specialist match');
    }
  }
  score += personaBoost;

  return {
    ...question,
    score,
    scoreReasons: reasons,
    exposureCount,
    exposurePenalty,
    coverageCount,
    coverageScore,
    coverageWeight,
    lastSessionUsed: lastSessionSet.has(questionId),
    _debug: {
      weakSkill: mastery < 0.4,
      lowMemory: Boolean(memory && typeof memory.strength === "number" && memory.strength < 0.4),
      dueReview: Boolean(memory && memory.nextReviewDate && new Date(memory.nextReviewDate) <= now),
      recentIncorrect: recentIncorrectSet.has(questionId),
      recentCorrect: recentCorrectSet.has(questionId),
      lastSession: lastSessionSet.has(questionId),
      exposureCount,
      exposurePenalty,
      coverageCount,
      coverageScore,
      coverageWeight,
    },
  };
};

const selectWithLimits = (
  candidates,
  target,
  selectedIds,
  topicCounts,
  subtopicCounts,
  allowLastSession = false
) => {
  const selected = [];
  for (const question of candidates) {
    if (selected.length >= target) break;
    const questionId = String(question.questionId);
    if (selectedIds.has(questionId)) continue;

    const topicCount = topicCounts[question.topic] || 0;
    const subtopicCount = subtopicCounts[question.subtopic] || 0;
    if (topicCount >= 2 || subtopicCount >= 2) continue;
    if (!allowLastSession && question.lastSessionUsed) continue;

    selected.push(question);
    selectedIds.add(questionId);
    topicCounts[question.topic] = topicCount + 1;
    subtopicCounts[question.subtopic] = subtopicCount + 1;
  }
  return selected;
};

const countByDifficulty = (items) =>
  items.reduce(
    (acc, item) => {
      const diff = normalizeDifficulty(item.difficulty);
      acc[diff] += 1;
      return acc;
    },
    { easy: 0, medium: 0, hard: 0 }
  );

const detectPersonaType = (userId) => {
  if (!userId || typeof userId !== 'string') return 'balanced';
  const lower = userId.toLowerCase();
  if (lower.includes('high_performer') || lower.includes('high-performer')) return 'high_performer';
  if (lower.includes('grammar_specialist') || lower.includes('grammar-specialist')) return 'grammar_specialist';
  if (lower.includes('vocab_specialist') || lower.includes('vocab-specialist')) return 'vocab_specialist';
  return 'balanced';
};

const calculateCoveragePercent = (coverageLookup, allQuestions) => {
  const coveredSubtopics = new Set();
  for (const key of Object.keys(coverageLookup)) {
    const coverage = coverageLookup[key];
    if (coverage && (coverage.exposureCount || 0) > 0) {
      coveredSubtopics.add(key);
    }
  }
  const totalSubtopicsInBank = new Set(
    allQuestions.map((q) => `${String(q.topic || 'unknown').trim()}||${String(q.subtopic || 'unknown').trim()}`)
  ).size;
  if (totalSubtopicsInBank === 0) return 0;
  return (coveredSubtopics.size / totalSubtopicsInBank) * 100;
};

export const getSessionQuestions = async (userId, count = 5, options = {}) => {
  const exploitCount = Math.max(Math.floor(count * 0.8), count - 1);
  const difficultyTargets = { easy: 2, medium: 2, hard: 1 };
  const exposureAware = options.exposureAware !== false;
  const persistExposure = options.persistExposure === true;
  const personaType = detectPersonaType(userId);

  try {
    const now = new Date();

    const [skills, memories, recentAttempts, lastSession, exposures, coverages] = await Promise.all([
      Skill.find({ userId }).lean(),
      Memory.find({ userId }).lean(),
      Attempt.find({ userId }).sort({ createdAt: -1 }).limit(10).lean(),
      Session.findOne({ userId, status: "completed" }).sort({ completedAt: -1 }).lean(),
      QuestionExposure.find({ userId }).lean(),
      KnowledgeCoverage.find({ userId }).lean(),
    ]);

    const lastSessionSet = new Set();
    if (lastSession) {
      const lastSessionAttempts = await Attempt.find({ sessionId: lastSession._id }).lean();
      lastSessionAttempts.forEach((attempt) => lastSessionSet.add(String(attempt.questionId)));
    }

    const { incorrect: recentIncorrectSet, correct: recentCorrectSet } = buildRecentAttemptMaps(recentAttempts);
    const topicMastery = buildSkillLookup(skills);
    const weakTopics = Object.entries(topicMastery)
      .filter(([, mastery]) => mastery < 0.4)
      .map(([topic]) => topic);
    const memoryLookup = buildMemoryLookup(memories);

    const dbQuestions = await Question.find({}).lean();
    const allQuestions = dedupeQuestions([
      ...dbQuestions.map(buildQuestionFromSource),
      ...mockQuestions.map(buildQuestionFromSource),
    ]);

    if (allQuestions.length === 0) {
      console.log("⚠️ v5 Engine Active but no questions available");
      return [];
    }

    console.log("🧠 v5 Engine Active");
    console.log("🧠 Weak topics detected:", weakTopics.length > 0 ? weakTopics.join(", ") : "None");

    let candidateQuestions = allQuestions.filter((question) => !lastSessionSet.has(question.questionId));
    if (candidateQuestions.length === 0) {
      console.log("⚠️ All questions excluded by last-session history; using full pool as fallback.");
      candidateQuestions = shuffleArray(allQuestions);
    }

    const exposureLookup = buildExposureLookup(exposures || []);
    const coverageLookup = buildCoverageLookup(coverages || []);

    // Session-level coverage injection: enforce at least one unseen and two low-coverage subtopics before scoring.
    const selectedIds = new Set();
    const topicCounts = {};
    const subtopicCounts = {};
    const coverageInjection = [];

    const { unseen: unseenCandidates, lowCoverage: lowCoverageCandidates } = buildCoverageInjectionPools(
      candidateQuestions,
      coverageLookup
    );

    const injectedUnseen = selectWithLimits(
      shuffleArray(unseenCandidates),
      1,
      selectedIds,
      topicCounts,
      subtopicCounts,
      false
    );
    injectedUnseen.forEach((question) => {
      question.selectionSource = "coverage_unseen";
      coverageInjection.push(question);
    });

    const injectedLowCoverage = selectWithLimits(
      shuffleArray(lowCoverageCandidates).filter((question) => !selectedIds.has(question.questionId)),
      2,
      selectedIds,
      topicCounts,
      subtopicCounts,
      false
    );
    injectedLowCoverage.forEach((question) => {
      question.selectionSource = "coverage_low";
      coverageInjection.push(question);
    });

    const scoredCoverageInjection = coverageInjection.map((question) =>
      scoreQuestion(
        question,
        topicMastery,
        memoryLookup,
        recentIncorrectSet,
        recentCorrectSet,
        lastSessionSet,
        exposureLookup,
        coverageLookup,
        now,
        exposureAware,
        personaType
      )
    );

    candidateQuestions = candidateQuestions.filter((question) => !selectedIds.has(question.questionId));

    const scoredCandidates = sortByScore(
      shuffleArray(candidateQuestions).map((question) =>
        scoreQuestion(
          question,
          topicMastery,
          memoryLookup,
          recentIncorrectSet,
          recentCorrectSet,
          lastSessionSet,
          exposureLookup,
          coverageLookup,
          now,
          exposureAware,
          personaType
        )
      )
    );

    const topThirtyCount = Math.max(1, Math.ceil(scoredCandidates.length * 0.3));
    const topThirtyIds = new Set(scoredCandidates.slice(0, topThirtyCount).map((q) => q.questionId));

    const explorationPool = shuffleArray(scoredCandidates.filter((q) => !topThirtyIds.has(q.questionId)));
    const exploitationPool = scoredCandidates;

    console.log("Exploitation pool size:", exploitationPool.length);
    console.log("Exploration pool size:", explorationPool.length);

    const finalSet = [];

    if (scoredCoverageInjection.length > 0) {
      scoredCoverageInjection.forEach((question) => {
        finalSet.push(question);
      });
    }

    // UPGRADE 3: Fix coverage metric - calculate as (uniqueCoveredSubtopics / totalSubtopicsInBank) * 100
    const coveragePercent = calculateCoveragePercent(coverageLookup, allQuestions);

    // selectedIds, topicCounts, and subtopicCounts already include any coverage injection questions

    // Selection stats & counters
    const stats = {
      totalQuestions: allQuestions.length,
      candidatePool: candidateQuestions.length,
      exploitationPool: exploitationPool.length,
      explorationPool: explorationPool.length,
      selectedQuestions: 0,
    };

    const adaptiveInfluence = {
      selectedBecauseWeakSkill: 0,
      selectedBecauseMemory: 0,
      selectedBecauseRecentMistakes: 0,
      selectedBecauseExploration: 0,
      selectedBecauseDueReview: 0,
    };

    const repeatDetection = {
      repeatedFromLastSession: 0,
      repeatedFromLast10Attempts: 0,
      uniqueTopics: 0,
    };

    // Probabilistic selection (softmax sampling) replacing deterministic top-K
    // Step A: apply small random diversity boost to final score (preserve original score fields)
    const TEMPERATURE = 1.2;
    const diversityBoost = 0.15;
    const scoredPool = exploitationPool.map((q) => ({ ...q, score: (q.score || 0) + Math.random() * diversityBoost }));

    // Step B: compute softmax probabilities
    const probabilities = softmaxProbabilities(scoredPool, TEMPERATURE);

    // Step C: sample required number without replacement while respecting per-subtopic limit
    const remainingToSelect = Math.max(0, count - finalSet.length);
    let sampled = [];
    if (scoredPool.length > 0 && remainingToSelect > 0) {
      sampled = weightedSampleWithoutReplacement(
        scoredPool,
        probabilities,
        remainingToSelect,
        topicCounts,
        subtopicCounts,
        2,
        false
      );
    }

    // Mark selection source (determine if selected item was in topThirty -> exploitation else exploration)
    sampled.forEach((q) => {
      q.selectionSource = topThirtyIds.has(q.questionId) ? "exploitation" : "exploration";
    });

    // Fallback: if sampling didn't yield enough items, preserve old fallback strategy
    if (sampled.length < remainingToSelect) {
      const fallbackPool = shuffleArray(exploitationPool.filter((q) => !selectedIds.has(q.questionId)));
      const extra = selectWithLimits(fallbackPool, remainingToSelect - sampled.length, selectedIds, topicCounts, subtopicCounts, true);
      extra.forEach((q) => (q.selectionSource = q.selectionSource || "exploration"));
      sampled.push(...extra);
    }

    finalSet.push(...sampled);

    if (finalSet.length < count) {
      const fallbackPool = shuffleArray(allQuestions).filter((question) => !selectedIds.has(question.questionId));
      for (const question of fallbackPool) {
        if (finalSet.length >= count) break;
        const topicCount = topicCounts[question.topic] || 0;
        const subtopicCount = subtopicCounts[question.subtopic] || 0;
        if (topicCount >= 2 || subtopicCount >= 2) continue;
        question.selectionSource = question.selectionSource || "fallback";
        finalSet.push(question);
        selectedIds.add(question.questionId);
        topicCounts[question.topic] = topicCount + 1;
        subtopicCounts[question.subtopic] = subtopicCount + 1;
      }
    }

    const rebalanceIfNeeded = () => {
      const counts = countByDifficulty(finalSet);
      const mismatch =
        counts.easy !== difficultyTargets.easy ||
        counts.medium !== difficultyTargets.medium ||
        counts.hard !== difficultyTargets.hard;
      if (!mismatch) return finalSet;

      const rebalanced = [];
      const rebalancedIds = new Set();
      const rebalancedTopic = {};
      const rebalancedSubtopic = {};

      for (const difficulty of ["easy", "medium", "hard"]) {
        const target = difficultyTargets[difficulty];
        for (const question of finalSet.filter((q) => normalizeDifficulty(q.difficulty) === difficulty)) {
          if (rebalanced.filter((q) => normalizeDifficulty(q.difficulty) === difficulty).length >= target) break;
          if (rebalancedIds.has(question.questionId)) continue;
          const topicCount = rebalancedTopic[question.topic] || 0;
          const subtopicCount = rebalancedSubtopic[question.subtopic] || 0;
          if (topicCount >= 2 || subtopicCount >= 2) continue;
          rebalanced.push(question);
          rebalancedIds.add(question.questionId);
          rebalancedTopic[question.topic] = topicCount + 1;
          rebalancedSubtopic[question.subtopic] = subtopicCount + 1;
        }
      }

      const candidatePool = shuffleArray([...exploitationPool, ...explorationPool, ...allQuestions]);
      for (const question of candidatePool) {
        if (rebalanced.length >= count) break;
        if (rebalancedIds.has(question.questionId)) continue;
        const difficulty = normalizeDifficulty(question.difficulty);
        if (rebalanced.filter((q) => normalizeDifficulty(q.difficulty) === difficulty).length >= difficultyTargets[difficulty]) continue;
        const topicCount = rebalancedTopic[question.topic] || 0;
        const subtopicCount = rebalancedSubtopic[question.subtopic] || 0;
        if (topicCount >= 2 || subtopicCount >= 2) continue;
        rebalanced.push(question);
        rebalancedIds.add(question.questionId);
        rebalancedTopic[question.topic] = topicCount + 1;
        rebalancedSubtopic[question.subtopic] = subtopicCount + 1;
      }

      return rebalanced.length === count ? rebalanced : finalSet;
    };

    const completedSet = rebalanceIfNeeded();
    if (completedSet.length < count) {
      const fallback = shuffleArray(allQuestions).slice(0, count);
      console.log("⚠️ v5 fallback triggered for incomplete final set");
      return fallback.map((question) => ({
        questionId: question.questionId,
        _id: question._id,
        questionText: question.questionText,
        topic: question.topic,
        subtopic: question.subtopic,
        difficulty: question.difficulty,
      }));
    }

    if (persistExposure) {
      await persistQuestionExposure(userId, completedSet, now);
      if (DEBUG_SELECTION) {
        console.log(`📈 Persisted exposure updates for ${completedSet.length} selected questions`);
      }
    }

    // Populate stats and adaptive counters
    stats.selectedQuestions = completedSet.length;

    const topicMap = completedSet.reduce((map, question) => {
      map[question.topic] = (map[question.topic] || 0) + 1;
      return map;
    }, {});

    // Count adaptive influences and repeats
    const last10Set = new Set([...recentIncorrectSet, ...recentCorrectSet]);
    const uniqueTopicSet = new Set();
    const coverageGap = {
      lowCoverageSelections: 0,
      partialCoverageSelections: 0,
      averageCoverageCount: 0,
      selectedSubtopicsWithLowCoverage: new Set(),
      selectedSubtopicsWithPartialCoverage: new Set(),
    };

    for (const q of completedSet) {
      const dbg = q._debug || {};
      if (dbg.weakSkill) adaptiveInfluence.selectedBecauseWeakSkill += 1;
      if (dbg.lowMemory) adaptiveInfluence.selectedBecauseMemory += 1;
      if (dbg.recentIncorrect) adaptiveInfluence.selectedBecauseRecentMistakes += 1;
      if (dbg.dueReview) adaptiveInfluence.selectedBecauseDueReview += 1;
      if (q.selectionSource === "exploration") adaptiveInfluence.selectedBecauseExploration += 1;

      if (lastSessionSet.has(q.questionId)) repeatDetection.repeatedFromLastSession += 1;
      if (last10Set.has(q.questionId)) repeatDetection.repeatedFromLast10Attempts += 1;
      uniqueTopicSet.add(q.topic);

      if (q.coverageCount < 3) {
        coverageGap.lowCoverageSelections += 1;
        coverageGap.selectedSubtopicsWithLowCoverage.add(`${q.topic}||${q.subtopic}`);
      } else if (q.coverageCount < 5) {
        coverageGap.partialCoverageSelections += 1;
        coverageGap.selectedSubtopicsWithPartialCoverage.add(`${q.topic}||${q.subtopic}`);
      }
      coverageGap.averageCoverageCount += q.coverageCount || 0;
    }
    repeatDetection.uniqueTopics = uniqueTopicSet.size;
    coverageGap.averageCoverageCount =
      completedSet.length > 0 ? coverageGap.averageCoverageCount / completedSet.length : 0;

    // Difficulty verification
    const difficultyCounts = countByDifficulty(completedSet);
    const difficultyWarning =
      difficultyCounts.easy !== difficultyTargets.easy ||
      difficultyCounts.medium !== difficultyTargets.medium ||
      difficultyCounts.hard !== difficultyTargets.hard;

    const exposureCounts = completedSet.map((q) => q.exposureCount || 0);
    const averageExposureCount = exposureCounts.length
      ? exposureCounts.reduce((sum, value) => sum + value, 0) / exposureCounts.length
      : 0;
    const highestExposureQuestion = completedSet.reduce(
      (best, q) => (q.exposureCount > (best.exposureCount || 0) ? q : best),
      { exposureCount: -1 }
    );
    const exposurePenaltyDistribution = completedSet.reduce((distribution, q) => {
      const penalty = q.exposurePenalty || 0;
      const bucket =
        penalty === 0
          ? "0"
          : penalty <= 10
          ? "1-10"
          : penalty <= 20
          ? "11-20"
          : penalty <= 30
          ? "21-30"
          : "31-40";
      distribution[bucket] = (distribution[bucket] || 0) + 1;
      return distribution;
    }, {});

    const topReasonCounts = completedSet.reduce((counts, q) => {
      const reasons = q.scoreReasons || [];
      for (const reason of reasons) {
        counts[reason] = (counts[reason] || 0) + 1;
      }
      return counts;
    }, {});

    const topReasons = Object.entries(topReasonCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([reason, count]) => ({ reason, count }));

    // Build the selection report
    lastSelectionReport = {
      stats,
      adaptiveInfluence,
      repeatDetection,
      difficultyCounts,
      difficultyWarning,
      coveragePercent: Math.round(coveragePercent * 100) / 100,
      selectedQuestionIds: completedSet.map((q) => q.questionId),
      explorationQuestions: completedSet.filter((q) => q.selectionSource === "exploration").map((q) => q.questionId),
      exploitationQuestions: completedSet.filter((q) => q.selectionSource === "exploitation").map((q) => q.questionId),
      topReasons,
      exposureStats: {
        averageExposureCount,
        highestExposureQuestionId: highestExposureQuestion.questionId || null,
        highestExposureCount: highestExposureQuestion.exposureCount || 0,
        exposurePenaltyDistribution,
      },
      coverageGap: {
        lowCoverageSelections: coverageGap.lowCoverageSelections,
        partialCoverageSelections: coverageGap.partialCoverageSelections,
        averageCoverageCount: coverageGap.averageCoverageCount,
        selectedSubtopicsWithLowCoverage: [...coverageGap.selectedSubtopicsWithLowCoverage],
        selectedSubtopicsWithPartialCoverage: [...coverageGap.selectedSubtopicsWithPartialCoverage],
      },
    };

    if (DEBUG_SELECTION) {
      console.log("\n=== Selection Report ===");
      console.log(JSON.stringify(lastSelectionReport, null, 2));
      console.log("\nSelected Questions (detailed):");
      completedSet.forEach((q) => {
        console.log(
          JSON.stringify(
            {
              questionId: q.questionId,
              score: q.score,
              reasons: q.scoreReasons,
              topic: q.topic,
              subtopic: q.subtopic,
              exposureCount: q.exposureCount,
              exposurePenalty: q.exposurePenalty,
              selectionSource: q.selectionSource || "exploitation",
            },
            null,
            2
          )
        );
      });
      console.log("Exposure summary:", {
        averageExposureCount: lastSelectionReport.exposureStats.averageExposureCount,
        highestExposureQuestionId: lastSelectionReport.exposureStats.highestExposureQuestionId,
        highestExposureCount: lastSelectionReport.exposureStats.highestExposureCount,
        exposurePenaltyDistribution: lastSelectionReport.exposureStats.exposurePenaltyDistribution,
      });
      if (difficultyWarning) {
        console.warn(`Difficulty distribution does not match targets:`, difficultyCounts);
      }
    }

    return completedSet.slice(0, count).map((question) => ({
      questionId: question.questionId,
      _id: question._id,
      questionText: question.questionText,
      topic: question.topic,
      subtopic: question.subtopic,
      difficulty: question.difficulty,
      exposureCount: question.exposureCount,
      exposurePenalty: question.exposurePenalty,
      // include debug details when enabled
      ...(DEBUG_SELECTION
        ? {
            score: question.score,
            reasons: question.scoreReasons,
            selectionSource: question.selectionSource || "exploitation",
          }
        : {}),
    }));
  } catch (error) {
    console.error("❌ Error in getSessionQuestions v5:", error.message);
    const fallback = shuffleArray(mockQuestions.map(buildQuestionFromSource)).slice(0, count);
    return fallback.map((question) => ({
      questionId: question.questionId,
      _id: question._id,
      questionText: question.questionText,
      topic: question.topic,
      subtopic: question.subtopic,
      difficulty: question.difficulty,
    }));
  }
};

export const getLastSelectionReport = () => lastSelectionReport;

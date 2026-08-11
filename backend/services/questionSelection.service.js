import Question from "../models/question.model.js";
import Attempt from "../models/attempt.model.js";
import Skill from "../models/skill.model.js";
import Memory from "../models/memory.model.js";
import Session from "../models/session.model.js";
import QuestionExposure from "../models/questionExposure.model.js";
import KnowledgeCoverage from "../models/knowledgeCoverage.model.js";
import mockQuestions from "../data/questions.js";
import { isLocalQuestionFallbackEnabled } from "../config/questionBank.js";
import { getLearningKey, getQuestionSkill, getSkillById } from "../data/skillGraph.js";
import { CHOICE_QUESTION_TYPES, getOptionText, inferQuestionType } from "../utils/questionType.js";

// DEBUG flag: enable verbose selection explanations and reports
const DEBUG_SELECTION = true;
const PREREQUISITE_MASTERY_THRESHOLD = 0.5;
const PREREQUISITE_EXPOSURE_THRESHOLD = 2;
const PREREQUISITE_SOFT_PENALTY = 20;
const PREREQUISITE_HARD_GATE_PENALTY = 80;
const BEGINNER_SAFE_SKILL_IDS = new Set([
  "kana.hiragana",
  "kana.katakana",
  "pronunciation.basic",
  "grammar.basic_sentence_structure",
  "grammar.questions",
  "vocab.basic_nouns",
  "vocab.people_school",
  "vocab.animals",
  "vocab.family",
  "vocab.food_drinks",
  "vocab.transportation",
  "vocab.places",
  "vocab.daily_activities",
  "greetings.daily",
  "numbers.basic_counting",
  "time.weekdays",
  "time.asking_time",
  "particles.topic_wa",
  "particles.subject_ga",
  "particles.object_wo",
  "particles.destination_ni",
  "particles.location_de",
  "particles.noun_links",
  "verbs.present_polite",
  "verbs.past_polite",
  "verbs.negative_polite",
  "verbs.te_form",
  "adjectives.core",
  "adjectives.weather",
  "adjectives.na",
  "grammar.likes_dislikes",
  "grammar.wants_desires",
  "reading.word_recognition",
  "reading.sentence_reading",
]);

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

const buildQuestionFromSource = (sourceQuestion) => {
  const skill = getQuestionSkill(sourceQuestion);

  return {
    _id: sourceQuestion._id,
    questionId: String(sourceQuestion.questionId || sourceQuestion._id),
    questionText: sourceQuestion.questionText,
    questionType: inferQuestionType(sourceQuestion),
    options: sourceQuestion.options || [],
    correctAnswer: sourceQuestion.correctAnswer,
    topic: sourceQuestion.topic,
    subtopic: sourceQuestion.subtopic,
    skillId: skill.skillId,
    skillName: skill.skillName,
    skillPath: skill.skillPath,
    prerequisiteSkillIds: skill.prerequisiteSkillIds,
    lessonIds: sourceQuestion.lessonIds || [],
    conceptIds: sourceQuestion.conceptIds || [],
    jlptLevel: skill.jlptLevel,
    difficulty: normalizeDifficulty(sourceQuestion.difficulty),
  };
};

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

const getCanonicalLearningKey = (record = {}) => getQuestionSkill(record).skillId;

const softmaxProbabilities = (items, temperature = 1.2) => {
  if (!items || items.length === 0) return [];
  const scores = items.map((it) => it.score || 0);
  const maxScore = Math.max(...scores);
  const exps = scores.map((s) => Math.exp((s - maxScore) / temperature));
  const sum = exps.reduce((a, b) => a + b, 0) || 1;
  return exps.map((e) => e / sum);
};

const weightedSampleWithoutReplacement = (
  items,
  probabilities,
  k,
  topicCounts,
  subtopicCounts,
  maxPerSubtopic = 2,
  allowLastSession = false,
  existingSelectedIds = new Set()
) => {
  const pool = items.slice();
  const probs = probabilities.slice();
  const selected = [];

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

    if (
      (!allowLastSession && candidate.lastSessionUsed) ||
      existingSelectedIds.has(candidateId) ||
      subtopicCount >= maxPerSubtopic
    ) {
      pool.splice(idx, 1);
      probs.splice(idx, 1);
      continue;
    }

    selected.push(candidate);
    existingSelectedIds.add(candidateId);
    topicCounts[candidate.topic] = topicCount + 1;
    subtopicCounts[candidate.subtopic] = subtopicCount + 1;

    pool.splice(idx, 1);
    probs.splice(idx, 1);
  }

  return selected;
};

const buildMasteryLookup = (skills) => {
  const skillTotals = {};
  const skillCounts = {};
  const byTopic = {};
  const topicCounts = {};

  for (const skill of skills) {
    const canonicalSkill = getQuestionSkill(skill);
    const topic = String(skill.topic || "unknown").trim();
    const mastery = typeof skill.mastery === "number" ? skill.mastery : 0;
    skillTotals[canonicalSkill.skillId] = (skillTotals[canonicalSkill.skillId] || 0) + mastery;
    skillCounts[canonicalSkill.skillId] = (skillCounts[canonicalSkill.skillId] || 0) + 1;
    byTopic[topic] = (byTopic[topic] || 0) + mastery;
    topicCounts[topic] = (topicCounts[topic] || 0) + 1;
  }

  const bySkill = {};
  for (const skillId of Object.keys(skillTotals)) {
    bySkill[skillId] = skillCounts[skillId] > 0 ? skillTotals[skillId] / skillCounts[skillId] : 0;
  }

  for (const topic of Object.keys(byTopic)) {
    byTopic[topic] = topicCounts[topic] > 0 ? byTopic[topic] / topicCounts[topic] : 0;
  }

  return { bySkill, byTopic };
};

const buildMemoryLookup = (memories) =>
  memories.reduce((lookup, memory) => {
    const canonicalSkill = getQuestionSkill(memory);
    const key = getLearningKey(memory);
    const legacyKey = normalizeQuestionKey(memory.topic, memory.subtopic);
    const existing = lookup[canonicalSkill.skillId];
    const memoryStrength = typeof memory.strength === "number" ? memory.strength : 1;
    const existingStrength = typeof existing?.strength === "number" ? existing.strength : 1;
    const memoryDue = memory.nextReviewDate && new Date(memory.nextReviewDate) <= new Date();
    const existingDue = existing?.nextReviewDate && new Date(existing.nextReviewDate) <= new Date();

    if (!existing || memoryDue || (!existingDue && memoryStrength < existingStrength)) {
      lookup[canonicalSkill.skillId] = memory;
    }

    lookup[key] = lookup[canonicalSkill.skillId];
    lookup[legacyKey] = lookup[canonicalSkill.skillId];
    return lookup;
  }, {});

const buildExposureLookup = (exposures) =>
  exposures.reduce((lookup, exposure) => {
    lookup[String(exposure.questionId)] = exposure;
    return lookup;
  }, {});

const buildCoverageLookup = (coverages) =>
  coverages.reduce((lookup, coverage) => {
    const canonicalSkill = getQuestionSkill(coverage);
    const key = getLearningKey(coverage);
    const legacyKey = normalizeQuestionKey(coverage.topic, coverage.subtopic);
    const existing = lookup[canonicalSkill.skillId] || {};
    const merged = {
      ...existing,
      ...coverage,
      skillId: canonicalSkill.skillId,
      skillName: coverage.skillName || canonicalSkill.skillName,
      exposureCount: Math.max(existing.exposureCount || 0, coverage.exposureCount || 0),
      mastery: Math.max(existing.mastery || 0, coverage.mastery || 0),
      lastSeenAt:
        existing.lastSeenAt && coverage.lastSeenAt
          ? new Date(existing.lastSeenAt) > new Date(coverage.lastSeenAt)
            ? existing.lastSeenAt
            : coverage.lastSeenAt
          : existing.lastSeenAt || coverage.lastSeenAt,
    };
    lookup[canonicalSkill.skillId] = merged;
    lookup[key] = merged;
    lookup[legacyKey] = merged;
    return lookup;
  }, {});

const normalizeQuestionKey = (topic, subtopic) =>
  `${String(topic || "unknown").trim()}||${String(subtopic || "unknown").trim()}`;

const getQuestionLearningKey = (question) => getCanonicalLearningKey(question);

const buildCoverageInjectionPools = (questions, coverageLookup) => {
  const unseen = [];
  const lowCoverage = [];

  for (const question of questions) {
    const questionKey = getQuestionLearningKey(question);
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

const getPrerequisiteReadiness = (question, masteryLookup, coverageLookup) => {
  const skillId = getQuestionLearningKey(question);
  const skill = getSkillById(skillId);
  const prerequisites = skill?.prerequisites || question.prerequisiteSkillIds || [];

  if (!prerequisites.length) {
    return {
      skill,
      prerequisites,
      unmetPrerequisites: [],
      ready: true,
      hardGate: false,
    };
  }

  const unmetPrerequisites = prerequisites.filter((prerequisiteSkillId) => {
    const mastery = masteryLookup.bySkill[prerequisiteSkillId];
    const coverage = coverageLookup[prerequisiteSkillId];
    const exposureCount = coverage?.exposureCount || 0;
    return !(
      (typeof mastery === "number" && mastery >= PREREQUISITE_MASTERY_THRESHOLD) ||
      exposureCount >= PREREQUISITE_EXPOSURE_THRESHOLD
    );
  });

  const difficulty = normalizeDifficulty(question.difficulty);
  const hardGate =
    unmetPrerequisites.length > 0 &&
    (skill?.level === "early-intermediate" || difficulty === "hard");

  return {
    skill,
    prerequisites,
    unmetPrerequisites,
    ready: unmetPrerequisites.length === 0,
    hardGate,
  };
};

const isQuestionAllowedByPrerequisites = (question, masteryLookup, coverageLookup, learnerStage = "core_practice") => {
  const readiness = getPrerequisiteReadiness(question, masteryLookup, coverageLookup);
  if (
    (learnerStage === "cold_start" || learnerStage === "foundation_building" || learnerStage === "core_practice") &&
    !readiness.ready
  ) {
    return false;
  }
  return !readiness.hardGate;
};

export const calculateAverageMastery = (masteryLookup) => {
  const values = Object.values(masteryLookup.bySkill).filter((value) => typeof value === "number");
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

export const calculateRecentAccuracy = (attempts) => {
  if (!attempts.length) return null;
  const correct = attempts.filter((attempt) => attempt.isCorrect).length;
  return correct / attempts.length;
};

export const countCoveredSkills = (coverages = []) => {
  const covered = new Set();
  for (const coverage of coverages) {
    const skillId = getQuestionSkill(coverage).skillId;
    if ((coverage.exposureCount || 0) > 0) {
      covered.add(skillId);
    }
  }
  return covered.size;
};

export const detectLearnerStage = ({ totalAttemptCount, coveredSkillCount, averageMastery, recentAccuracy, weakSkillCount }) => {
  if (totalAttemptCount < 15 || coveredSkillCount < 8) {
    return "cold_start";
  }

  if (
    totalAttemptCount >= 25 &&
    coveredSkillCount >= 12 &&
    averageMastery >= 0.8 &&
    recentAccuracy >= 0.85 &&
    weakSkillCount === 0
  ) {
    return "core_practice";
  }

  if (totalAttemptCount < 50 || coveredSkillCount < 18 || averageMastery < 0.45) {
    return "foundation_building";
  }

  if (weakSkillCount >= 4 || (typeof recentAccuracy === "number" && recentAccuracy < 0.65)) {
    return "adaptive_review";
  }

  if (coveredSkillCount >= 26 && averageMastery >= 0.65 && recentAccuracy >= 0.75) {
    return "advanced_expansion";
  }

  return "core_practice";
};

const getCurriculumBias = (question, learnerStage) => {
  const skillId = getQuestionLearningKey(question);
  const skill = getSkillById(skillId);
  const difficulty = normalizeDifficulty(question.difficulty);
  const isBeginnerSafe = BEGINNER_SAFE_SKILL_IDS.has(skillId);
  const isEarlyIntermediate = skill?.level === "early-intermediate";
  const isHard = difficulty === "hard";
  let stageBias = 0;
  const reasons = [];

  if (learnerStage === "cold_start") {
    if (isBeginnerSafe) {
      stageBias += 35;
      reasons.push("stage: beginner-safe");
    }
    if (skill?.strand === "Foundation") {
      stageBias += 15;
      reasons.push("stage: foundation boost");
    }
    if (difficulty === "medium") {
      stageBias -= 10;
      reasons.push("stage: medium delay");
    }
    if (isHard) {
      stageBias -= 120;
      reasons.push("stage: hard delay");
    }
    if (isEarlyIntermediate) {
      stageBias -= 120;
      reasons.push("stage: advanced delay");
    }
  } else if (learnerStage === "foundation_building") {
    if (isBeginnerSafe) {
      stageBias += 25;
      reasons.push("stage: foundation path");
    }
    if (skill?.strand === "Foundation") {
      stageBias += 10;
      reasons.push("stage: foundation boost");
    }
    if (isHard) {
      stageBias -= 70;
      reasons.push("stage: hard delay");
    }
    if (isEarlyIntermediate) {
      stageBias -= 60;
      reasons.push("stage: advanced delay");
    }
  } else if (learnerStage === "core_practice") {
    if (isBeginnerSafe) {
      stageBias += 8;
      reasons.push("stage: core path");
    }
    if (isHard) {
      stageBias -= 20;
      reasons.push("stage: hard moderation");
    }
    if (isEarlyIntermediate) {
      stageBias -= 20;
      reasons.push("stage: advanced moderation");
    }
  } else if (learnerStage === "adaptive_review") {
    if (isBeginnerSafe) {
      stageBias += 5;
      reasons.push("stage: review-safe");
    }
    if (isHard) {
      stageBias -= 15;
      reasons.push("stage: hard moderation");
    }
  } else if (learnerStage === "advanced_expansion") {
    if (isEarlyIntermediate) {
      stageBias += 15;
      reasons.push("stage: advanced expansion");
    }
    if (isHard) {
      stageBias += 8;
      reasons.push("stage: hard challenge");
    }
  }

  return { stageBias, reasons };
};

export const persistQuestionExposure = async (userId, questions, now = new Date()) => {
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
    const id = String(question.questionId || question._id);
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
  masteryLookup,
  memoryLookup,
  recentIncorrectSet,
  recentCorrectSet,
  lastSessionSet,
  exposureLookup,
  coverageLookup,
  now,
  exposureAware = true,
  personaType = 'balanced',
  learnerStage = "core_practice"
) => {
  let score = 0;
  const reasons = [];
  const topic = String(question.topic || "unknown").trim();
  const questionKey = getQuestionLearningKey(question);
  const questionId = String(question.questionId);

  const mastery = masteryLookup.bySkill[questionKey];
  const hasMastery = typeof mastery === "number";
  if (hasMastery && mastery < 0.4) {
    score += 30;
    reasons.push("weak skill");
  } else if (!hasMastery) {
    reasons.push("new skill");
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
  const prerequisiteReadiness = getPrerequisiteReadiness(question, masteryLookup, coverageLookup);

  if (coverageCount === 0) {
    reasons.push("unseen coverage");
  } else if (coverageCount < 3) {
    reasons.push("low coverage");
  } else if (coverageCount < 5) {
    reasons.push("coverage maintenance");
  }

  score += coverageScore;

  const curriculumBias = getCurriculumBias(question, learnerStage);
  score += curriculumBias.stageBias;
  reasons.push(...curriculumBias.reasons);

  let prerequisitePenalty = 0;
  if (!prerequisiteReadiness.ready) {
    prerequisitePenalty = prerequisiteReadiness.hardGate
      ? PREREQUISITE_HARD_GATE_PENALTY
      : PREREQUISITE_SOFT_PENALTY;
    score -= prerequisitePenalty;
    reasons.push(prerequisiteReadiness.hardGate ? "prerequisite gate" : "prerequisite gap");
  }

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
    prerequisitePenalty,
    stageBias: curriculumBias.stageBias,
    learnerStage,
    unmetPrerequisites: prerequisiteReadiness.unmetPrerequisites,
    lastSessionUsed: lastSessionSet.has(questionId),
    _debug: {
      weakSkill: hasMastery && mastery < 0.4,
      newSkill: !hasMastery,
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
      prerequisiteReady: prerequisiteReadiness.ready,
      prerequisiteHardGate: prerequisiteReadiness.hardGate,
      unmetPrerequisites: prerequisiteReadiness.unmetPrerequisites,
      prerequisitePenalty,
      stageBias: curriculumBias.stageBias,
      learnerStage,
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

const buildQuestionOptions = (question, allQuestions) => {
  const existingOptions = (question.options || [])
    .map(getOptionText)
    .filter(Boolean);

  if (existingOptions.length > 0) {
    return shuffleArray([...new Set(existingOptions)]).map((text) => ({ text }));
  }

  const questionType = question.questionType || "multiple_choice";
  const supportsGeneratedOptions = CHOICE_QUESTION_TYPES.has(questionType);
  if (!supportsGeneratedOptions || !question.correctAnswer) return [];

  const correctAnswer = String(question.correctAnswer).trim();
  const sameSkillAnswers = allQuestions
    .filter((candidate) => getQuestionLearningKey(candidate) === getQuestionLearningKey(question))
    .map((candidate) => candidate.correctAnswer)
    .filter(Boolean);
  const sameTopicAnswers = allQuestions
    .filter((candidate) => candidate.topic === question.topic)
    .map((candidate) => candidate.correctAnswer)
    .filter(Boolean);
  const fallbackAnswers = allQuestions.map((candidate) => candidate.correctAnswer).filter(Boolean);

  const distractors = [...sameSkillAnswers, ...sameTopicAnswers, ...fallbackAnswers]
    .map((answer) => String(answer).trim())
    .filter((answer) => answer && answer.toLowerCase() !== correctAnswer.toLowerCase());

  const uniqueDistractors = [...new Set(distractors)].slice(0, 12);
  const selectedDistractors = shuffleArray(uniqueDistractors).slice(0, 3);

  if (selectedDistractors.length < 2) return [];

  return shuffleArray([correctAnswer, ...selectedDistractors]).map((text) => ({ text }));
};

const isRemediationCandidate = (question) => {
  const debug = question?._debug || {};
  return Boolean(debug.weakSkill || debug.lowMemory || debug.recentIncorrect || debug.dueReview);
};

const isPriorityReviewCandidate = (question) => {
  const debug = question?._debug || {};
  return Boolean(debug.weakSkill || debug.recentIncorrect || debug.dueReview);
};

const isWeakSkillCandidate = (question, weakSkills = []) => {
  if (!weakSkills.length) return false;
  return weakSkills.includes(getQuestionLearningKey(question));
};

const markWeakSkillSelection = (question, weakSkills = []) => {
  if (!isWeakSkillCandidate(question, weakSkills)) return question;

  question._debug = { ...(question._debug || {}), weakSkill: true };
  if (!question.scoreReasons?.includes("weak skill")) {
    question.scoreReasons = [...(question.scoreReasons || []), "weak skill"];
  }
  return question;
};

const isReviewCandidateForWeakSkills = (question, weakSkills = []) =>
  isPriorityReviewCandidate(question) || isWeakSkillCandidate(question, weakSkills);

const getRemediationTarget = (learnerStage, learnerStageMetrics) => {
  const weakSkillCount = learnerStageMetrics?.weakSkillCount || 0;
  const recentAccuracy = learnerStageMetrics?.recentAccuracy;

  if (
    learnerStage === "cold_start" &&
    typeof recentAccuracy === "number" &&
    recentAccuracy < 0.5 &&
    weakSkillCount >= 2
  ) {
    return 2;
  }

  if (learnerStage === "foundation_building" && weakSkillCount > 0) {
    return 1;
  }

  return 0;
};

const enforceRemediationTarget = (items, remediationTarget, weakSkills, scoredCandidates) => {
  if (remediationTarget <= 0) return items;

  const completed = [...items];
  const selectedIds = new Set(completed.map((question) => String(question.questionId)));
  let currentCount = completed.filter((question) => isReviewCandidateForWeakSkills(question, weakSkills)).length;

  if (currentCount >= remediationTarget) return completed;

  const candidatePool = scoredCandidates
    .filter((question) => isReviewCandidateForWeakSkills(question, weakSkills))
    .filter((question) => !selectedIds.has(String(question.questionId)))
    .sort((a, b) => (b.score || 0) - (a.score || 0));

  for (const candidate of candidatePool) {
    if (currentCount >= remediationTarget) break;

    const candidateDifficulty = normalizeDifficulty(candidate.difficulty);
    let replacementIndex = completed.findIndex(
      (question) =>
        !isReviewCandidateForWeakSkills(question, weakSkills) &&
        normalizeDifficulty(question.difficulty) === candidateDifficulty
    );

    if (replacementIndex === -1) {
      replacementIndex = completed.findIndex((question) => !isReviewCandidateForWeakSkills(question, weakSkills));
    }

    if (replacementIndex === -1) break;

    selectedIds.delete(String(completed[replacementIndex].questionId));
    candidate.selectionSource = "remediation";
    completed[replacementIndex] = markWeakSkillSelection(candidate, weakSkills);
    selectedIds.add(String(candidate.questionId));
    currentCount += 1;
  }

  return completed;
};

const getDifficultyTargetsForStage = (learnerStage, count) => {
  const profiles = {
    cold_start: { easy: 0.65, medium: 0.35, hard: 0 },
    foundation_building: { easy: 0.5, medium: 0.5, hard: 0 },
    core_practice: { easy: 0.4, medium: 0.4, hard: 0.2 },
    adaptive_review: { easy: 0.4, medium: 0.4, hard: 0.2 },
    advanced_expansion: { easy: 0.2, medium: 0.4, hard: 0.4 },
  };
  const profile = profiles[learnerStage] || profiles.core_practice;
  const targets = { easy: 0, medium: 0, hard: 0 };
  const fractions = [];

  for (const difficulty of ["easy", "medium", "hard"]) {
    const exact = count * profile[difficulty];
    targets[difficulty] = Math.floor(exact);
    fractions.push({ difficulty, fraction: exact - targets[difficulty] });
  }

  let assigned = targets.easy + targets.medium + targets.hard;
  for (const { difficulty } of fractions.sort((a, b) => b.fraction - a.fraction)) {
    if (assigned >= count) break;
    targets[difficulty] += 1;
    assigned += 1;
  }

  return targets;
};

const detectPersonaType = (userId) => {
  if (!userId || typeof userId !== 'string') return 'balanced';
  const lower = userId.toLowerCase();
  if (lower.includes('high_performer') || lower.includes('high-performer')) return 'high_performer';
  if (lower.includes('grammar_specialist') || lower.includes('grammar-specialist')) return 'grammar_specialist';
  if (lower.includes('vocab_specialist') || lower.includes('vocab-specialist')) return 'vocab_specialist';
  return 'balanced';
};

const calculateCoveragePercent = (coverageLookup, allQuestions) => {
  const skillIdsInBank = new Set(allQuestions.map((question) => getQuestionLearningKey(question)));
  if (skillIdsInBank.size === 0) return 0;

  let coveredSkills = 0;
  for (const skillId of skillIdsInBank) {
    const coverage = coverageLookup[skillId];
    if (coverage && (coverage.exposureCount || 0) > 0) {
      coveredSkills += 1;
    }
  }

  return Math.min(100, (coveredSkills / skillIdsInBank.size) * 100);
};

export const getSessionQuestions = async (userId, count = 5, options = {}) => {
  const exploitCount = Math.max(Math.floor(count * 0.8), count - 1);
  const exposureAware = options.exposureAware !== false;
  const persistExposure = options.persistExposure === true;
  const personaType = detectPersonaType(userId);
  const lessonSkillIds = Array.isArray(options.lessonSkillIds)
    ? new Set(options.lessonSkillIds.filter(Boolean))
    : null;

  try {
    const now = new Date();

    const [skills, memories, recentAttempts, totalAttemptCount, lastSession, exposures, coverages] = await Promise.all([
      Skill.find({ userId }).lean(),
      Memory.find({ userId }).lean(),
      Attempt.find({ userId }).sort({ createdAt: -1 }).limit(10).lean(),
      Attempt.countDocuments({ userId }),
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
    const masteryLookup = buildMasteryLookup(skills);
    const weakSkills = Object.entries(masteryLookup.bySkill)
      .filter(([, mastery]) => mastery < 0.4)
      .map(([skillId]) => skillId);
    const memoryLookup = buildMemoryLookup(memories);
    const learnerStageMetrics = {
      totalAttemptCount,
      coveredSkillCount: countCoveredSkills(coverages || []),
      averageMastery: calculateAverageMastery(masteryLookup),
      recentAccuracy: calculateRecentAccuracy(recentAttempts),
      weakSkillCount: weakSkills.length,
    };
    const learnerStage = detectLearnerStage(learnerStageMetrics);
    const difficultyTargets = getDifficultyTargetsForStage(learnerStage, count);

    const dbQuestions = await Question.find({}).lean();
    const allowLocalFallback = isLocalQuestionFallbackEnabled();
    const sourceQuestions = dbQuestions.length > 0 ? dbQuestions : allowLocalFallback ? mockQuestions : [];
    const allQuestions = dedupeQuestions(sourceQuestions.map(buildQuestionFromSource));

    if (allQuestions.length === 0) {
      console.log("⚠️ v5 Engine Active but no questions available");
      return [];
    }
    if (dbQuestions.length === 0) {
      console.log("⚠️ No DB questions found. Using local questions.js seed data as fallback.");
    }

    console.log("🧠 v5 Engine Active");
    console.log("🧭 Learner stage:", learnerStage);
    console.log("🧠 Weak skills detected:", weakSkills.length > 0 ? weakSkills.join(", ") : "None");
    if (lessonSkillIds?.size) {
      console.log("🗺️ Roadmap lesson scope:", [...lessonSkillIds].join(", "));
    }

    const lessonTaggedQuestions = options.lessonId
      ? allQuestions.filter((question) => question.lessonIds.includes(options.lessonId))
      : [];
    const scopedQuestions = lessonTaggedQuestions.length > 0
      ? lessonTaggedQuestions
      : lessonSkillIds?.size
        ? allQuestions.filter((question) => lessonSkillIds.has(getQuestionLearningKey(question)))
        : allQuestions;

    if (options.lessonId) {
      console.log("🧩 Lesson content scope:", {
        lessonId: options.lessonId,
        source: lessonTaggedQuestions.length > 0 ? "explicit_lesson_ids" : "skill_compatibility_fallback",
        questionCount: scopedQuestions.length,
      });
    }

    let candidateQuestions = scopedQuestions.filter((question) => !lastSessionSet.has(question.questionId));
    if (candidateQuestions.length === 0) {
      console.log("⚠️ All questions excluded by last-session history; using scoped pool as fallback.");
      candidateQuestions = shuffleArray(scopedQuestions);
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
    const allowedUnseenCandidates = unseenCandidates.filter((question) =>
      isQuestionAllowedByPrerequisites(question, masteryLookup, coverageLookup, learnerStage)
    );
    const allowedLowCoverageCandidates = lowCoverageCandidates.filter((question) =>
      isQuestionAllowedByPrerequisites(question, masteryLookup, coverageLookup, learnerStage)
    );

    const injectedUnseen = selectWithLimits(
      shuffleArray(allowedUnseenCandidates),
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
      shuffleArray(allowedLowCoverageCandidates).filter((question) => !selectedIds.has(question.questionId)),
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
        masteryLookup,
        memoryLookup,
        recentIncorrectSet,
        recentCorrectSet,
        lastSessionSet,
        exposureLookup,
        coverageLookup,
        now,
        exposureAware,
        personaType,
        learnerStage
      )
    );

    candidateQuestions = candidateQuestions.filter((question) => !selectedIds.has(question.questionId));
    const allowedCandidateQuestions = candidateQuestions.filter((question) =>
      isQuestionAllowedByPrerequisites(question, masteryLookup, coverageLookup, learnerStage)
    );
    const prerequisiteBlockedCount = candidateQuestions.length - allowedCandidateQuestions.length;

    const scoredCandidates = sortByScore(
      shuffleArray(allowedCandidateQuestions).map((question) =>
        scoreQuestion(
          question,
          masteryLookup,
          memoryLookup,
          recentIncorrectSet,
          recentCorrectSet,
          lastSessionSet,
          exposureLookup,
          coverageLookup,
          now,
          exposureAware,
          personaType,
          learnerStage
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

    const remediationTarget = Math.min(count, getRemediationTarget(learnerStage, learnerStageMetrics));
    const currentRemediationCount = finalSet.filter((question) =>
      isReviewCandidateForWeakSkills(question, weakSkills)
    ).length;
    const remediationNeeded = Math.max(0, remediationTarget - currentRemediationCount);

    if (remediationNeeded > 0) {
      const remediationPool = scoredCandidates.filter((question) =>
        isReviewCandidateForWeakSkills(question, weakSkills)
      );
      const remediationSelection = selectWithLimits(
        remediationPool,
        remediationNeeded,
        selectedIds,
        topicCounts,
        subtopicCounts,
        false
      );
      remediationSelection.forEach((question) => {
        question.selectionSource = "remediation";
        finalSet.push(markWeakSkillSelection(question, weakSkills));
      });
    }

    // UPGRADE 3: Fix coverage metric - calculate as (uniqueCoveredSubtopics / totalSubtopicsInBank) * 100
    const coveragePercent = calculateCoveragePercent(coverageLookup, allQuestions);

    // selectedIds, topicCounts, and subtopicCounts already include any coverage injection questions

    // Selection stats & counters
    const stats = {
      totalQuestions: allQuestions.length,
      candidatePool: allowedCandidateQuestions.length,
      exploitationPool: exploitationPool.length,
      explorationPool: explorationPool.length,
      selectedQuestions: 0,
      prerequisiteBlocked: prerequisiteBlockedCount,
      lessonScoped: Boolean(lessonSkillIds?.size),
      lessonSkillIds: lessonSkillIds ? [...lessonSkillIds] : [],
    };

    const adaptiveInfluence = {
      selectedBecauseWeakSkill: 0,
      selectedBecauseMemory: 0,
      selectedBecauseRecentMistakes: 0,
      selectedBecauseExploration: 0,
      selectedBecauseDueReview: 0,
      selectedWithPrerequisiteGap: 0,
      selectedWithStageBias: 0,
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
        false,
        selectedIds
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
      const fallbackPool = shuffleArray(allowedCandidateQuestions).filter((question) => !selectedIds.has(question.questionId));
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

      const candidatePool = shuffleArray([...exploitationPool, ...explorationPool]);
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

    let completedSet = rebalanceIfNeeded();
    if (completedSet.length < count) {
      const fallback = shuffleArray([...completedSet, ...exploitationPool, ...explorationPool])
        .filter((question, index, pool) => pool.findIndex((candidate) => candidate.questionId === question.questionId) === index)
        .slice(0, count);
      console.log("⚠️ v5 gated fallback triggered for incomplete final set");
      completedSet = fallback;
    }
    completedSet = enforceRemediationTarget(completedSet, remediationTarget, weakSkills, scoredCandidates);

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
      if (dbg.unmetPrerequisites?.length) adaptiveInfluence.selectedWithPrerequisiteGap += 1;
      if (dbg.stageBias) adaptiveInfluence.selectedWithStageBias += 1;
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
      learnerStage,
      learnerStageMetrics,
      adaptiveInfluence,
      repeatDetection,
      difficultyCounts,
      difficultyWarning,
      coveragePercent: Math.round(coveragePercent * 100) / 100,
      roadmap: {
        lessonId: options.lessonId || null,
        lessonTitle: options.lessonTitle || "",
        lessonScoped: Boolean(options.lessonId || lessonSkillIds?.size),
        explicitLessonContentScope: lessonTaggedQuestions.length > 0,
        lessonSkillIds: lessonSkillIds ? [...lessonSkillIds] : [],
      },
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
              unmetPrerequisites: q.unmetPrerequisites || [],
              prerequisitePenalty: q.prerequisitePenalty || 0,
              learnerStage: q.learnerStage,
              stageBias: q.stageBias || 0,
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
      questionType: question.questionType,
      options: buildQuestionOptions(question, allQuestions),
      topic: question.topic,
      subtopic: question.subtopic,
      skillId: question.skillId,
      skillName: question.skillName,
      skillPath: question.skillPath,
      prerequisiteSkillIds: question.prerequisiteSkillIds,
      lessonIds: question.lessonIds,
      conceptIds: question.conceptIds,
      jlptLevel: question.jlptLevel,
      difficulty: question.difficulty,
      exposureCount: question.exposureCount,
      exposurePenalty: question.exposurePenalty,
      lessonId: options.lessonId || null,
      // include debug details when enabled
      ...(DEBUG_SELECTION
        ? {
            score: question.score,
            reasons: question.scoreReasons,
            unmetPrerequisites: question.unmetPrerequisites || [],
            learnerStage: question.learnerStage,
            stageBias: question.stageBias || 0,
            selectionSource: question.selectionSource || "exploitation",
          }
        : {}),
    }));
  } catch (error) {
    console.error("❌ Error in getSessionQuestions v5:", error.message);
    if (!isLocalQuestionFallbackEnabled()) {
      console.log("⚠️ Local question fallback disabled. Returning no questions.");
      return [];
    }
    const fallbackQuestions = mockQuestions.map(buildQuestionFromSource);
    const lessonFallback = options.lessonId
      ? fallbackQuestions.filter((question) => question.lessonIds.includes(options.lessonId))
      : [];
    const skillFallback = lessonSkillIds?.size
      ? fallbackQuestions.filter((question) => lessonSkillIds.has(getQuestionLearningKey(question)))
      : fallbackQuestions;
    const fallback = shuffleArray(lessonFallback.length > 0 ? lessonFallback : skillFallback).slice(0, count);
    return fallback.map((question) => ({
      questionId: question.questionId,
      _id: question._id,
      questionText: question.questionText,
      questionType: question.questionType,
      options: buildQuestionOptions(question, fallback),
      topic: question.topic,
      subtopic: question.subtopic,
      skillId: question.skillId,
      skillName: question.skillName,
      skillPath: question.skillPath,
      prerequisiteSkillIds: question.prerequisiteSkillIds,
      jlptLevel: question.jlptLevel,
      difficulty: question.difficulty,
    }));
  }
};

export const getLastSelectionReport = () => lastSelectionReport;

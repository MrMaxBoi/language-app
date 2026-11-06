// Adaptive session length (Core lane, Today item 3).
//
// Replaces the hard-coded `5` session size in session.controller.js. The engine
// already classifies a learner into a stage (detectLearnerStage in
// questionSelection.service.js); we map that stage to a STARTING question count
// and nudge it up when the learner has a known weak skill in the lesson's scope,
// so a struggling learner gets a little more targeted repair up front.
//
// Why "starting" and not mid-session growth: the mobile client reads
// questions.length once at session start and walks that fixed queue — there is
// no mid-session fetch yet. A true grow-as-you-go flow needs a mobile change
// (the /:id/extend endpoint below is the Core-side stub for it). This module
// owns only the number the server hands over at start.
//
// NOTE: this is intentionally dependency-free of Mongoose — callers pass in the
// already-loaded signals, so it is trivially unit-testable with no DB.

export const MIN_SESSION_QUESTIONS = 3;
export const MAX_SESSION_QUESTIONS = 6;

// Base starting size per learner stage. Fresh/early learners start short (3) so
// a clean run ends quickly; mid and review learners carry a little more.
const BASE_SIZE_BY_STAGE = {
  cold_start: 3,
  foundation_building: 3,
  core_practice: 4,
  adaptive_review: 5,
  advanced_expansion: 5,
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

/**
 * Decide how many questions a session should start with.
 *
 * @param {object} signals
 * @param {string} signals.learnerStage   One of BASE_SIZE_BY_STAGE's keys.
 * @param {boolean} [signals.hasWeakSkillInScope]  A known weak skill the lesson
 *        covers — if true, add one question for targeted repair.
 * @param {number} [signals.availableQuestionCount]  How many questions actually
 *        exist in the lesson's scope; never ask for more than exist.
 * @returns {{ count: number, basis: object }}
 */
export const decideSessionLength = ({
  learnerStage = "core_practice",
  hasWeakSkillInScope = false,
  availableQuestionCount = MAX_SESSION_QUESTIONS,
} = {}) => {
  const base = BASE_SIZE_BY_STAGE[learnerStage] ?? BASE_SIZE_BY_STAGE.core_practice;
  const weakBump = hasWeakSkillInScope ? 1 : 0;

  // Clamp to [MIN, MAX], then never exceed what the lesson can actually supply.
  let count = clamp(base + weakBump, MIN_SESSION_QUESTIONS, MAX_SESSION_QUESTIONS);
  if (typeof availableQuestionCount === "number" && availableQuestionCount > 0) {
    count = Math.min(count, availableQuestionCount);
  }

  return {
    count,
    basis: {
      learnerStage,
      base,
      weakBump,
      availableQuestionCount,
      min: MIN_SESSION_QUESTIONS,
      max: MAX_SESSION_QUESTIONS,
    },
  };
};

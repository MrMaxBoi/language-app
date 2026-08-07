import Attempt from "../models/attempt.model.js";
import Session from "../models/session.model.js";
import { ROADMAP_UNITS, flattenRoadmapLessons, getRoadmapLessonById } from "../data/roadmap.js";

const COMPLETION_ACCURACY_THRESHOLD = 0.8;
const COMPLETION_ATTEMPT_THRESHOLD = 5;

const buildLessonStats = async (userId) => {
  const lessonSessions = await Session.find({
    userId,
    status: "completed",
    "roadmap.lessonId": { $exists: true, $ne: null },
  }).lean();

  if (!lessonSessions.length) return {};

  const sessionIds = lessonSessions.map((session) => session._id);
  const attempts = await Attempt.find({ sessionId: { $in: sessionIds } }).lean();
  const sessionById = lessonSessions.reduce((lookup, session) => {
    lookup[String(session._id)] = session;
    return lookup;
  }, {});

  return attempts.reduce((lookup, attempt) => {
    const session = sessionById[String(attempt.sessionId)];
    const lessonId = session?.roadmap?.lessonId;
    if (!lessonId) return lookup;

    if (!lookup[lessonId]) {
      lookup[lessonId] = {
        attempts: 0,
        correct: 0,
        completedSessions: 0,
        lastCompletedAt: null,
      };
    }

    lookup[lessonId].attempts += 1;
    if (attempt.isCorrect) lookup[lessonId].correct += 1;
    return lookup;
  }, lessonSessions.reduce((lookup, session) => {
    const lessonId = session.roadmap?.lessonId;
    if (!lessonId) return lookup;
    const existing = lookup[lessonId] || {
      attempts: 0,
      correct: 0,
      completedSessions: 0,
      lastCompletedAt: null,
    };
    existing.completedSessions += 1;
    if (!existing.lastCompletedAt || new Date(session.completedAt) > new Date(existing.lastCompletedAt)) {
      existing.lastCompletedAt = session.completedAt;
    }
    lookup[lessonId] = existing;
    return lookup;
  }, {}));
};

const getLessonStatus = ({ lesson, index, lessonStats, previousLessonCompleted }) => {
  const stats = lessonStats[lesson.id] || {
    attempts: 0,
    correct: 0,
    completedSessions: 0,
    lastCompletedAt: null,
  };
  const accuracy = stats.attempts > 0 ? stats.correct / stats.attempts : 0;
  const isCompleted =
    stats.attempts >= COMPLETION_ATTEMPT_THRESHOLD &&
    accuracy >= COMPLETION_ACCURACY_THRESHOLD;

  if (isCompleted) return "completed";
  if (index === 0 || previousLessonCompleted) return stats.attempts > 0 ? "in_progress" : "unlocked";
  return "locked";
};

export const buildRoadmapForUser = async (userId = "guest") => {
  const lessonStats = await buildLessonStats(userId);
  const flatLessons = flattenRoadmapLessons();
  const statusByLessonId = {};

  flatLessons.forEach((lesson, index) => {
    const previousLesson = flatLessons[index - 1];
    const previousLessonCompleted = index === 0 || statusByLessonId[previousLesson.id] === "completed";
    statusByLessonId[lesson.id] = getLessonStatus({
      lesson,
      index,
      lessonStats,
      previousLessonCompleted,
    });
  });

  const units = ROADMAP_UNITS.map((unit) => ({
    ...unit,
    lessons: unit.lessons.map((lesson) => {
      const stats = lessonStats[lesson.id] || {
        attempts: 0,
        correct: 0,
        completedSessions: 0,
        lastCompletedAt: null,
      };
      const accuracy = stats.attempts > 0 ? Math.round((stats.correct / stats.attempts) * 100) : 0;

      return {
        ...lesson,
        status: statusByLessonId[lesson.id] || "locked",
        progress: {
          attempts: stats.attempts,
          correct: stats.correct,
          accuracy,
          completedSessions: stats.completedSessions,
          lastCompletedAt: stats.lastCompletedAt,
        },
      };
    }),
  }));

  const nextLesson =
    units.flatMap((unit) => unit.lessons).find((lesson) => lesson.status === "unlocked" || lesson.status === "in_progress") ||
    units.flatMap((unit) => unit.lessons).at(-1) ||
    null;

  return {
    userId,
    completionRule: {
      minimumAttempts: COMPLETION_ATTEMPT_THRESHOLD,
      accuracyThreshold: COMPLETION_ACCURACY_THRESHOLD,
    },
    units,
    nextLesson,
  };
};

export const getStartableRoadmapLesson = async ({ userId = "guest", lessonId }) => {
  const lesson = getRoadmapLessonById(lessonId);
  if (!lesson) return null;

  const roadmap = await buildRoadmapForUser(userId);
  const roadmapLesson = roadmap.units
    .flatMap((unit) => unit.lessons.map((unitLesson) => ({ ...unitLesson, unitId: unit.id, unitTitle: unit.title })))
    .find((unitLesson) => unitLesson.id === lessonId);

  return roadmapLesson || lesson;
};

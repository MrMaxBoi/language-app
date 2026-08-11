import {
  DEFAULT_ROADMAP_ID,
  ROADMAPS,
  flattenRoadmapLessons,
  getRoadmapById,
  getRoadmapLessonById,
} from "../data/roadmap.js";
import Attempt from "../models/attempt.model.js";
import Question from "../models/question.model.js";
import Session from "../models/session.model.js";
import { hasLessonContent } from "../data/lessonContent/index.js";

const COMPLETION_ACCURACY_THRESHOLD = 0.8;
const COMPLETION_ATTEMPT_THRESHOLD = 5;

const buildLessonContentStats = async (lessonIds) => {
  const lessonIdSet = new Set(lessonIds);
  const questions = await Question.find({ lessonIds: { $in: lessonIds } })
    .select({ questionId: 1, lessonIds: 1 })
    .lean();
  const counts = questions.reduce((lookup, question) => {
    for (const lessonId of question.lessonIds || []) {
      if (lessonIdSet.has(lessonId)) {
        lookup[lessonId] = (lookup[lessonId] || 0) + 1;
      }
    }
    return lookup;
  }, {});

  return { counts, uniqueQuestionCount: questions.length };
};

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

const getLessonStatus = ({ lesson, index, lessonStats, previousLessonCompleted, contentReady }) => {
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
  if (!contentReady) return "coming_soon";
  if (index === 0 || previousLessonCompleted) return stats.attempts > 0 ? "in_progress" : "unlocked";
  return "locked";
};

export const buildRoadmapForUser = async (userId = "guest", roadmapId = DEFAULT_ROADMAP_ID) => {
  const definition = getRoadmapById(roadmapId);
  if (!definition) return null;

  const flatLessons = flattenRoadmapLessons(roadmapId);
  const [lessonStats, contentStats] = await Promise.all([
    buildLessonStats(userId),
    buildLessonContentStats(flatLessons.map((lesson) => lesson.id)),
  ]);
  const statusByLessonId = {};

  flatLessons.forEach((lesson, index) => {
    const previousLesson = flatLessons[index - 1];
    const previousLessonCompleted = index === 0 || statusByLessonId[previousLesson.id] === "completed";
    const availableQuestionCount = contentStats.counts[lesson.id] || 0;
    const teachingContentReady = !lesson.requiresTeachingContent || hasLessonContent(lesson.id);
    statusByLessonId[lesson.id] = getLessonStatus({
      lesson,
      index,
      lessonStats,
      previousLessonCompleted,
      contentReady: teachingContentReady && availableQuestionCount >= lesson.minimumQuestionCount,
    });
  });

  const units = definition.units.map((unit) => ({
    ...unit,
    lessons: unit.lessons.map((lesson) => {
      const stats = lessonStats[lesson.id] || {
        attempts: 0,
        correct: 0,
        completedSessions: 0,
        lastCompletedAt: null,
      };
      const accuracy = stats.attempts > 0 ? Math.round((stats.correct / stats.attempts) * 100) : 0;
      const availableQuestionCount = contentStats.counts[lesson.id] || 0;
      const hasTeaching = hasLessonContent(lesson.id);
      const teachingContentReady = !lesson.requiresTeachingContent || hasTeaching;
      const questionContentReady = availableQuestionCount >= lesson.minimumQuestionCount;

      return {
        ...lesson,
        roadmapId: definition.id,
        status: statusByLessonId[lesson.id] || "locked",
        content: {
          availableQuestionCount,
          minimumQuestionCount: lesson.minimumQuestionCount,
          hasTeachingContent: hasTeaching,
          teachingContentReady,
          questionContentReady,
          ready: teachingContentReady && questionContentReady,
        },
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

  const allLessons = units.flatMap((unit) => unit.lessons);
  const nextLesson =
    allLessons.find((lesson) => lesson.status === "unlocked" || lesson.status === "in_progress") ||
    null;

  return {
    userId,
    roadmapId: definition.id,
    title: definition.title,
    shortLabel: definition.shortLabel,
    description: definition.description,
    level: definition.level,
    availableRoadmaps: ROADMAPS.map((roadmap) => ({
      id: roadmap.id,
      title: roadmap.title,
      shortLabel: roadmap.shortLabel,
      description: roadmap.description,
      level: roadmap.level,
      unitCount: roadmap.units.length,
      lessonCount: roadmap.units.reduce((sum, unit) => sum + unit.lessons.length, 0),
    })),
    completionRule: {
      minimumAttempts: COMPLETION_ATTEMPT_THRESHOLD,
      accuracyThreshold: COMPLETION_ACCURACY_THRESHOLD,
    },
    units,
    nextLesson,
    contentSummary: {
      readyLessons: allLessons.filter((lesson) => lesson.content.ready).length,
      plannedLessons: allLessons.length,
      availableQuestions: contentStats.uniqueQuestionCount,
    },
  };
};

export const getStartableRoadmapLesson = async ({ userId = "guest", lessonId }) => {
  const lesson = getRoadmapLessonById(lessonId);
  if (!lesson) return null;

  const roadmap = await buildRoadmapForUser(userId, lesson.roadmapId);
  if (!roadmap) return null;

  return roadmap.units
    .flatMap((unit) =>
      unit.lessons.map((unitLesson) => ({
        ...unitLesson,
        unitId: unit.id,
        unitTitle: unit.title,
      }))
    )
    .find((unitLesson) => unitLesson.id === lessonId) || null;
};

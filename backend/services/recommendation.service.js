import { buildRoadmapForUser } from "./roadmap.service.js";
import { getActiveReviewTasks } from "./reviewTask.service.js";
import { getDailyReviewPreview } from "./reviewSessionBuilder.service.js";
import Session from "../models/session.model.js";

const getLocalDayBounds = (date = new Date()) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
};

const getCurrentUnit = (roadmap, nextLesson) =>
  roadmap?.units?.find((unit) => unit.lessons.some((lesson) => lesson.id === nextLesson?.id)) ||
  roadmap?.units?.[0] ||
  null;

const buildPathPreview = ({ currentUnit, nextLesson }) => {
  const lessons = currentUnit?.lessons || [];
  const currentIndex = lessons.findIndex((lesson) => lesson.id === nextLesson?.id);

  return {
    moduleTitle: currentUnit?.title || "Foundation path",
    currentStep: currentIndex >= 0 ? currentIndex + 1 : 1,
    totalSteps: lessons.length || 1,
    preview: lessons.slice(0, 3).map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      description: lesson.description,
      status: lesson.id === nextLesson?.id ? "current" : lesson.status,
    })),
  };
};

const buildReviewTopics = (mergedSkills = [], roadmapUnits = []) => {
  const groups = new Map();

  for (const skill of mergedSkills) {
    const unit = roadmapUnits.find((candidate) =>
      candidate.lessons.some((lesson) => lesson.primarySkillIds?.includes(skill.skillId))
    ) || roadmapUnits.find((candidate) =>
      candidate.lessons.some((lesson) => lesson.skillIds?.includes(skill.skillId))
    );
    const id = unit?.id || `skill:${skill.skillId}`;

    if (!groups.has(id)) {
      groups.set(id, {
        id,
        title: unit?.title || skill.skillName || "Review topic",
        skillIds: new Set(),
        taskCount: 0,
        reasons: new Set(),
        weight: 0,
        skills: [],
      });
    }

    const group = groups.get(id);
    group.skillIds.add(skill.skillId);
    group.taskCount += skill.taskIds?.length || 0;
    group.weight += Number(skill.weight) || 1;
    for (const reason of skill.types || []) group.reasons.add(reason);
    group.skills.push({
      skillId: skill.skillId,
      title: skill.skillName || "Review topic",
      taskCount: skill.taskIds?.length || 0,
      reasons: skill.types || [],
      weight: Number(skill.weight) || 1,
    });
  }

  const groupedTopics = [...groups.values()];
  const totalWeight = groupedTopics.reduce((sum, topic) => sum + topic.weight, 0);

  return groupedTopics
    .map((topic) => ({
      id: topic.id,
      title: topic.title,
      skillIds: [...topic.skillIds],
      taskCount: topic.taskCount,
      reasons: [...topic.reasons],
      skills: topic.skills
        .sort((a, b) => b.weight - a.weight || b.taskCount - a.taskCount)
        .map(({ weight, ...skill }) => skill),
      relativeWeight: totalWeight > 0
        ? Math.max(1, Math.round((topic.weight / totalWeight) * 100))
        : 0,
    }))
    .sort((a, b) => b.relativeWeight - a.relativeWeight || b.taskCount - a.taskCount);
};

export const buildHomeRecommendation = async (userId = "guest", roadmapId) => {
  const { start, end } = getLocalDayBounds();
  const [roadmap, reviewTasks, completedDailyReview] = await Promise.all([
    buildRoadmapForUser(userId, roadmapId),
    getActiveReviewTasks(userId),
    Session.findOne({
      userId,
      status: "completed",
      "roadmap.mode": "daily_review",
      completedAt: { $gte: start, $lt: end },
    }).sort({ completedAt: -1 }).lean(),
  ]);

  const nextLesson = roadmap.nextLesson || null;
  const topReviewTask = reviewTasks[0] || null;
  const currentPath = buildPathPreview({
    currentUnit: getCurrentUnit(roadmap, nextLesson),
    nextLesson,
  });
  const lessonTitle = nextLesson?.title || "your next lesson";
  const reviewCount = reviewTasks.length;
  const dailyReview = await getDailyReviewPreview(userId, { activeReviewTasks: reviewTasks });

  const hasCompletedDailyReview = Boolean(completedDailyReview);
  const primaryAction = reviewCount > 0 && !hasCompletedDailyReview
    ? {
        type: "daily_review",
        title: "Complete today's review",
        description: `${dailyReview.requestedQuestionCount} questions covering ${reviewCount} review priorit${reviewCount === 1 ? "y" : "ies"}.`,
        ctaLabel: "Start Review",
        payload: { mode: "daily_review" },
      }
    : {
        type: "lesson",
        title: "Continue your path",
        description: `Continue ${lessonTitle}.`,
        ctaLabel: "Continue Learning",
        payload: nextLesson?.id ? { lessonId: nextLesson.id } : {},
      };

  return {
    userId,
    primaryAction,
    todayPlan: {
      badge: hasCompletedDailyReview ? "REVIEW COMPLETE" : reviewCount > 0 ? "REVIEW DAY" : "NEXT LESSON",
      title: "Welcome back",
      text: hasCompletedDailyReview
        ? `You kept today's learning fresh. Continue ${lessonTitle} when you are ready.`
        : reviewCount > 0
        ? `Today's plan is to refresh a few older memories, then continue ${lessonTitle}.`
        : `Today's plan is to continue ${lessonTitle} and keep your foundation moving.`,
      items: [
        hasCompletedDailyReview
          ? "Today's review is complete"
          : reviewCount > 0
          ? `Review ${reviewCount} weak item${reviewCount === 1 ? "" : "s"}`
          : "No quick review due",
        `Continue ${lessonTitle}`,
      ],
    },
    nextLesson: nextLesson
      ? {
          id: nextLesson.id,
          title: nextLesson.title,
          description: nextLesson.description || "Continue building your Japanese foundation step by step.",
          status: nextLesson.status || "ready",
          metadata: `10 min · ${(nextLesson.status || "ready").replace("_", " ")}`,
          payload: { lessonId: nextLesson.id },
        }
      : null,
    reviewSummary: {
      count: reviewCount,
      questionCount: dailyReview.requestedQuestionCount,
      estimatedMinutes: dailyReview.estimatedMinutes,
      breakdown: dailyReview.summary,
      topTask: topReviewTask,
      title: reviewCount > 0
        ? `${reviewCount} item${reviewCount === 1 ? "" : "s"} need review`
        : "Nothing urgent to review",
      description: topReviewTask
        ? topReviewTask.reason
        : "You can keep going with your next lesson.",
      payload: reviewCount > 0
        ? {
            reviewTaskIds: reviewTasks.map((task) => task.id),
            reviewSkillIds: [...new Set(reviewTasks.map((task) => task.skillId).filter(Boolean))],
            reviewTitle: "Review weak areas",
          }
        : null,
    },
    reviewOfDay: {
      state: hasCompletedDailyReview ? "completed" : reviewCount > 0 ? "ready" : "caught_up",
      completedAt: completedDailyReview?.completedAt || null,
      completion: completedDailyReview?.roadmap?.reviewCompletionSummary || null,
      questionCount: dailyReview.requestedQuestionCount,
      estimatedMinutes: dailyReview.estimatedMinutes,
      activeTaskCount: reviewCount,
      breakdown: dailyReview.summary,
      topics: buildReviewTopics(dailyReview.mergedSkills, roadmap.units),
    },
    currentPath,
  };
};

import Attempt from "../models/attempt.model.js";
import KnowledgeCoverage from "../models/knowledgeCoverage.model.js";
import Memory from "../models/memory.model.js";
import Session from "../models/session.model.js";
import Skill from "../models/skill.model.js";
import { SKILL_GRAPH } from "../data/skillGraph.js";
import { buildRoadmapForUser } from "../services/roadmap.service.js";
import {
  calculateAverageMastery,
  calculateRecentAccuracy,
  countCoveredSkills,
  detectLearnerStage,
} from "../services/questionSelection.service.js";

const STAGE_LABELS = {
  cold_start: "Cold Start",
  foundation_building: "Foundation Building",
  adaptive_review: "Adaptive Review",
  core_practice: "Core Practice",
  advanced_expansion: "Advanced Expansion",
};

const STAGE_MESSAGES = {
  cold_start: "Kokoro is still learning your baseline. Start with a short roadmap lesson.",
  foundation_building: "Kokoro is building your beginner foundation while keeping weak skills in rotation.",
  adaptive_review: "Kokoro sees a few shaky areas, so review should lead the next session.",
  core_practice: "You are ready for a wider mix of review, challenge, and new core skills.",
  advanced_expansion: "You are ready to expand into broader skills while Kokoro keeps older knowledge warm.",
};

const clampPercent = (value) => Math.max(0, Math.min(100, Math.round(Number(value) || 0)));

const toMasteryPercent = (mastery) => {
  const numericMastery = Number(mastery) || 0;
  return clampPercent(numericMastery <= 1 ? numericMastery * 100 : numericMastery);
};

const formatSkill = (skill = {}) => ({
  skillId: skill.skillId || null,
  skillName: skill.skillName || skill.subtopic || skill.topic || "Unknown skill",
  topic: skill.topic || skill.skillPath?.[1] || "Skill",
  subtopic: skill.subtopic || skill.skillPath?.[2] || "",
  skillPath: skill.skillPath || [],
  mastery: Number(skill.mastery) || 0,
  masteryPercent: toMasteryPercent(skill.mastery),
  attempts: Number(skill.attempts) || 0,
  correct: Number(skill.correct) || 0,
  jlptLevel: skill.jlptLevel || "N5",
  lastUpdated: skill.lastUpdated || skill.updatedAt || null,
});

const getAverageAccuracy = (sessions = []) => {
  const scoredSessions = sessions.filter((session) => Number(session.score?.total) > 0);
  if (!scoredSessions.length) return 0;

  const totalAccuracy = scoredSessions.reduce((sum, session) => sum + (Number(session.score?.percentage) || 0), 0);
  return clampPercent(totalAccuracy / scoredSessions.length);
};

const buildReviewQueue = (memories = []) => {
  const now = Date.now();

  return memories
    .map((memory) => {
      const strength = Number(memory.strength) || 0;
      const isOverdue = memory.nextReviewDate ? new Date(memory.nextReviewDate).getTime() <= now : false;
      const daysUntilReview = memory.nextReviewDate
        ? Math.ceil((new Date(memory.nextReviewDate).getTime() - now) / (1000 * 60 * 60 * 24))
        : null;
      const decayRisk = clampPercent((1 - strength) * 100);

      return {
        ...formatSkill(memory),
        strength,
        strengthPercent: toMasteryPercent(strength),
        nextReviewDate: memory.nextReviewDate || null,
        lastReviewed: memory.lastReviewed || null,
        isOverdue,
        isWeak: strength < 0.45,
        daysUntilReview,
        decayRisk,
      };
    })
    .filter((memory) => memory.isOverdue || memory.isWeak || memory.decayRisk >= 55)
    .sort((a, b) => {
      if (a.isOverdue !== b.isOverdue) return a.isOverdue ? -1 : 1;
      if (a.isWeak !== b.isWeak) return a.isWeak ? -1 : 1;
      return b.decayRisk - a.decayRisk;
    })
    .slice(0, 8);
};

const countEligibleReviewMemories = (memories = []) => {
  const now = Date.now();

  return memories.filter((memory) => {
    const strength = Number(memory.strength) || 0;
    const isOverdue = memory.nextReviewDate ? new Date(memory.nextReviewDate).getTime() <= now : false;
    const isWeak = strength < 0.45;
    const decayRisk = clampPercent((1 - strength) * 100);
    return isOverdue || isWeak || decayRisk >= 55;
  }).length;
};

const summarizeReviewQueue = (reviewQueue = []) =>
  reviewQueue.map((item) => ({
    title: item.skillName,
    skillId: item.skillId,
    topic: item.topic,
    subtopic: item.subtopic,
    isOverdue: item.isOverdue,
    isWeak: item.isWeak,
    decayRisk: item.decayRisk,
    lastReviewed: item.lastReviewed,
    nextReviewDate: item.nextReviewDate,
    source: "recomputed_from_memory",
  }));

const buildRecommendedAction = ({ learnerStage, reviewQueue, nextLesson }) => {
  if (learnerStage === "cold_start") {
    return {
      type: "start_roadmap",
      label: "Start the first roadmap lesson",
      reason: "A fresh learner needs baseline signal before adaptive review becomes useful.",
      lessonId: nextLesson?.id || null,
    };
  }

  if (reviewQueue.length > 0 && learnerStage === "adaptive_review") {
    return {
      type: "review",
      label: "Review weak memories first",
      reason: "Several memories are due or weak enough to deserve priority.",
      lessonId: nextLesson?.id || null,
    };
  }

  if (nextLesson) {
    return {
      type: "continue_roadmap",
      label: "Continue the roadmap",
      reason: "Roadmap progress gives Kokoro a clear skill focus while the engine still adapts inside the lesson.",
      lessonId: nextLesson.id,
    };
  }

  return {
    type: "adaptive_practice",
    label: "Run adaptive practice",
    reason: "No roadmap lesson is currently available, so the adaptive engine should choose the next practice mix.",
    lessonId: null,
  };
};

const buildRoadmapProgress = (roadmap) => {
  const lessons = roadmap.units.flatMap((unit) => unit.lessons);
  const completed = lessons.filter((lesson) => lesson.status === "completed").length;
  const inProgress = lessons.filter((lesson) => lesson.status === "in_progress").length;
  const unlocked = lessons.filter((lesson) => lesson.status === "unlocked").length;

  return {
    totalLessons: lessons.length,
    completedLessons: completed,
    inProgressLessons: inProgress,
    unlockedLessons: unlocked,
    completionPercent: lessons.length ? clampPercent((completed / lessons.length) * 100) : 0,
  };
};

export const getLearnerState = async (req, res) => {
  try {
    const { userId = "guest" } = req.params;

    const [skills, memories, coverages, recentAttempts, recentSessions, roadmap, totalAttemptCount, totalSessionCount] = await Promise.all([
      Skill.find({ userId }).sort({ mastery: 1, attempts: -1 }).lean(),
      Memory.find({ userId }).sort({ nextReviewDate: 1 }).lean(),
      KnowledgeCoverage.find({ userId }).lean(),
      Attempt.find({ userId }).sort({ createdAt: -1 }).limit(50).lean(),
      Session.find({ userId, status: "completed" }).sort({ completedAt: -1, createdAt: -1 }).limit(12).lean(),
      buildRoadmapForUser(userId),
      Attempt.countDocuments({ userId }),
      Session.countDocuments({ userId, status: "completed" }),
    ]);

    const masteryLookup = skills.reduce((lookup, skill) => {
      lookup[skill.skillId || `${skill.topic}||${skill.subtopic}`] = Number(skill.mastery) || 0;
      return lookup;
    }, {});

    const weakSkills = skills
      .filter((skill) => Number(skill.attempts) > 0 && Number(skill.mastery) < 0.6)
      .sort((a, b) => (Number(a.mastery) || 0) - (Number(b.mastery) || 0))
      .slice(0, 6)
      .map(formatSkill);

    const strongSkills = skills
      .filter((skill) => Number(skill.attempts) > 0 && Number(skill.mastery) >= 0.75)
      .sort((a, b) => (Number(b.mastery) || 0) - (Number(a.mastery) || 0))
      .slice(0, 6)
      .map(formatSkill);

    const learnerStageMetrics = {
      totalAttemptCount,
      coveredSkillCount: countCoveredSkills(coverages),
      averageMastery: calculateAverageMastery({ bySkill: masteryLookup }),
      recentAccuracy: calculateRecentAccuracy(recentAttempts),
      weakSkillCount: weakSkills.length,
    };

    const learnerStage = detectLearnerStage(learnerStageMetrics);
    const reviewQueue = buildReviewQueue(memories);
    const eligibleReviewMemoryCount = countEligibleReviewMemories(memories);
    console.log("🧠 learnerState.reviewQueue response:", {
      userId,
      source: "recomputed_from_memory_records",
      memoryCount: memories.length,
      eligibleReviewMemoryCount,
      returnedQueueCap: 8,
      reviewQueueLength: reviewQueue.length,
      items: summarizeReviewQueue(reviewQueue),
    });
    const averageAccuracy = getAverageAccuracy(recentSessions);
    const roadmapProgress = buildRoadmapProgress(roadmap);

    res.json({
      success: true,
      data: {
        userId,
        learnerStage,
        learnerStageLabel: STAGE_LABELS[learnerStage] || learnerStage,
        stageMessage: STAGE_MESSAGES[learnerStage] || STAGE_MESSAGES.foundation_building,
        learnerStageMetrics,
        summary: {
          totalSessions: totalSessionCount,
          totalAttempts: totalAttemptCount,
          averageAccuracy,
          coveragePercent: clampPercent((learnerStageMetrics.coveredSkillCount / SKILL_GRAPH.length) * 100),
          averageMasteryPercent: toMasteryPercent(learnerStageMetrics.averageMastery),
          reviewQueueCount: reviewQueue.length,
        },
        roadmapProgress,
        nextLesson: roadmap.nextLesson,
        weakSkills,
        strongSkills,
        reviewQueue,
        recentSessions: recentSessions.map((session) => ({
          sessionId: session._id,
          completedAt: session.completedAt || session.updatedAt,
          accuracy: Number(session.score?.percentage) || 0,
          correct: Number(session.score?.correct) || 0,
          total: Number(session.score?.total) || 0,
          lessonId: session.roadmap?.lessonId || null,
          lessonTitle: session.roadmap?.lessonTitle || "",
        })),
        recommendedAction: buildRecommendedAction({
          learnerStage,
          reviewQueue,
          nextLesson: roadmap.nextLesson,
        }),
      },
    });
  } catch (error) {
    console.error("Learner state error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to build learner state.",
      error: error.message,
    });
  }
};

import mongoose from "mongoose";
import Session from "../models/session.model.js";
import Question from "../models/question.model.js";
import { analyzeSession } from "../services/analysis.service.js";
import { generateLearningFeedback } from "../services/ai.service.js";
import { getSessionQuestions, getLearnerStageSignals } from "../services/questionSelection.service.js";
import { decideSessionLength, MAX_SESSION_QUESTIONS } from "../services/sessionLength.service.js";
import { updateMemoryAfterAttempt } from "../services/memory.service.js";
import { generateSessionAnalytics } from "../services/analytics.service.js";
import Attempt from "../models/attempt.model.js";
import Skill from "../models/skill.model.js";
import Memory from "../models/memory.model.js";
import KnowledgeCoverage from "../models/knowledgeCoverage.model.js";
import mockQuestions from "../data/questions.js";
import { isLocalQuestionFallbackEnabled } from "../config/questionBank.js";
import { getLearningKey, getQuestionSkill } from "../data/skillGraph.js";
import { getStartableRoadmapLesson } from "../services/roadmap.service.js";
import { updateSkillStateAfterAttempt } from "../services/skillState.service.js";
import {
  buildReviewCompletionSummary,
  completeReviewTasksForSession,
  createOrUpdateMistakeTask,
  syncDueMemoryTasks,
} from "../services/reviewTask.service.js";
import { buildDailyReviewSession } from "../services/reviewSessionBuilder.service.js";

const buildSkillSummary = (attempts = []) => {
  const skillMap = {};

  for (const attempt of attempts) {
    const canonicalSkill = getQuestionSkill(attempt);
    const skillId = attempt.skillId || canonicalSkill.skillId || getLearningKey(attempt);
    const skillName = attempt.skillName || canonicalSkill.skillName || attempt.subtopic || attempt.topic || "Unknown skill";

    if (!skillMap[skillId]) {
      skillMap[skillId] = {
        skillId,
        skillName,
        skillPath: attempt.skillPath || canonicalSkill.skillPath || [],
        topic: attempt.topic || "unknown",
        subtopic: attempt.subtopic || "unknown",
        difficultyCounts: { easy: 0, medium: 0, hard: 0 },
        correct: 0,
        total: 0,
        accuracy: 0,
      };
    }

    const difficulty = ["easy", "medium", "hard"].includes(attempt.difficulty)
      ? attempt.difficulty
      : "easy";

    skillMap[skillId].total += 1;
    skillMap[skillId].difficultyCounts[difficulty] += 1;
    if (attempt.isCorrect) {
      skillMap[skillId].correct += 1;
    }
  }

  return Object.values(skillMap)
    .map((skill) => {
      const accuracy = skill.total > 0 ? Math.round((skill.correct / skill.total) * 100) : 0;
      let status = "steady";

      if (skill.total === 0) {
        status = "unseen";
      } else if (accuracy < 60) {
        status = "needs_review";
      } else if (accuracy >= 80) {
        status = "strong";
      }

      return {
        ...skill,
        accuracy,
        status,
      };
    })
    .sort((a, b) => a.accuracy - b.accuracy || b.total - a.total);
};

const buildQuestionReview = (attempts = []) =>
  attempts.map((attempt, index) => ({
    index: index + 1,
    questionId: attempt.questionId,
    userAnswer: attempt.userAnswer,
    correctAnswer: attempt.correctAnswer,
    isCorrect: attempt.isCorrect,
    topic: attempt.topic,
    subtopic: attempt.subtopic,
    skillId: attempt.skillId,
    skillName: attempt.skillName,
    skillPath: attempt.skillPath || [],
    difficulty: attempt.difficulty || "easy",
    learningObjective: attempt.learningObjective || "",
    commonMistakes: attempt.commonMistakes || [],
  }));

const buildSessionReportPayload = ({ session, attempts = [] }) => {
  const skillSummary = buildSkillSummary(attempts);
  const weakSkills = skillSummary.filter((skill) => skill.status === "needs_review");
  const strongSkills = skillSummary.filter((skill) => skill.status === "strong");
  const nextFocus = weakSkills[0] || null;
  const suggestedPractice = weakSkills[0] || skillSummary.find((skill) => skill.status === "steady") || skillSummary[0] || null;

  return {
    sessionId: session._id,
    userId: session.userId,
    status: session.status,
    completedAt: session.completedAt,
    score: session.score,
    roadmap: session.roadmap || {},
    reviewCompletionSummary: session.roadmap?.reviewCompletionSummary || null,
    analysis: session.analysis || {},
    analytics: session.analytics || {},
    skillSummary,
    weakSkills,
    strongSkills,
    nextFocus,
    suggestedPractice,
    answers: buildQuestionReview(attempts),
  };
};

const refreshReviewTargets = async ({ session, attempts = [] }) => {
  if (!["review", "daily_review"].includes(session.roadmap?.mode)) return [];

  const targetSkillIds = Array.isArray(session.roadmap?.skillIds)
    ? session.roadmap.skillIds.filter(Boolean)
    : [];
  if (!targetSkillIds.length) return [];

  const grouped = targetSkillIds.reduce((lookup, skillId) => {
    lookup[skillId] = { correct: 0, total: 0 };
    return lookup;
  }, {});

  attempts.forEach((attempt) => {
    if (!attempt.skillId || !grouped[attempt.skillId]) return;
    grouped[attempt.skillId].total += 1;
    if (attempt.isCorrect) grouped[attempt.skillId].correct += 1;
  });

  const now = new Date();
  const refreshed = [];

  for (const [skillId, stats] of Object.entries(grouped)) {
    if (stats.correct < 2) {
      refreshed.push({ skillId, ...stats, cleared: false, reason: "clear_threshold_not_met" });
      continue;
    }

    const nextReviewDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const existingMemory = await Memory.findOne({ userId: session.userId, skillId });

    if (existingMemory) {
      existingMemory.lastReviewed = now;
      existingMemory.nextReviewDate = nextReviewDate;
      existingMemory.strength = Math.max(Number(existingMemory.strength) || 0, 0.65);
      existingMemory.reviewInterval = Math.max(Number(existingMemory.reviewInterval) || 0, 3);
      await existingMemory.save();
    }

    const memory = existingMemory?.toObject();

    refreshed.push({
      skillId,
      ...stats,
      cleared: Boolean(memory),
      reason: memory ? "review_threshold_met" : "memory_not_found",
      nextReviewDate: memory?.nextReviewDate || null,
    });
  }

  console.log("🧹 Review clear check:", refreshed);
  return refreshed;
};

const getReviewDebugQueue = async (userId) => {
  const now = Date.now();
  const memories = await Memory.find({ userId }).lean();

  return memories
    .map((memory) => {
      const strength = Number(memory.strength) || 0;
      const isOverdue = memory.nextReviewDate ? new Date(memory.nextReviewDate).getTime() <= now : false;
      const decayRisk = Math.max(0, Math.min(100, Math.round((1 - strength) * 100)));

      return {
        title: memory.skillName || memory.subtopic || memory.topic,
        skillId: memory.skillId,
        topic: memory.topic,
        subtopic: memory.subtopic,
        strength,
        isOverdue,
        isWeak: strength < 0.45,
        decayRisk,
        lastReviewed: memory.lastReviewed,
        nextReviewDate: memory.nextReviewDate,
        source: "recomputed_from_memory",
      };
    })
    .filter((item) => item.isOverdue || item.isWeak || item.decayRisk >= 55)
    .sort((a, b) => {
      if (a.isOverdue !== b.isOverdue) return a.isOverdue ? -1 : 1;
      if (a.isWeak !== b.isWeak) return a.isWeak ? -1 : 1;
      return b.decayRisk - a.decayRisk;
    })
    .slice(0, 8);
};

const summarizeAttemptsBySkill = (attempts = []) =>
  Object.values(
    attempts.reduce((lookup, attempt) => {
      const key = attempt.skillId || `${attempt.topic}||${attempt.subtopic}`;
      if (!lookup[key]) {
        lookup[key] = {
          skillId: attempt.skillId || null,
          skillName: attempt.skillName || attempt.subtopic || attempt.topic,
          topic: attempt.topic,
          subtopic: attempt.subtopic,
          correct: 0,
          total: 0,
        };
      }
      lookup[key].total += 1;
      if (attempt.isCorrect) lookup[key].correct += 1;
      return lookup;
    }, {})
  );

const updateKnowledgeCoverage = async ({
  userId,
  topic,
  subtopic,
  skillId,
  skillName,
  skillPath,
  prerequisiteSkillIds,
  jlptLevel,
}) => {
  if (!userId || !topic || !subtopic) return;

  const now = new Date();
  const skillFilter = skillId ? { userId, $or: [{ skillId }, { topic, subtopic }] } : { userId, topic, subtopic };
  const skill = await Skill.findOne(skillFilter).lean();
  const update = {
    $inc: { exposureCount: 1 },
    $set: {
      lastSeenAt: now,
      skillId,
      skillName,
      skillPath,
      prerequisiteSkillIds,
      jlptLevel,
    },
    $setOnInsert: { userId, topic, subtopic },
  };
  if (typeof skill?.mastery === "number") {
    update.$set.mastery = skill.mastery;
  }

  await KnowledgeCoverage.findOneAndUpdate(
    skillId ? { userId, $or: [{ skillId }, { topic, subtopic }] } : { userId, topic, subtopic },
    update,
    { upsert: true, setDefaultsOnInsert: true }
  );
};

const syncKnowledgeCoverageMastery = async (userId) => {
  const coverages = await KnowledgeCoverage.find({ userId }).lean();
  if (!coverages.length) return;

  const skills = await Skill.find({ userId }).lean();
  const skillLookup = skills.reduce((lookup, skill) => {
    const canonicalSkill = getQuestionSkill(skill);
    const key = getLearningKey(skill);
    const legacyKey = `${String(skill.topic || "unknown").trim()}||${String(skill.subtopic || "unknown").trim()}`;
    lookup[key] = skill.mastery;
    lookup[canonicalSkill.skillId] = skill.mastery;
    lookup[legacyKey] = skill.mastery;
    return lookup;
  }, {});

  const bulkOps = coverages.map((coverage) => {
    const key = getLearningKey(coverage);
    const mastery = typeof skillLookup[key] === "number" ? skillLookup[key] : coverage.mastery;
    return {
      updateOne: {
        filter: { _id: coverage._id },
        update: { $set: { mastery } },
      },
    };
  });

  if (bulkOps.length) {
    await KnowledgeCoverage.bulkWrite(bulkOps);
  }
};

export const startSession = async (req, res) => {
  try {
    const {
      lessonId,
      allowLocked = false,
      reviewSkillId,
      reviewSkillIds = [],
      reviewTaskId,
      reviewTaskIds = [],
      reviewTitle,
      mode,
      maxQuestions,
      targetMinutes,
      includeTypes,
      taskIds,
      userId: requestedUserId,
    } = req.body || {};
    const userId = requestedUserId || "guest";
    const isDailyReview = mode === "daily_review";

    if (isDailyReview) {
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const startOfTomorrow = new Date(startOfToday);
      startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
      const completedToday = await Session.exists({
        userId,
        status: "completed",
        "roadmap.mode": "daily_review",
        completedAt: { $gte: startOfToday, $lt: startOfTomorrow },
      });

      if (completedToday) {
        return res.status(409).json({
          success: false,
          message: "Today's review is already complete. Continue your roadmap instead.",
          data: { state: "completed" },
        });
      }
    }

    const dailyReview = isDailyReview
      ? await buildDailyReviewSession(userId, {
          maxQuestions,
          targetMinutes,
          includeTypes,
          taskIds,
        })
      : null;

    if (isDailyReview && dailyReview.taskIds.length === 0) {
      return res.status(409).json({
        success: false,
        message: "You are caught up. No active review tasks are waiting.",
        data: dailyReview,
      });
    }

    if (isDailyReview && dailyReview.questions.length === 0) {
      return res.status(422).json({
        success: false,
        message: "Kokoro could not find questions for today's review.",
        data: dailyReview,
      });
    }
    const roadmapLesson = lessonId
      ? await getStartableRoadmapLesson({ userId, lessonId })
      : null;
    const normalizedReviewSkillIds = [
      ...(Array.isArray(reviewSkillIds) ? reviewSkillIds : []),
      reviewSkillId,
    ].filter(Boolean);
    const normalizedReviewTaskIds = [
      ...(Array.isArray(reviewTaskIds) ? reviewTaskIds : []),
      reviewTaskId,
    ].filter(Boolean);
    const isReviewSession = !isDailyReview && !roadmapLesson && normalizedReviewSkillIds.length > 0;

    if (lessonId && !roadmapLesson) {
      return res.status(404).json({ success: false, message: "Roadmap lesson not found" });
    }

    if (roadmapLesson?.status === "locked" && allowLocked !== true) {
      return res.status(403).json({ success: false, message: "Roadmap lesson is locked" });
    }

    if (roadmapLesson?.status === "coming_soon") {
      return res.status(422).json({
        success: false,
        message: "This lesson is planned, but its learning content is not ready yet.",
      });
    }

    const newSession = new Session({
      userId,
      roadmap: isDailyReview
        ? {
            mode: "daily_review",
            lessonTitle: "Today's Review",
            unitTitle: "Review",
            primarySkillIds: dailyReview.skillIds,
            supportSkillIds: [],
            skillIds: dailyReview.skillIds,
            reviewTaskIds: dailyReview.taskIds,
            estimatedMinutes: dailyReview.estimatedMinutes,
            reviewSummary: dailyReview.summary,
          }
        : roadmapLesson
        ? {
            mode: "roadmap_lesson",
            roadmapId: roadmapLesson.roadmapId,
            lessonId: roadmapLesson.id,
            lessonTitle: roadmapLesson.title,
            unitId: roadmapLesson.unitId,
            unitTitle: roadmapLesson.unitTitle,
            primarySkillIds: roadmapLesson.primarySkillIds,
            supportSkillIds: roadmapLesson.supportSkillIds,
            skillIds: roadmapLesson.skillIds,
          }
        : isReviewSession
          ? {
              mode: "review",
              lessonTitle: reviewTitle || "Review practice",
              unitTitle: "Review",
              primarySkillIds: normalizedReviewSkillIds,
              supportSkillIds: [],
              skillIds: normalizedReviewSkillIds,
              reviewTaskIds: normalizedReviewTaskIds,
            }
        : { mode: "adaptive" },
    });

    await newSession.save();

    console.log(`👤 Active userId: ${newSession.userId}`);

    // ✅ SESSION QUESTION ENGINE v2
    // Adaptive session length (Today item 3): the server decides the starting
    // question count (3-6) from the learner's stage and whether they have a weak
    // skill in this lesson's scope, replacing the old hard-coded 5. Daily review
    // keeps its own length (built by buildDailyReviewSession).
    const lessonScopeSkillIds =
      roadmapLesson?.skillIds || (isReviewSession ? normalizedReviewSkillIds : undefined);

    let questions;
    let sessionLength = null;
    if (isDailyReview) {
      questions = dailyReview.questions;
    } else {
      const signals = await getLearnerStageSignals(newSession.userId, {
        lessonSkillIds: lessonScopeSkillIds,
      });
      sessionLength = decideSessionLength({
        learnerStage: signals.learnerStage,
        hasWeakSkillInScope: signals.hasWeakSkillInScope,
      });
      console.log("📏 Adaptive session length:", { count: sessionLength.count, basis: sessionLength.basis });

      questions = await getSessionQuestions(newSession.userId, sessionLength.count, {
        persistExposure: true,
        lessonId: roadmapLesson?.id,
        lessonTitle: roadmapLesson?.title || (isReviewSession ? newSession.roadmap.lessonTitle : undefined),
        lessonSkillIds: lessonScopeSkillIds,
      });

      // Record the planned size on the session doc (D6) so it is auditable and
      // the future /:id/extend logic has a baseline. Persist what was actually
      // returned in case the lesson pool was smaller than the planned count.
      newSession.roadmap.plannedQuestionCount = sessionLength.count;
      newSession.roadmap.startingQuestionCount = questions.length;
      await newSession.save();
    }

    if (isReviewSession) {
      console.log("🧪 Review session target:", {
        reviewTaskIds: normalizedReviewTaskIds,
        reviewSkillIds: normalizedReviewSkillIds,
        reviewTitle: newSession.roadmap.lessonTitle,
        selectedQuestions: questions.map((question) => ({
          questionId: question.questionId,
          skillId: question.skillId,
          skillName: question.skillName,
        })),
      });
    }

    res.status(201).json({
      success: true,
      data: {
        sessionId: newSession._id,
        roadmap: newSession.roadmap,
        questions,
        ...(sessionLength
          ? {
              sessionLength: {
                plannedQuestionCount: sessionLength.count,
                startingQuestionCount: questions.length,
                min: sessionLength.basis.min,
                max: sessionLength.basis.max,
                basis: sessionLength.basis,
              },
            }
          : {}),
        ...(isDailyReview
          ? {
              mode: dailyReview.mode,
              taskIds: dailyReview.taskIds,
              skillIds: dailyReview.skillIds,
              questionCount: dailyReview.questionCount,
              estimatedMinutes: dailyReview.estimatedMinutes,
              summary: dailyReview.summary,
            }
          : {}),
      },
    });
  } catch (error) {
    console.log(error);
  }
};

// Adaptive session length — extend path (Today item 3, Core stub for the mobile
// half). When a learner is struggling, mobile can ask for 1-3 MORE questions to
// append to its queue, biased to the layers (cognitiveType) they are missing.
// This is a thin stub: it reuses getSessionQuestions over the same lesson scope,
// excludes questions already asked in this session, and caps the total session
// size at MAX_SESSION_QUESTIONS. The MOBILE side (session.tsx + session store)
// that decides WHEN to call this and appends the result is Lesson Design's lane.
export const extendSession = async (req, res) => {
  const { id } = req.params;
  const requested = Number(req.body?.count);

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ success: false, message: "Invalid Session Id" });
  }

  try {
    const session = await Session.findById(id);
    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }
    if (session.status === "completed") {
      return res.status(409).json({ success: false, message: "Session is already complete" });
    }

    const askedCount = await Attempt.countDocuments({ sessionId: id });
    const alreadyAsked = await Attempt.find({ sessionId: id }).select({ questionId: 1 }).lean();
    const askedIds = new Set(alreadyAsked.map((a) => String(a.questionId)));

    // How many more we are allowed to add: 1-3 requested, but never past the max
    // session size relative to what has already been asked.
    const headroom = Math.max(0, MAX_SESSION_QUESTIONS - askedCount);
    const want = clampExtendCount(Number.isFinite(requested) ? requested : 1);
    const toAdd = Math.min(want, headroom);

    if (toAdd <= 0) {
      return res.status(200).json({
        success: true,
        data: { questions: [], added: 0, reason: "max_length_reached", askedCount, max: MAX_SESSION_QUESTIONS },
      });
    }

    const lessonScopeSkillIds = Array.isArray(session.roadmap?.skillIds)
      ? session.roadmap.skillIds.filter(Boolean)
      : undefined;

    // Over-fetch, then drop anything already asked, then trim to toAdd.
    const pool = await getSessionQuestions(session.userId, toAdd + askedCount, {
      persistExposure: false,
      lessonId: session.roadmap?.lessonId || undefined,
      lessonTitle: session.roadmap?.lessonTitle || undefined,
      lessonSkillIds: lessonScopeSkillIds,
    });
    const fresh = pool.filter((q) => !askedIds.has(String(q.questionId))).slice(0, toAdd);

    session.roadmap.plannedQuestionCount = Math.min(
      MAX_SESSION_QUESTIONS,
      (session.roadmap.plannedQuestionCount || askedCount) + fresh.length
    );
    await session.save();

    return res.status(200).json({
      success: true,
      data: {
        questions: fresh,
        added: fresh.length,
        askedCount,
        plannedQuestionCount: session.roadmap.plannedQuestionCount,
        max: MAX_SESSION_QUESTIONS,
      },
    });
  } catch (error) {
    console.log("❌ Error extending session:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

const clampExtendCount = (n) => Math.max(1, Math.min(3, Math.round(n)));

export const getQuestionAnswer = async (req, res) => {
  const { questionId } = req.params;

  if (!questionId) {
    return res.status(400).json({ success: false, message: "Question id is required" });
  }

  try {
    let question = null;

    question = await Question.findOne({ questionId }).lean();

    if (mongoose.Types.ObjectId.isValid(questionId)) {
      question = question || await Question.findById(questionId).lean();
    }

    if (!question && isLocalQuestionFallbackEnabled()) {
      question = mockQuestions.find((q) => String(q.questionId || q._id) === questionId);
    }

    if (!question) {
      return res.status(404).json({ success: false, message: "Question not found" });
    }

    return res.status(200).json({
      success: true,
      data: {
        questionId: question.questionId || String(question._id),
        correctAnswer: question.correctAnswer,
      },
    });
  } catch (error) {
    console.log("error in fetching question answer:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const submitAnswer = async (req, res) => {
  const { id } = req.params;
  const { questionId, userAnswer } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ success: false, message: "Invalid Session Id" });
  }

  if (!questionId || !userAnswer) {
    return res.status(400).json({ success: false, message: "Please provide questionId and userAnswer" });
  }

  try {
    const session = await Session.findById(id);
    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    // ===== HYBRID QUESTION LOOKUP =====
    // Try DB first, then fallback to local seed data during migration.
    let question = null;

    question = await Question.findOne({ questionId });

    if (mongoose.Types.ObjectId.isValid(questionId)) {
      question = question || await Question.findById(questionId);
    }
    
    if (!question && isLocalQuestionFallbackEnabled()) {
      question = mockQuestions.find((q) => String(q.questionId || q._id) === questionId);
    }
    
    if (!question) {
      return res.status(400).json({ success: false, message: "Question not found" });
    }

    const skill = getQuestionSkill(question);

    const isCorrect =
      userAnswer.toLowerCase().trim() ===
      question.correctAnswer.toLowerCase().trim();

    console.log(`✅ Answer received - Question: ${question.topic}/${question.subtopic}, Correct: ${isCorrect}`);

    // ✅ SINGLE SOURCE OF TRUTH
    const attemptDoc = await Attempt.create({
      userId: session.userId,
      sessionId: session._id,
      questionId: question.questionId || String(question._id),
      userAnswer,
      correctAnswer: question.correctAnswer,
      isCorrect,
      topic: question.topic,
      subtopic: question.subtopic || "unknown",
      skillId: skill.skillId,
      skillName: skill.skillName,
      skillPath: skill.skillPath,
      prerequisiteSkillIds: skill.prerequisiteSkillIds,
      jlptLevel: skill.jlptLevel,
      difficulty: question.difficulty,
      tags: question.tags,
      learningObjective: question.learningObjective,
      commonMistakes: question.commonMistakes,
    });

    await updateKnowledgeCoverage({
      userId: session.userId,
      topic: question.topic,
      subtopic: question.subtopic || "unknown",
      skillId: skill.skillId,
      skillName: skill.skillName,
      skillPath: skill.skillPath,
      prerequisiteSkillIds: skill.prerequisiteSkillIds,
      jlptLevel: skill.jlptLevel,
    });

    console.log("ATTEMPT SAVED:", {
      sessionId: session._id.toString(),
      questionId: String(question.questionId || question._id),
      attemptId: attemptDoc._id.toString(),
      topic: question.topic,
      subtopic: question.subtopic || "unknown",
      difficulty: question.difficulty,
      isCorrect,
    });
    console.log("📚 Saved attempt difficulty:", question.difficulty);

    // ✅ Update spaced repetition memory
    await updateMemoryAfterAttempt({
      userId: session.userId,
      topic: question.topic,
      subtopic: question.subtopic || "unknown",
      skillId: skill.skillId,
      skillName: skill.skillName,
      skillPath: skill.skillPath,
      prerequisiteSkillIds: skill.prerequisiteSkillIds,
      jlptLevel: skill.jlptLevel,
      isCorrect,
    });

    console.log(`✅ Memory updated`);

    await updateSkillStateAfterAttempt({ attempt: attemptDoc });
    const reviewTask = await createOrUpdateMistakeTask({ attempt: attemptDoc });
    if (reviewTask) {
      console.log("🧩 ReviewTask created/updated from mistake:", {
        taskId: reviewTask._id.toString(),
        skillId: reviewTask.skillId,
        type: reviewTask.type,
        priority: reviewTask.priority,
      });
    }

    // ✅ Skill is now derived aggregation - NOT updated here

    return res.status(200).json({
      success: true,
      data: {
        isCorrect,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation || null,
      },
    });
  } catch (error) {
    console.log("❌ Error in submitting answer:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const completeSession = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ success: false, message: "Invalid Session Id" });
  }

  try {
    const session = await Session.findById(id);
    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    // ✅ SINGLE SOURCE OF TRUTH
    const attempts = await Attempt.find({ sessionId: id }).sort({ createdAt: 1 });
    const reviewQueueBefore = await getReviewDebugQueue(session.userId);

    console.log("SESSION COMPLETE - attempt count:", attempts.length);
    console.log("🧠 Review queue before completeSession:", {
      length: reviewQueueBefore.length,
      items: reviewQueueBefore,
    });
    console.log("🎯 completeSession review target:", {
      mode: session.roadmap?.mode,
      targetSkillIds: session.roadmap?.skillIds || [],
      targetTitle: session.roadmap?.lessonTitle || "",
    });
    console.log("📝 completeSession answered skills:", summarizeAttemptsBySkill(attempts));
    console.log(
      "ATTEMPT SAMPLE:",
      attempts.slice(0, 3).map((attempt) => ({
        questionId: attempt.questionId,
        topic: attempt.topic,
        subtopic: attempt.subtopic,
        difficulty: attempt.difficulty,
        isCorrect: attempt.isCorrect,
      }))
    );

    const total = attempts.length;
    const correct = attempts.filter((a) => a.isCorrect).length;
    const percentage =
      total > 0 ? Math.round((correct / total) * 100) : 0;

    const score = { correct, total, percentage };

    // ✅ ANALYSIS BASED ON ATTEMPTS ONLY
    const analysis = analyzeSession({ answers: attempts });

    const aiInput = {
      ...analysis,
      score,
      answers: attempts,
    };

    const aiFeedback = await generateLearningFeedback(aiInput);

    console.log(`👤 Active userId: ${session.userId}`);
    console.log(`📊 User attempts loaded: ${attempts.length}`);

    // ✅ UPDATE SKILL AGGREGATIONS FROM ATTEMPTS
    // Group attempts by canonical skill when available, with topic + subtopic as legacy fallback.
    const skillGroups = {};
    for (const attempt of attempts) {
      const canonicalSkill = getQuestionSkill(attempt);
      const key = attempt.skillId || canonicalSkill.skillId || getLearningKey(attempt);
      if (!skillGroups[key]) {
        skillGroups[key] = {
          topic: attempt.topic,
          subtopic: attempt.subtopic || "unknown",
          skillId: attempt.skillId || canonicalSkill.skillId,
          skillName: attempt.skillName || canonicalSkill.skillName,
          skillPath: attempt.skillPath || canonicalSkill.skillPath,
          prerequisiteSkillIds: attempt.prerequisiteSkillIds || canonicalSkill.prerequisiteSkillIds,
          jlptLevel: attempt.jlptLevel || canonicalSkill.jlptLevel,
          attempts: [],
        };
      }
      skillGroups[key].attempts.push(attempt);
    }

    // Prepare bulk write operations for Skills
    const skillBulkOps = [];
    for (const groupedSkill of Object.values(skillGroups)) {
      const {
        topic,
        subtopic,
        skillId,
        skillName,
        skillPath,
        prerequisiteSkillIds,
        jlptLevel,
        attempts: groupedAttempts,
      } = groupedSkill;
      const attemptCount = groupedAttempts.length;
      const correctCount = groupedAttempts.filter((a) => a.isCorrect).length;
      // Ensure mastery is always between 0 and 1
      const mastery = Math.max(0, Math.min(1, correctCount / attemptCount));
      const filter = skillId
        ? { userId: session.userId, $or: [{ skillId }, { topic, subtopic }] }
        : { userId: session.userId, topic, subtopic };

      skillBulkOps.push({
        updateOne: {
          filter,
          update: {
            $set: {
              userId: session.userId,
              topic,
              subtopic,
              skillId,
              skillName,
              skillPath,
              prerequisiteSkillIds,
              jlptLevel,
              attempts: attemptCount,
              correct: correctCount,
              mastery,
              lastUpdated: new Date(),
            },
          },
          upsert: true,
        },
      });
    }

    // Execute bulk write if there are skills to update
    if (skillBulkOps.length > 0) {
      await Skill.bulkWrite(skillBulkOps);
      console.log("SKILL GROUPS:", Object.keys(skillGroups));
    } else {
      console.log("SKILL GROUPS: none");
    }

    await syncKnowledgeCoverageMastery(session.userId);

    const reviewRefreshResults = await refreshReviewTargets({ session, attempts });
    const reviewTaskResults = await completeReviewTasksForSession({ session, attempts });
    const reviewCompletionSummary = ["review", "daily_review"].includes(session.roadmap?.mode)
      ? buildReviewCompletionSummary(reviewTaskResults)
      : null;
    await syncDueMemoryTasks(session.userId);
    const reviewQueueAfterRefresh = await getReviewDebugQueue(session.userId);
    console.log("🧠 Review queue after refreshReviewTargets:", {
      length: reviewQueueAfterRefresh.length,
      items: reviewQueueAfterRefresh,
    });

		// ==========================================
		// 📊 GENERATE SESSION ANALYTICS
		// ==========================================

		// Load user memories
		const memories = await Memory.find({
			userId: session.userId,
		});

		// Load user skills
		const skills = await Skill.find({
			userId: session.userId,
		});

		// Load previous sessions (last 5 completed)
		const previousSessions = await Session.find({
			userId: session.userId,
			status: "completed",
		})
			.sort({ completedAt: -1 })
			.limit(5);

		console.log("📌 Generating session analytics for sessionId:", session._id.toString());
		console.log("📌 Loaded attempts for analytics:", attempts.length);
		if (["review", "daily_review"].includes(session.roadmap?.mode)) {
			console.log("🎯 Completed review session analysis:", {
				targetSkillIds: session.roadmap.skillIds,
				score,
				reviewRefreshResults,
				reviewTaskResults,
			});
		}
		const analytics = generateSessionAnalytics({
			attempts,
			skills,
			memories,
			previousSessions,
		});
		console.log("📌 Analytics payload generated:", {
			accuracyTrend: analytics.accuracyTrend,
			weakTopics: analytics.weakTopics,
			strongTopics: analytics.strongTopics,
			recommendationEffectiveness:
				analytics.recommendationEffectiveness,
		});

		// ❌ IMPORTANT: DO NOT STORE DERIVED DATA (score/analysis)
		// Only store completion state and analytics

		session.status = "completed";
		session.completedAt = new Date();
		session.score = score; // ✅ SAVE SCORE FOR ANALYTICS
		session.analysis = {
			...analysis,
			aiFeedback,
		}; // ✅ Persist analysis summary to session document
		session.analytics = analytics;
		if (reviewCompletionSummary) {
			session.roadmap.reviewCompletionSummary = reviewCompletionSummary;
		}

		const savedSession = await session.save();
		console.log("✅ Session saved with analytics for sessionId:", savedSession._id.toString());
		console.log(	"✅ Stored analytics keys:", Object.keys(savedSession.analytics || {}));

		return res.status(200).json({
			success: true,
			data: {
				...buildSessionReportPayload({ session: savedSession, attempts }),
				reviewRefreshResults,
				reviewTaskResults,
				reviewCompletionSummary,
			},
		});
	} catch (error) {
		console.log("error in completing session:", error.message);
		res.status(500).json({ success: false, message: "Server Error" });
	}
};

export const getSessionReport = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ success: false, message: "Invalid Session Id" });
  }

  try {
    const session = await Session.findById(id);
    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    if (session.status !== "completed") {
      return res.status(400).json({ success: false, message: "Session is not completed yet" });
    }

    const attempts = await Attempt.find({ sessionId: id }).sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      data: buildSessionReportPayload({ session, attempts }),
    });
  } catch (error) {
    console.log("error in fetching session report:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

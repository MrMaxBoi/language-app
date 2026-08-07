import mongoose from "mongoose";
import Memory from "../models/memory.model.js";
import ReviewTask from "../models/reviewTask.model.js";

const TYPE_LABELS = {
  mistake: "Mistake",
  memory_due: "Memory due",
  weak_skill: "Weak topic",
};

const DEFAULT_CLEAR_CONDITION = {
  requiredCorrect: 2,
  requiredAttempts: 2,
};

const clampPriority = (value) => Math.max(1, Math.min(10, Number(value) || 1));

export const serializeReviewTask = (task = {}) => ({
  id: String(task._id),
  userId: task.userId,
  skillId: task.skillId,
  skillName: task.skillName || "Review topic",
  skillPath: task.skillPath || [],
  type: task.type,
  typeLabel: TYPE_LABELS[task.type] || "Review",
  reason: task.reason || "Kokoro marked this for review.",
  status: task.status,
  priority: Number(task.priority) || 1,
  dueAt: task.dueAt,
  completedAt: task.completedAt || null,
  clearCondition: task.clearCondition || DEFAULT_CLEAR_CONDITION,
  progress: task.progress || { correct: 0, attempts: 0 },
  source: task.source || {},
  lastPracticedAt: task.lastPracticedAt || null,
});

export const createOrUpdateMistakeTask = async ({ attempt }) => {
  if (!attempt?.userId || !attempt?.skillId || attempt.isCorrect) return null;

  const existing = await ReviewTask.findOne({
    userId: attempt.userId,
    skillId: attempt.skillId,
    type: "mistake",
    status: "active",
  });

  const update = {
    $set: {
      userId: attempt.userId,
      skillId: attempt.skillId,
      skillName: attempt.skillName || attempt.subtopic || attempt.topic || "Review topic",
      skillPath: attempt.skillPath || [],
      type: "mistake",
      reason: "You missed this in your last lesson.",
      status: "active",
      dueAt: new Date(),
      source: {
        attemptId: attempt._id,
        sessionId: attempt.sessionId,
      },
      clearCondition: DEFAULT_CLEAR_CONDITION,
      lastPracticedAt: attempt.createdAt || new Date(),
    },
    $setOnInsert: {
      progress: { correct: 0, attempts: 0 },
    },
    $inc: {
      priority: existing ? 1 : 3,
    },
  };

  const task = await ReviewTask.findOneAndUpdate(
    {
      userId: attempt.userId,
      skillId: attempt.skillId,
      type: "mistake",
      status: "active",
    },
    update,
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  if (task.priority > 10) {
    task.priority = 10;
    await task.save();
  }

  return task;
};

export const syncDueMemoryTasks = async (userId = "guest") => {
  const now = new Date();
  const memories = await Memory.find({
    userId,
    skillId: { $exists: true, $ne: null },
    $or: [
      { nextReviewDate: { $lte: now } },
      { strength: { $lt: 0.45 } },
    ],
  }).lean();

  const updatedTasks = [];

  for (const memory of memories) {
    const strength = Number(memory.strength) || 0;
    const isOverdue = memory.nextReviewDate && new Date(memory.nextReviewDate) <= now;
    const reason = isOverdue
      ? "This memory is due for a quick refresh."
      : "This topic is starting to fade.";

    const task = await ReviewTask.findOneAndUpdate(
      {
        userId,
        skillId: memory.skillId,
        type: "memory_due",
        status: "active",
      },
      {
        $set: {
          userId,
          skillId: memory.skillId,
          skillName: memory.skillName || memory.subtopic || memory.topic || "Review topic",
          skillPath: memory.skillPath || [],
          type: "memory_due",
          reason,
          status: "active",
          dueAt: memory.nextReviewDate || now,
          source: { memoryId: memory._id },
          clearCondition: DEFAULT_CLEAR_CONDITION,
        },
        $max: {
          priority: isOverdue ? 5 : clampPriority(Math.round((1 - strength) * 5)),
        },
        $setOnInsert: {
          progress: { correct: 0, attempts: 0 },
        },
      },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    updatedTasks.push(task);
  }

  return updatedTasks;
};

export const getActiveReviewTasks = async (userId = "guest", { syncMemory = true } = {}) => {
  if (syncMemory) {
    await syncDueMemoryTasks(userId);
  }

  const tasks = await ReviewTask.find({ userId, status: "active" })
    .sort({ priority: -1, dueAt: 1, updatedAt: -1 })
    .lean();

  return tasks.map(serializeReviewTask);
};

export const completeReviewTasksForSession = async ({ session, attempts = [] }) => {
  if (!["review", "daily_review"].includes(session.roadmap?.mode)) return [];

  const taskIds = Array.isArray(session.roadmap?.reviewTaskIds)
    ? session.roadmap.reviewTaskIds.filter((id) => mongoose.Types.ObjectId.isValid(id))
    : [];
  const targetSkillIds = new Set((session.roadmap?.skillIds || []).filter(Boolean));
  if (!taskIds.length && !targetSkillIds.size) return [];
  const targetTasks = await ReviewTask.find({
    userId: session.userId,
    status: "active",
    $or: [
      ...(taskIds.length ? [{ _id: { $in: taskIds } }] : []),
      ...(targetSkillIds.size ? [{ skillId: { $in: [...targetSkillIds] } }] : []),
    ],
  });

  const results = [];

  for (const task of targetTasks) {
    const taskAttempts = attempts.filter((attempt) => attempt.skillId === task.skillId);
    const correct = taskAttempts.filter((attempt) => attempt.isCorrect).length;
    const total = taskAttempts.length;
    const requiredCorrect = task.clearCondition?.requiredCorrect || DEFAULT_CLEAR_CONDITION.requiredCorrect;
    const requiredAttempts = task.clearCondition?.requiredAttempts || DEFAULT_CLEAR_CONDITION.requiredAttempts;
    const cleared = correct >= requiredCorrect && total >= requiredAttempts;

    task.progress = { correct, attempts: total };
    task.lastPracticedAt = new Date();

    if (cleared) {
      task.status = "completed";
      task.completedAt = new Date();
      task.priority = 1;
    } else {
      task.priority = clampPriority((task.priority || 1) + 1);
    }

    await task.save();

    results.push({
      taskId: String(task._id),
      skillId: task.skillId,
      skillName: task.skillName,
      correct,
      total,
      requiredCorrect,
      requiredAttempts,
      cleared,
      status: task.status,
    });

    console.log("ReviewTask completion evaluation:", results[results.length - 1]);
  }

  return results;
};

export const buildReviewCompletionSummary = (results = []) => {
  const clearedTasks = results.filter((result) => result.cleared);
  const remainingTasks = results.filter((result) => !result.cleared);

  return {
    tasksIncluded: results.length,
    tasksCleared: clearedTasks.length,
    tasksRemaining: remainingTasks.length,
    clearedTasks,
    remainingTasks,
    refreshedSkills: [...new Set(clearedTasks.map((task) => task.skillName).filter(Boolean))],
  };
};

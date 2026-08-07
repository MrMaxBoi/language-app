import Attempt from "../models/attempt.model.js";
import SkillState from "../models/skillState.model.js";

const RECENT_ATTEMPT_LIMIT = 20;

const clamp01 = (value) => Math.max(0, Math.min(1, Number(value) || 0));

const getSkillStatus = ({ attempts, mastery, recentAccuracy, lastIncorrectAt, lastCorrectAt }) => {
  if (!attempts) return "new";
  if (mastery >= 0.9 && attempts >= 8) return "mastered";
  if (mastery >= 0.75 && recentAccuracy >= 0.7) return "comfortable";
  if (lastIncorrectAt && (!lastCorrectAt || new Date(lastIncorrectAt) > new Date(lastCorrectAt))) {
    return "reviewing";
  }
  if (mastery < 0.55 || recentAccuracy < 0.6) return "reviewing";
  return "learning";
};

export const updateSkillStateAfterAttempt = async ({ attempt }) => {
  if (!attempt?.userId || !attempt?.skillId) return null;

  const recentAttempts = await Attempt.find({
    userId: attempt.userId,
    skillId: attempt.skillId,
  })
    .sort({ createdAt: -1 })
    .limit(RECENT_ATTEMPT_LIMIT)
    .lean();

  const attempts = await Attempt.countDocuments({
    userId: attempt.userId,
    skillId: attempt.skillId,
  });
  const correct = await Attempt.countDocuments({
    userId: attempt.userId,
    skillId: attempt.skillId,
    isCorrect: true,
  });

  const recentCorrect = recentAttempts.filter((item) => item.isCorrect).length;
  const mastery = attempts > 0 ? correct / attempts : 0;
  const recentAccuracy = recentAttempts.length ? recentCorrect / recentAttempts.length : mastery;
  const lastCorrect = recentAttempts.find((item) => item.isCorrect);
  const lastIncorrect = recentAttempts.find((item) => !item.isCorrect);
  const now = new Date();

  const payload = {
    userId: attempt.userId,
    skillId: attempt.skillId,
    skillName: attempt.skillName || attempt.subtopic || attempt.topic || "Japanese skill",
    skillPath: attempt.skillPath || [],
    topic: attempt.topic || "Skill",
    subtopic: attempt.subtopic || "unknown",
    mastery: clamp01(mastery),
    recentAccuracy: clamp01(recentAccuracy),
    attempts,
    correct,
    lastPracticedAt: attempt.createdAt || now,
    lastCorrectAt: lastCorrect?.createdAt || null,
    lastIncorrectAt: lastIncorrect?.createdAt || null,
    sourceUpdatedAt: now,
  };

  payload.status = getSkillStatus(payload);

  return SkillState.findOneAndUpdate(
    { userId: attempt.userId, skillId: attempt.skillId },
    { $set: payload },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
};

export const getSkillStateMap = async (userId) => {
  const states = await SkillState.find({ userId }).lean();
  return states.reduce((lookup, state) => {
    lookup[state.skillId] = state;
    return lookup;
  }, {});
};

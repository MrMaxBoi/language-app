import { getSessionQuestions, persistQuestionExposure } from "./questionSelection.service.js";
import { getActiveReviewTasks } from "./reviewTask.service.js";

const MIN_DAILY_REVIEW_QUESTIONS = 10;
const MAX_DAILY_REVIEW_QUESTIONS = 30;
const SECONDS_PER_QUESTION = 35;

const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value));

const getTaskTimestamp = (task) => {
  const value = task.dueAt || task.updatedAt || task.createdAt;
  return value ? new Date(value).getTime() : Number.MAX_SAFE_INTEGER;
};

const sortReviewTasks = (tasks = []) => [...tasks].sort((a, b) => {
  const priorityDifference = (Number(b.priority) || 0) - (Number(a.priority) || 0);
  if (priorityDifference !== 0) return priorityDifference;

  const now = Date.now();
  const aOverdue = getTaskTimestamp(a) <= now;
  const bOverdue = getTaskTimestamp(b) <= now;
  if (aOverdue !== bOverdue) return aOverdue ? -1 : 1;

  if (a.type !== b.type) {
    if (a.type === "mistake") return -1;
    if (b.type === "mistake") return 1;
  }

  return getTaskTimestamp(a) - getTaskTimestamp(b);
});

export const getDailyReviewQuestionCount = (taskCount, settings = {}) => {
  if (taskCount <= 0) return 0;

  let suggestedCount = taskCount === 1
    ? 8
    : taskCount <= 3
      ? MIN_DAILY_REVIEW_QUESTIONS
      : taskCount <= 7
        ? 15
        : taskCount <= 12
          ? 20
          : taskCount >= 20
            ? MAX_DAILY_REVIEW_QUESTIONS
            : 25;

  if (Number(settings.targetMinutes) > 0) {
    suggestedCount = Math.round((Number(settings.targetMinutes) * 60) / SECONDS_PER_QUESTION);
  }

  const requestedMaximum = Number(settings.maxQuestions) > 0
    ? clamp(Math.round(Number(settings.maxQuestions)), 5, MAX_DAILY_REVIEW_QUESTIONS)
    : MAX_DAILY_REVIEW_QUESTIONS;

  return clamp(suggestedCount, taskCount === 1 ? 5 : MIN_DAILY_REVIEW_QUESTIONS, requestedMaximum);
};

export const estimateDailyReviewMinutes = (questionCount) =>
  questionCount > 0 ? Math.max(1, Math.ceil((questionCount * SECONDS_PER_QUESTION) / 60)) : 0;

const mergeTasksBySkill = (tasks = []) => {
  const groups = new Map();

  for (const task of tasks) {
    if (!task.skillId) continue;
    if (!groups.has(task.skillId)) {
      groups.set(task.skillId, {
        skillId: task.skillId,
        skillName: task.skillName,
        priority: Number(task.priority) || 1,
        weight: 0,
        dueAt: task.dueAt,
        taskIds: [],
        types: [],
      });
    }

    const group = groups.get(task.skillId);
    group.taskIds.push(task.id);
    group.weight += Number(task.priority) || 1;
    if (!group.types.includes(task.type)) group.types.push(task.type);
    group.priority = Math.max(group.priority, Number(task.priority) || 1);
    if (getTaskTimestamp(task) < getTaskTimestamp(group)) group.dueAt = task.dueAt;
  }

  return [...groups.values()];
};

const buildSummary = (tasks = [], mergedSkills = []) => ({
  totalTasks: tasks.length,
  mistakeTasks: tasks.filter((task) => task.type === "mistake").length,
  memoryDueTasks: tasks.filter((task) => task.type === "memory_due").length,
  weakSkillTasks: tasks.filter((task) => task.type === "weak_skill").length,
  uniqueSkills: mergedSkills.length,
});

export const getDailyReviewPreview = async (userId = "guest", settings = {}) => {
  const sourceTasks = settings.activeReviewTasks || await getActiveReviewTasks(userId);
  const allowedTypes = Array.isArray(settings.includeTypes) && settings.includeTypes.length
    ? new Set(settings.includeTypes)
    : null;
  const allowedTaskIds = Array.isArray(settings.taskIds) && settings.taskIds.length
    ? new Set(settings.taskIds.map(String))
    : null;
  const selectedTasks = sortReviewTasks(sourceTasks).filter((task) =>
    task.status === "active" &&
    (!allowedTypes || allowedTypes.has(task.type)) &&
    (!allowedTaskIds || allowedTaskIds.has(String(task.id)))
  );
  const mergedSkills = mergeTasksBySkill(selectedTasks);
  const requestedQuestionCount = getDailyReviewQuestionCount(selectedTasks.length, settings);

  return {
    mode: "daily_review",
    taskIds: selectedTasks.map((task) => task.id),
    skillIds: mergedSkills.map((skill) => skill.skillId),
    requestedQuestionCount,
    estimatedMinutes: estimateDailyReviewMinutes(requestedQuestionCount),
    summary: buildSummary(selectedTasks, mergedSkills),
    tasks: selectedTasks,
    mergedSkills,
  };
};

export const buildDailyReviewSession = async (userId = "guest", settings = {}) => {
  const preview = await getDailyReviewPreview(userId, settings);
  if (!preview.taskIds.length) {
    return { ...preview, questionCount: 0, questions: [], summary: { ...preview.summary, shortfall: 0 } };
  }

  const scopedQuestions = await getSessionQuestions(userId, preview.requestedQuestionCount, {
    persistExposure: false,
    exposureAware: true,
    lessonTitle: "Today's Review",
    lessonSkillIds: preview.skillIds,
  });
  let questions = scopedQuestions;
  const selectedIds = new Set(questions.map((question) => String(question.questionId || question._id)));
  const getCoverageCounts = () => questions.reduce((counts, question) => {
    if (question.skillId) counts[question.skillId] = (counts[question.skillId] || 0) + 1;
    return counts;
  }, {});
  const initiallyCovered = new Set(questions.map((question) => question.skillId).filter(Boolean));
  const missingSkillIds = preview.skillIds.filter((skillId) => !initiallyCovered.has(skillId));

  for (const skillId of missingSkillIds) {
    const [coverageQuestion] = await getSessionQuestions(userId, 1, {
      persistExposure: false,
      exposureAware: true,
      lessonTitle: "Today's Review",
      lessonSkillIds: [skillId],
    });
    if (!coverageQuestion) continue;

    const questionId = String(coverageQuestion.questionId || coverageQuestion._id);
    if (selectedIds.has(questionId)) continue;

    if (questions.length < preview.requestedQuestionCount) {
      questions.push(coverageQuestion);
    } else {
      const coverageCounts = getCoverageCounts();
      const replaceIndex = questions.findLastIndex((question) =>
        !preview.skillIds.includes(question.skillId) || (coverageCounts[question.skillId] || 0) > 1
      );
      if (replaceIndex < 0) continue;
      selectedIds.delete(String(questions[replaceIndex].questionId || questions[replaceIndex]._id));
      questions[replaceIndex] = coverageQuestion;
    }
    selectedIds.add(questionId);
  }

  if (questions.length < preview.requestedQuestionCount) {
    const adaptiveFallback = await getSessionQuestions(
      userId,
      preview.requestedQuestionCount - questions.length,
      { persistExposure: false, exposureAware: true }
    );
    questions = [
      ...questions,
      ...adaptiveFallback.filter((question) => {
        const id = String(question.questionId || question._id);
        if (selectedIds.has(id)) return false;
        selectedIds.add(id);
        return true;
      }),
    ].slice(0, preview.requestedQuestionCount);
  }

  const coveredSkillIds = [...new Set(questions.map((question) => question.skillId).filter(Boolean))];
  const uncoveredSkillIds = preview.skillIds.filter((skillId) => !coveredSkillIds.includes(skillId));
  const shortfall = Math.max(0, preview.requestedQuestionCount - questions.length);

  await persistQuestionExposure(userId, questions);

  console.log("DailyReviewBuilder selected tasks:", preview.tasks.map((task) => ({
    taskId: task.id,
    skillId: task.skillId,
    type: task.type,
    priority: task.priority,
  })));
  console.log("DailyReviewBuilder skill coverage:", { coveredSkillIds, uncoveredSkillIds });
  console.log("DailyReviewBuilder question count:", {
    requested: preview.requestedQuestionCount,
    selected: questions.length,
    shortfall,
  });

  return {
    mode: preview.mode,
    taskIds: preview.taskIds,
    skillIds: preview.skillIds,
    questionCount: questions.length,
    requestedQuestionCount: preview.requestedQuestionCount,
    estimatedMinutes: estimateDailyReviewMinutes(questions.length),
    summary: { ...preview.summary, shortfall, uncoveredSkillIds },
    questions,
  };
};

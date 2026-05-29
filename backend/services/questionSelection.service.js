import Question from "../models/question.model.js";
import mockQuestions from "../data/questions.js";

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
  return {
    _id: sourceQuestion._id,
    questionText: sourceQuestion.questionText,
    correctAnswer: sourceQuestion.correctAnswer,
    topic: sourceQuestion.topic,
    subtopic: sourceQuestion.subtopic,
    difficulty: normalizeDifficulty(sourceQuestion.difficulty),
    tags: Array.isArray(sourceQuestion.tags) ? sourceQuestion.tags : [],
    explanation: sourceQuestion.explanation || "",
  };
};

const getUniqueQuestions = (questions) => {
  const seen = new Set();
  const unique = [];

  for (const question of questions) {
    const id = question._id.toString();
    if (!seen.has(id)) {
      seen.add(id);
      unique.push(question);
    }
  }

  return unique;
};

export const getSessionQuestions = async (userId, count = 5) => {
  const targetDistribution = {
    easy: 2,
    medium: 2,
    hard: 1,
  };

  try {
    const dbQuestions = await Question.find({}).lean();
    const fallbackQuestions = mockQuestions;

    const allQuestions = [];
    const seenIds = new Set();

    for (const question of dbQuestions) {
      const normalized = buildQuestionFromSource(question);
      const id = normalized._id.toString();
      if (!seenIds.has(id)) {
        seenIds.add(id);
        allQuestions.push(normalized);
      }
    }

    for (const question of fallbackQuestions) {
      const normalized = buildQuestionFromSource(question);
      const id = normalized._id.toString();
      if (!seenIds.has(id)) {
        seenIds.add(id);
        allQuestions.push(normalized);
      }
    }

    const difficultyBuckets = {
      easy: [],
      medium: [],
      hard: [],
    };

    for (const question of allQuestions) {
      const difficulty = normalizeDifficulty(question.difficulty);
      difficultyBuckets[difficulty].push(question);
    }

    const selected = [];
    const selectedIds = new Set();
    const topicCounts = {};

    const canAddQuestion = (question, allowTopicOverflow = false) => {
      const topicCount = topicCounts[question.topic] || 0;
      return (
        !selectedIds.has(question._id.toString()) &&
        (allowTopicOverflow || topicCount < 2)
      );
    };

    const addQuestion = (question) => {
      selected.push(question);
      selectedIds.add(question._id.toString());
      topicCounts[question.topic] = (topicCounts[question.topic] || 0) + 1;
    };

    const pickFromBucket = (bucket, target, allowTopicOverflow = false) => {
      let added = 0;
      for (const question of bucket) {
        if (selected.length >= count) break;
        if (added >= target) break;

        if (canAddQuestion(question, allowTopicOverflow)) {
          addQuestion(question);
          added += 1;
        }
      }
    };

    for (const difficulty of ["easy", "medium", "hard"]) {
      pickFromBucket(difficultyBuckets[difficulty], targetDistribution[difficulty]);
    }

    if (selected.length < count) {
      for (const question of allQuestions) {
        if (selected.length >= count) break;
        if (canAddQuestion(question)) {
          addQuestion(question);
        }
      }
    }

    if (selected.length < count) {
      for (const question of allQuestions) {
        if (selected.length >= count) break;
        if (!selectedIds.has(question._id.toString())) {
          addQuestion(question);
        }
      }
    }

    const easyCount = selected.filter((q) => q.difficulty === "easy").length;
    const mediumCount = selected.filter((q) => q.difficulty === "medium").length;
    const hardCount = selected.filter((q) => q.difficulty === "hard").length;

    const topicMap = selected.reduce((map, q) => {
      map[q.topic] = (map[q.topic] || 0) + 1;
      return map;
    }, {});

    console.log("📊 Session Questions Generated");
    console.log("Easy:", easyCount);
    console.log("Medium:", mediumCount);
    console.log("Hard:", hardCount);
    console.log("Topics:", topicMap);
    console.log(`✅ Returning ${selected.length} questions for userId: ${userId}`);

    if (selected.length === 0) {
      console.log("⚠️ No questions available after selection logic, falling back to mock questions.");
      return fallbackQuestions.slice(0, count).map(buildQuestionFromSource);
    }

    return selected.slice(0, count);
  } catch (error) {
    console.error("❌ Error in getSessionQuestions:", error.message);
    console.log("⚠️ Falling back to mock questions for session generation.");
    return mockQuestions.slice(0, count).map(buildQuestionFromSource);
  }
};

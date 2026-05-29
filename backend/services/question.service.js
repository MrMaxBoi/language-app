import Question from "../models/question.model.js";
import Skill from "../models/skill.model.js";
import Memory from "../models/memory.model.js";
import Attempt from "../models/attempt.model.js";
import mockQuestions from "../data/questions.js";

export const getAdaptiveQuestions = async (userId = "guest") => {
  try {
    console.log(`👤 Active userId: ${userId}`);

    // ===== RECENT ATTEMPTS FOR SCORING =====
    // Track recent 30 attempts for novelty detection
    const allRecentAttempts = await Attempt.find({ userId })
      .sort({ createdAt: -1 })
      .limit(30);

    const recentAttemptedQuestionIds = new Set(
      allRecentAttempts.map((a) => a.questionId.toString())
    );

    // ===== DIFFICULTY-AWARE SELECTION =====
    // STEP 1: Track user recent accuracy (first 20)
    const recentAttempts = allRecentAttempts.slice(0, 20);

    // STEP 2: Calculate recent accuracy
    let recentAccuracy = 0.5; // Default middle ground
    if (recentAttempts.length > 0) {
      const correctCount = recentAttempts.filter((a) => a.isCorrect).length;
      recentAccuracy = correctCount / recentAttempts.length;
    }

    // STEP 3: Define target difficulty based on accuracy
    let difficultyPriority = [];
    if (recentAccuracy > 0.8) {
      // High accuracy: challenge learner
      difficultyPriority = ["hard", "medium", "easy"];
    } else if (recentAccuracy >= 0.5) {
      // Medium accuracy: balanced approach
      difficultyPriority = ["medium", "easy", "hard"];
    } else {
      // Low accuracy: focus on easy questions
      difficultyPriority = ["easy", "medium", "hard"];
    }

    console.log(`📈 Recent accuracy: ${(recentAccuracy * 100).toFixed(1)}%`);
    console.log(`🎯 Target difficulty: ${difficultyPriority[0]}`);

    // ===== MEMORY & SKILL PRIORITIZATION =====
    // STEP 1: Load memory documents for user
    const memories = await Memory.find({ userId });

    // STEP 2: Categorize memories
    const now = new Date();
    const overdueReviews = memories.filter((m) => m.nextReviewDate <= now);
    const weakMemories = memories.filter((m) => m.strength < 0.5);

    console.log(`🧠 Overdue reviews: ${overdueReviews.length}`);
    console.log(`🧠 Weak memories: ${weakMemories.length}`);

    // STEP 3: Fetch all Skills for user sorted by mastery ascending (weakest first)
    const skills = await Skill.find({ userId }).sort({ mastery: 1 });

    console.log(`📊 User skills loaded: ${skills.length} skills found`);

    // Categorize skills by mastery
    const weakSkills = skills.filter((s) => s.mastery < 0.6);
    const mediumSkills = skills.filter((s) => s.mastery >= 0.6 && s.mastery < 0.9);
    const strongSkills = skills.filter((s) => s.mastery >= 0.9);

    console.log(
      `📊 Skill breakdown - Weak: ${weakSkills.length}, Medium: ${mediumSkills.length}, Strong: ${strongSkills.length}`
    );

    // ===== RECOMMENDATION SCORING SYSTEM =====
    const candidateQuestions = [];
    const questionIdToScoreFactors = {};

    // STEP 4: Build prioritizedTopics and collect candidate questions with scores
    const prioritizedTopics = [];

    // Add overdue review topics
    for (const memory of overdueReviews) {
      prioritizedTopics.push({
        topic: memory.topic,
        subtopic: memory.subtopic,
        priority: "overdue",
        scoreBonus: 40, // +40 for overdue
      });
    }

    // Add weak memory topics
    for (const memory of weakMemories.filter((m) => !overdueReviews.includes(m))) {
      prioritizedTopics.push({
        topic: memory.topic,
        subtopic: memory.subtopic,
        priority: "weak",
        scoreBonus: 25, // +25 for weak memory
      });
    }

    // Add weak skills
    for (const skill of weakSkills) {
      prioritizedTopics.push({
        topic: skill.topic,
        subtopic: skill.subtopic,
        priority: "skill-weak",
        scoreBonus: 20, // +20 for weak skill
      });
    }

    // Add medium skills
    for (const skill of mediumSkills) {
      prioritizedTopics.push({
        topic: skill.topic,
        subtopic: skill.subtopic,
        priority: "skill-medium",
        scoreBonus: 10, // +10 for medium skill
      });
    }

    // Add strong skills
    for (const skill of strongSkills) {
      prioritizedTopics.push({
        topic: skill.topic,
        subtopic: skill.subtopic,
        priority: "skill-strong",
        scoreBonus: 0, // 0 for strong skill
      });
    }

    // STEP 5: Query and score questions
    for (const topicItem of prioritizedTopics) {
      let questions = await Question.find({
        topic: topicItem.topic,
        subtopic: topicItem.subtopic,
      }).limit(10);

      for (const question of questions) {
        const qId = question._id.toString();

        // Calculate recommendation score
        let score = topicItem.scoreBonus;

        // +15 if difficulty matches target
        if (
          difficultyPriority.indexOf(question.difficulty || "medium") === 0
        ) {
          score += 15;
        }

        // -15 if recently attempted
        if (recentAttemptedQuestionIds.has(qId)) {
          score -= 15;
        }

        // +10 randomness factor (0-10)
        score += Math.floor(Math.random() * 11);

        // Store score temporarily
        question._recommendationScore = score;
        candidateQuestions.push(question);
        questionIdToScoreFactors[qId] = score;
      }
    }

    // STEP 6: Sort by recommendation score (descending)
    candidateQuestions.sort((a, b) => b._recommendationScore - a._recommendationScore);

    // ===== FINAL SELECTION =====
    const questionIds = new Set();
    const selectedQuestions = [];
    const selectedTopics = [];
    const difficultyDistribution = { easy: 0, medium: 0, hard: 0 };
    const selectedScores = [];

    for (const question of candidateQuestions) {
      if (selectedQuestions.length >= 10) break;

      const qId = question._id.toString();

      // Prevent duplicates
      if (!questionIds.has(qId)) {
        questionIds.add(qId);
        selectedQuestions.push(question);
        selectedScores.push(question._recommendationScore);

        // Track difficulty distribution
        const difficulty = question.difficulty || "medium";
        difficultyDistribution[difficulty] = (difficultyDistribution[difficulty] || 0) + 1;
      }
    }

    // ===== LOGGING =====
    const highestScore = selectedScores.length > 0 ? Math.max(...selectedScores) : 0;
    const averageScore =
      selectedScores.length > 0
        ? (selectedScores.reduce((a, b) => a + b, 0) / selectedScores.length).toFixed(1)
        : 0;

    console.log(`🏆 Highest recommendation score: ${highestScore}`);
    console.log(`📊 Average recommendation score: ${averageScore}`);
    console.log(
      `📚 Selected question scores: [${selectedScores.map((s) => s.toFixed(0)).join(", ")}]`
    );
    console.log(
      `📊 Difficulty distribution - Easy: ${difficultyDistribution.easy}, Medium: ${difficultyDistribution.medium}, Hard: ${difficultyDistribution.hard}`
    );

    console.log(`✅ Returning ${selectedQuestions.length} adaptive questions`);

    // ===== FALLBACK: Use mock questions if DB is empty =====
    if (selectedQuestions.length === 0) {
      console.log(`⚠️ No adaptive questions found. Using mock questions from data/questions.js`);
      return mockQuestions.slice(0, 10);
    }

    // Return maximum 10 questions
    return selectedQuestions.slice(0, 10);
  } catch (error) {
    console.error("❌ Error in getAdaptiveQuestions:", error.message);
    // Fallback to mock questions on error
    console.log(`⚠️ Falling back to mock questions...`);
    return mockQuestions.slice(0, 10);
  }
};

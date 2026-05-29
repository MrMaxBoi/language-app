import mongoose from "mongoose";
import Session from "../models/session.model.js";
import Question from "../models/question.model.js";
import { getSessionReport as fetchSessionReport } from "../services/session.service.js";
import { analyzeSession } from "../services/analysis.service.js";
import { generateLearningFeedback } from "../services/ai.service.js";
import { getSessionQuestions } from "../services/questionSelection.service.js";
import { updateMemoryAfterAttempt } from "../services/memory.service.js";
import { generateSessionAnalytics } from "../services/analytics.service.js";
import Attempt from "../models/attempt.model.js";
import Skill from "../models/skill.model.js";
import Memory from "../models/memory.model.js";
import mockQuestions from "../data/questions.js";

export const startSession = async (req, res) => {
  try {
    const newSession = new Session({
      userId: "guest",
    });

    await newSession.save();

    console.log(`👤 Active userId: ${newSession.userId}`);

    // ✅ SESSION QUESTION ENGINE v2
    const questions = await getSessionQuestions(newSession.userId, 5);

    res.status(201).json({
      success: true,
      data: {
        sessionId: newSession._id,
        questions,
      },
    });
  } catch (error) {
    console.log(error);
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
    // Try DB first, then fallback to mock questions
    let question = null;
    
    if (mongoose.Types.ObjectId.isValid(questionId)) {
      // Try to find in DB if it's a valid ObjectId
      question = await Question.findById(questionId);
    }
    
    // Fallback to mock questions
    if (!question) {
      question = mockQuestions.find((q) => q._id === questionId);
    }
    
    if (!question) {
      return res.status(400).json({ success: false, message: "Question not found" });
    }

    const isCorrect =
      userAnswer.toLowerCase().trim() ===
      question.correctAnswer.toLowerCase().trim();

    console.log(`✅ Answer received - Question: ${question.topic}/${question.subtopic}, Correct: ${isCorrect}`);

    // ✅ SINGLE SOURCE OF TRUTH
    const attemptDoc = await Attempt.create({
      userId: session.userId,
      sessionId: session._id,
      questionId: question._id,
      userAnswer,
      correctAnswer: question.correctAnswer,
      isCorrect,
      topic: question.topic,
      subtopic: question.subtopic || "unknown",
      difficulty: question.difficulty,
      tags: question.tags,
      learningObjective: question.learningObjective,
      commonMistakes: question.commonMistakes,
    });

    console.log("ATTEMPT SAVED:", {
      sessionId: session._id.toString(),
      questionId: question._id.toString(),
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
      isCorrect,
    });

    console.log(`✅ Memory updated`);

    // ✅ Skill is now derived aggregation - NOT updated here

    return res.status(200).json({
      success: true,
      data: {
        isCorrect,
        correctAnswer: question.correctAnswer,
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
    const attempts = await Attempt.find({ sessionId: id });

    console.log("SESSION COMPLETE - attempt count:", attempts.length);
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
    // Group attempts by topic + subtopic
    const skillGroups = {};
    for (const attempt of attempts) {
      const key = `${attempt.topic}||${attempt.subtopic}`;
      if (!skillGroups[key]) {
        skillGroups[key] = [];
      }
      skillGroups[key].push(attempt);
    }

    // Prepare bulk write operations for Skills
    const skillBulkOps = [];
    for (const [key, groupedAttempts] of Object.entries(skillGroups)) {
      const [topic, subtopic] = key.split('||');
      const attemptCount = groupedAttempts.length;
      const correctCount = groupedAttempts.filter((a) => a.isCorrect).length;
      // Ensure mastery is always between 0 and 1
      const mastery = Math.max(0, Math.min(1, correctCount / attemptCount));

      skillBulkOps.push({
        updateOne: {
          filter: { userId: session.userId, topic, subtopic },
          update: {
            $set: {
              userId: session.userId,
              topic,
              subtopic,
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
		session.analytics = analytics;

		const savedSession = await session.save();
		console.log("✅ Session saved with analytics for sessionId:", savedSession._id.toString());
		console.log(	"✅ Stored analytics keys:", Object.keys(savedSession.analytics || {}));

		return res.status(200).json({
			success: true,
			data: {
				score,
				analysis: {
					...analysis,
					aiFeedback,
				},
				analytics,
				answers: attempts,
			},
		});
	} catch (error) {
		console.log("error in completing session:", error.message);
		res.status(500).json({ success: false, message: "Server Error" });
	}
};

export const getSessionReport = async (req, res) => {
  res.json({ message: "Not implemented yet" });
};
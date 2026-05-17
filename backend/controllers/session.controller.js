import mongoose from "mongoose";
import Session from "../models/session.model.js";
import questions from "../data/questions.js";
import { getSessionReport as fetchSessionReport } from "../services/session.service.js";
import { analyzeSession } from "../services/analysis.service.js";
import { generateLearningFeedback } from "../services/ai.service.js";

export const startSession = async (req, res) => {
	try {
		const newSession = new Session();
		await newSession.save();
		res.status(201).json({ success: true, data: { sessionId: newSession._id, questions } });
	} catch (error) {
		console.log("error in starting session:", error.message);
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

		// Find the question
		const question = questions.find(q => q.id === questionId);
		if (!question) {
			return res.status(400).json({ success: false, message: "Invalid questionId" });
		}

		if (!question.topic) {
			return res.status(500).json({ success: false, message: "Question topic is missing" });
		}

		const isCorrect = userAnswer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();

		const answer = {
			questionId,
			userAnswer,
			correctAnswer: question.correctAnswer,
			isCorrect,
			topic: question.topic,
			subtopic: question.subtopic,
			difficulty: question.difficulty,
			tags: question.tags,
			learningObjective: question.learningObjective,
			commonMistakes: question.commonMistakes,
		};

		session.answers.push(answer);
		await session.save();

		res.status(200).json({ success: true, data: { isCorrect, correctAnswer: question.correctAnswer } });
	} catch (error) {
		console.log("error in submitting answer:", error.message);
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

		const total = session.answers.length;
		const correct = session.answers.filter(a => a.isCorrect).length;
		const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

		session.score = { correct, total, percentage };

		// ✅ FIX: ensure clean data
		session.analysis = analyzeSession(session.toObject());

		// ✅ BUILD INPUT FOR AI
		const aiInput = {
			...session.analysis,
			score: session.score,
			answers: session.answers,
		};

		console.log("=== ANALYSIS ===", session.analysis);

		// ✅ IMPORTANT: await AI (even if currently sync)
		const aiFeedback = await generateLearningFeedback(aiInput);

		console.log("=== AI OUTPUT ===", aiFeedback);

		// ✅ SAVE AI RESULT
		session.analysis.aiFeedback = aiFeedback;

		session.completedAt = new Date();
		session.status = "completed";

		await session.save();

		res.status(200).json({
			success: true,
			data: {
				score: session.score,
				analysis: session.analysis,
				answers: session.answers,
				aiFeedback: session.analysis.aiFeedback, // ✅ include in response
			}
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
		const report = await fetchSessionReport(id);
		res.status(200).json({ success: true, data: report });
	} catch (error) {
		if (error.message === "Session not found") {
			return res.status(404).json({ success: false, message: "Session not found" });
		}
		if (error.message === "Session is not completed") {
			return res.status(400).json({ success: false, message: "Session is not completed" });
		}
		console.log("error in getting session report:", error.message);
		res.status(500).json({ success: false, message: "Server Error" });
	}
};
import Session from "../models/session.model.js";
import Attempt from "../models/attempt.model.js";
import { analyzeSession } from "./analysis.service.js";

export const completeSession = async (sessionId) => {
	const session = await Session.findById(sessionId);
	if (!session) {
		throw new Error("Session not found");
	}

	// ✅ SINGLE SOURCE OF TRUTH: Get attempts from Attempt collection
	const attempts = await Attempt.find({ sessionId });
	const total = attempts.length;
	const correct = attempts.filter((answer) => answer.isCorrect).length;
	const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

	session.score = { correct, total, percentage };
	session.analysis = analyzeSession({ answers: attempts });
	session.completedAt = new Date();
	session.status = "completed";

	await session.save();

	return {
		score: session.score,
		analysis: session.analysis,
		answers: attempts,
		completedAt: session.completedAt,
	};
};

export const getSessionReport = async (sessionId) => {
	const session = await Session.findById(sessionId);
	if (!session) {
		throw new Error("Session not found");
	}

	if (session.status !== "completed") {
		throw new Error("Session is not completed");
	}

	// ✅ SINGLE SOURCE OF TRUTH: Get attempts from Attempt collection
	const attempts = await Attempt.find({ sessionId });

	return {
		score: session.score,
		analysis: session.analysis,
		answers: attempts,
		completedAt: session.completedAt,
	};
};
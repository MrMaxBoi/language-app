import Session from "../models/session.model.js";
import { analyzeSession } from "./analysis.service.js";

export const completeSession = async (sessionId) => {
	const session = await Session.findById(sessionId);
	if (!session) {
		throw new Error("Session not found");
	}

	const total = session.answers.length;
	const correct = session.answers.filter((answer) => answer.isCorrect).length;
	const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

	session.score = { correct, total, percentage };
	session.analysis = analyzeSession(session);
	session.completedAt = new Date();
	session.status = "completed";

	await session.save();

	return {
		score: session.score,
		analysis: session.analysis,
		answers: session.answers,
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

	return {
		score: session.score,
		analysis: session.analysis,
		answers: session.answers,
		completedAt: session.completedAt,
	};
};
/**
 * Analytics Controller
 * Endpoints for querying learning analytics and validation metrics
 */

import Session from "../models/session.model.js";
import Attempt from "../models/attempt.model.js";
import Skill from "../models/skill.model.js";
import Memory from "../models/memory.model.js";
import { generateSessionAnalytics } from "../services/analytics.service.js";

/**
 * GET /api/analytics/:userId
 * Retrieve aggregated analytics across all user sessions
 */
export const getUserAnalytics = async (req, res) => {
	try {
		const { userId } = req.params;

		// ==========================================
		// LOAD ALL COMPLETED SESSIONS FOR USER
		// ==========================================

		const completedSessions = await Session.find({
			userId,
			status: "completed",
		}).sort({ completedAt: -1 });

		const missingAnalyticsCount = completedSessions.filter((session) => !session.analytics).length;
		if (missingAnalyticsCount > 0) {
			console.log(
				`⚠️ ${missingAnalyticsCount} completed session(s) missing persisted analytics for userId: ${userId}`
			);

			const skills = await Skill.find({ userId });
			const memories = await Memory.find({ userId });

			for (const session of completedSessions) {
				if (!session.analytics) {
					const attempts = await Attempt.find({ sessionId: session._id });
					const previousSessions = completedSessions
						.filter((other) => other._id.toString() !== session._id.toString())
						.slice(0, 5);
					const analytics = generateSessionAnalytics({
						attempts,
						skills,
						memories,
						previousSessions,
					});
					session.analytics = analytics;
					await session.save();
					console.log(
						`✅ Backfilled analytics for old completed session ${session._id.toString()}`
					);
				}
			}
		}

		if (completedSessions.length === 0) {
			return res.status(200).json({
				success: true,
				data: {
					userId,
					totalSessions: 0,
					averageAccuracy: 0,
					weakestTopics: [],
					strongestTopics: [],
					averageRecommendationEffectiveness: 0,
					recentSessions: [],
					message: "No completed sessions found for user",
				},
			});
		}

		// ==========================================
		// 1. CALCULATE AVERAGE SESSION ACCURACY
		// ==========================================

		let totalCorrect = 0;
		let totalAttempts = 0;

		for (const session of completedSessions) {
			if (session.score) {
				totalCorrect += session.score.correct || 0;
				totalAttempts += session.score.total || 0;
			}
		}

		const averageAccuracy =
			totalAttempts > 0
				? Math.round((totalCorrect / totalAttempts) * 100)
				: 0;

		// ==========================================
		// 2. AGGREGATE TOPIC PERFORMANCE
		// ==========================================

		const topicPerformance = {};

		for (const session of completedSessions) {
			if (session.analytics && session.analytics.difficultyBreakdown) {
				// Track weak topics
				if (session.analytics.weakTopics) {
					for (const topic of session.analytics.weakTopics) {
						if (!topicPerformance[topic]) {
							topicPerformance[topic] = {
								weak: 0,
								strong: 0,
							};
						}
						topicPerformance[topic].weak += 1;
					}
				}

				// Track strong topics
				if (session.analytics.strongTopics) {
					for (const topic of session.analytics.strongTopics) {
						if (!topicPerformance[topic]) {
							topicPerformance[topic] = {
								weak: 0,
								strong: 0,
							};
						}
						topicPerformance[topic].strong += 1;
					}
				}
			}
		}

		// ==========================================
		// 3. DETERMINE WEAKEST AND STRONGEST TOPICS
		// ==========================================

		const weakestTopics = Object.entries(topicPerformance)
			.filter(([topic, perf]) => perf.weak > 0)
			.sort((a, b) => b[1].weak - a[1].weak)
			.slice(0, 5)
			.map(([topic]) => topic);

		const strongestTopics = Object.entries(topicPerformance)
			.filter(([topic, perf]) => perf.strong > 0)
			.sort((a, b) => b[1].strong - a[1].strong)
			.slice(0, 5)
			.map(([topic]) => topic);

		// ==========================================
		// 4. CALCULATE AVERAGE RECOMMENDATION EFFECTIVENESS
		// ==========================================

		let totalEffectiveness = 0;
		let effectivenessCount = 0;

		for (const session of completedSessions) {
			if (
				session.analytics &&
				session.analytics.recommendationEffectiveness !== undefined
			) {
				totalEffectiveness += session.analytics.recommendationEffectiveness;
				effectivenessCount += 1;
			}
		}

		const averageRecommendationEffectiveness =
			effectivenessCount > 0
				? Math.round((totalEffectiveness / effectivenessCount) * 100)
				: 0;

		// ==========================================
		// 5. PREPARE RECENT SESSIONS
		// ==========================================

		const recentSessions = completedSessions
			.slice(0, 10)
			.map((session) => ({
				sessionId: session._id,
				accuracy: session.score?.percentage || 0,
				completedAt: session.completedAt,
				analytics: session.analytics,
			}));

		// ==========================================
		// 6. DEBUG LOGGING
		// ==========================================

		console.log(`📊 Analytics retrieved for userId: ${userId}`);
		console.log(`📈 Total sessions: ${completedSessions.length}`);
		console.log(
			`📈 Average accuracy: ${averageAccuracy}%`
		);
		console.log(
			`🧠 Average effectiveness: ${averageRecommendationEffectiveness}%`
		);
		console.log(
			`📚 Weakest topics: ${weakestTopics.length > 0 ? weakestTopics.join(", ") : "None"}`
		);
		console.log(
			`🏆 Strongest topics: ${strongestTopics.length > 0 ? strongestTopics.join(", ") : "None"}`
		);

		// ==========================================
		// RETURN AGGREGATED ANALYTICS
		// ==========================================

		return res.status(200).json({
			success: true,
			data: {
				userId,
				totalSessions: completedSessions.length,
				averageAccuracy,
				weakestTopics,
				strongestTopics,
				averageRecommendationEffectiveness,
				recentSessions,
			},
		});
	} catch (error) {
		console.log("error in getting user analytics:", error.message);
		res.status(500).json({ success: false, message: "Server Error" });
	}
};

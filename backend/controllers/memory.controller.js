/**
 * Memory Health Controller
 * Exposes spaced repetition memory metrics for observability
 */

import Memory from "../models/memory.model.js";

/**
 * GET /api/memory/:userId
 * Retrieve memory health metrics for a user
 */
export const getMemoryHealth = async (req, res) => {
	try {
		const { userId } = req.params;

		// ==========================================
		// LOAD ALL MEMORIES FOR USER
		// ==========================================

		const memories = await Memory.find({ userId }).sort({
			nextReviewDate: 1,
		});

		if (memories.length === 0) {
			console.log(`🧠 No memories found for userId: ${userId}`);
			return res.status(200).json({
				success: true,
				data: {
					userId,
					totalMemories: 0,
					healthMetrics: {
						averageStrength: 0,
						averageReviewInterval: 0,
						overdueCount: 0,
						weakMemoriesCount: 0,
						stableMemoriesCount: 0,
						decayRiskCount: 0,
					},
					memories: [],
				},
			});
		}

		// ==========================================
		// COMPUTE HEALTH METRICS
		// ==========================================

		const now = new Date();
		let totalStrength = 0;
		let totalInterval = 0;
		let overdueCount = 0;
		let weakCount = 0;
		let stableCount = 0;
		let decayRiskCount = 0;

		// ==========================================
		// CATEGORIZE MEMORIES + COMPUTE DECAY RISK
		// ==========================================

		const memoryDetails = memories.map((memory) => {
			const strength = memory.strength || 0;
			const reviewInterval = memory.reviewInterval || 1;
			const nextReviewDate = memory.nextReviewDate || new Date();
			const lastReviewed = memory.lastReviewed || new Date();

			// Is memory overdue for review?
			const isOverdue = nextReviewDate <= now;
			if (isOverdue) {
				overdueCount += 1;
			}

			// Is memory weak?
			const isWeak = strength < 0.5;
			if (isWeak) {
				weakCount += 1;
			} else {
				stableCount += 1;
			}

			// Compute decay risk (days since review)
			const daysSinceReview =
				(now - lastReviewed) / (1000 * 60 * 60 * 24);
			const decayFactor = Math.pow(0.98, daysSinceReview);
			const projectedStrength = strength * decayFactor;
			const decayRisk = 1 - projectedStrength; // Higher = more risk

			if (decayRisk > 0.3) {
				// risk > 30%
				decayRiskCount += 1;
			}

			totalStrength += strength;
			totalInterval += reviewInterval;

			return {
				topic: memory.topic,
				subtopic: memory.subtopic,
				strength: Math.round(strength * 100) / 100,
				reviewInterval: Math.round(reviewInterval * 100) / 100,
				nextReviewDate,
				lastReviewed,
				daysSinceReview: Math.round(daysSinceReview),
				isOverdue,
				isWeak,
				decayRisk: Math.round(decayRisk * 100),
				projectedStrength: Math.round(projectedStrength * 100) / 100,
				totalReviews: memory.totalReviews || 0,
				successfulReviews: memory.successfulReviews || 0,
			};
		});

		// ==========================================
		// AGGREGATE METRICS
		// ==========================================

		const averageStrength =
			Math.round((totalStrength / memories.length) * 100) / 100;
		const averageReviewInterval =
			Math.round((totalInterval / memories.length) * 100) / 100;

		// ==========================================
		// HEALTH SCORE (0-100)
		// ==========================================

		// Based on: average strength, overdue %, weak %
		const overduePercentage = (overdueCount / memories.length) * 100;
		const weakPercentage = (weakCount / memories.length) * 100;
		const baseStrengthScore = averageStrength * 100;
		const penalty = overduePercentage * 0.2 + weakPercentage * 0.3;
		const rawHealthScore = baseStrengthScore - penalty;
		const healthScore = Math.max(0, Math.min(100, Math.round(rawHealthScore)));

		// ==========================================
		// DEBUG LOGGING
		// ==========================================

		console.log(`🧠 Memory health computed for userId: ${userId}`);
		console.log(
			`📊 Total memories: ${memories.length}, Avg strength: ${averageStrength}`
		);
		console.log(
			`⚠️  Overdue: ${overdueCount}, Weak: ${weakCount}, Decay risk: ${decayRiskCount}`
		);

		// ==========================================
		// RETURN MEMORY HEALTH
		// ==========================================

		return res.status(200).json({
			success: true,
			data: {
				userId,
				totalMemories: memories.length,
				healthScore,
				healthMetrics: {
					averageStrength,
					averageReviewInterval,
					overdueCount,
					weakMemoriesCount: weakCount,
					stableMemoriesCount: stableCount,
					decayRiskCount,
				},
				percentages: {
					overdue: Math.round(overduePercentage),
					weak: Math.round(weakPercentage),
					decayRisk: Math.round((decayRiskCount / memories.length) * 100),
				},
				memories: memoryDetails,
			},
		});
	} catch (error) {
		console.log("error in getting memory health:", error.message);
		res.status(500).json({ success: false, message: "Server Error" });
	}
};

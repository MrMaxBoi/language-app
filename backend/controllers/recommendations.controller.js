/**
 * Recommendations Controller
 * Explains adaptive recommendation decisions
 */

import Attempt from "../models/attempt.model.js";
import Question from "../models/question.model.js";
import Skill from "../models/skill.model.js";
import Memory from "../models/memory.model.js";

/**
 * GET /api/recommendations/explain/:userId
 * Explain why questions are recommended for a learner
 */
export const explainRecommendations = async (req, res) => {
	try {
		const { userId } = req.params;

		// ==========================================
		// LOAD USER CONTEXT
		// ==========================================

		// Recent attempts for accuracy calculation
		const recentAttempts = await Attempt.find({ userId })
			.sort({ createdAt: -1 })
			.limit(20);

		if (recentAttempts.length === 0) {
			console.log(`🎯 No attempts found for userId: ${userId}`);
			return res.status(200).json({
				success: true,
				data: {
					userId,
					recommendations: [],
					message: "No learning history available for recommendations",
				},
			});
		}

		// Calculate recent accuracy
		const recentCorrect = recentAttempts.filter(
			(a) => a.isCorrect
		).length;
		const recentAccuracy = recentCorrect / recentAttempts.length;

		// Determine target difficulty
		let targetDifficulty = ["medium", "easy", "hard"];
		if (recentAccuracy > 0.8) {
			targetDifficulty = ["hard", "medium", "easy"];
		} else if (recentAccuracy < 0.5) {
			targetDifficulty = ["easy", "medium", "hard"];
		}

		// ==========================================
		// LOAD USER SKILLS & MEMORIES
		// ==========================================

		const skills = await Skill.find({ userId });
		const memories = await Memory.find({ userId });

		// ==========================================
		// CATEGORIZE SKILLS BY MASTERY
		// ==========================================

		const weakSkills = skills.filter((s) => s.mastery < 0.6);
		const mediumSkills = skills.filter((s) => s.mastery >= 0.6 && s.mastery < 0.9);
		const strongSkills = skills.filter((s) => s.mastery >= 0.9);

		// ==========================================
		// CATEGORIZE MEMORIES
		// ==========================================

		const now = new Date();
		const overdueMemories = memories.filter(
			(m) => m.nextReviewDate <= now
		);
		const weakMemories = memories.filter((m) => m.strength < 0.5);

		// ==========================================
		// BUILD RECOMMENDATION PRIORITIES
		// ==========================================

		// Get topics in priority order
		const priorityTopics = [];

		// Priority 1: Overdue review
		for (const mem of overdueMemories) {
			if (
				!priorityTopics.find(
					(t) => t.topic === mem.topic && t.subtopic === mem.subtopic
				)
			) {
				priorityTopics.push({
					topic: mem.topic,
					subtopic: mem.subtopic,
					reason: "overdue_memory",
					urgency: 40,
				});
			}
		}

		// Priority 2: Weak memory
		for (const mem of weakMemories) {
			if (
				!priorityTopics.find(
					(t) => t.topic === mem.topic && t.subtopic === mem.subtopic
				)
			) {
				priorityTopics.push({
					topic: mem.topic,
					subtopic: mem.subtopic,
					reason: "weak_memory",
					urgency: 25,
				});
			}
		}

		// Priority 3: Weak skill
		for (const skill of weakSkills) {
			if (
				!priorityTopics.find(
					(t) => t.topic === skill.topic && t.subtopic === skill.subtopic
				)
			) {
				priorityTopics.push({
					topic: skill.topic,
					subtopic: skill.subtopic,
					reason: "weak_skill",
					urgency: 20,
				});
			}
		}

		// Priority 4: Medium skill
		for (const skill of mediumSkills) {
			if (
				!priorityTopics.find(
					(t) => t.topic === skill.topic && t.subtopic === skill.subtopic
				)
			) {
				priorityTopics.push({
					topic: skill.topic,
					subtopic: skill.subtopic,
					reason: "medium_skill",
					urgency: 10,
				});
			}
		}

		// ==========================================
		// GET RECOMMENDATIONS WITH SCORING
		// ==========================================

		const recentQuestionIds = new Set(
			recentAttempts.slice(0, 30).map((a) => a.questionId.toString())
		);

		const recommendations = [];

		for (const topicInfo of priorityTopics.slice(0, 5)) {
			// Query questions for this topic
			const candidates = await Question.find({
				topic: topicInfo.topic,
				subtopic: topicInfo.subtopic,
			}).limit(20);

			for (const question of candidates) {
				if (recentQuestionIds.has(question._id.toString())) {
					continue; // Skip recently attempted
				}

				// ==========================================
				// SCORE EACH QUESTION
				// ==========================================

				let score = topicInfo.urgency;

				// Difficulty match bonus
				const difficultiesOrder = targetDifficulty.indexOf(
					question.difficulty
				);
				const difficultyBonus = difficultiesOrder === 0 ? 15 : difficultiesOrder === 1 ? 8 : 0;
				score += difficultyBonus;

				// Novelty penalty
				const noveltyPenalty = recentQuestionIds.has(
					question._id.toString()
				)
					? -15
					: 0;
				score += noveltyPenalty;

				// Randomness
				score += Math.random() * 10;

				// Find contributing factors
				const skillMatch = skills.find(
					(s) =>
						s.topic === question.topic &&
						s.subtopic === question.subtopic
				);
				const memoryMatch = memories.find(
					(m) =>
						m.topic === question.topic &&
						m.subtopic === question.subtopic
				);

				const reasons = [topicInfo.reason];
				if (difficultyBonus > 0) {
					reasons.push("difficulty_balancing");
				}
				if (memoryMatch && memoryMatch.strength < 0.5) {
					reasons.push("memory_decay_risk");
				}
				if (
					skillMatch &&
					skillMatch.mastery >= 0.6 &&
					skillMatch.mastery < 0.9
				) {
					reasons.push("challenge_progression");
				}

				recommendations.push({
					questionId: question._id,
					topic: question.topic,
					subtopic: question.subtopic,
					difficulty: question.difficulty,
					recommendationScore: Math.round(score * 100) / 100,
					reasons: [...new Set(reasons)],
					contributingFactors: {
						memoryStrength: memoryMatch
							? Math.round(memoryMatch.strength * 100)
							: null,
						skillMastery: skillMatch
							? Math.round(skillMatch.mastery * 100)
							: null,
						urgencyScore: topicInfo.urgency,
						difficultyMatch: difficultyBonus,
						noveltyPenalty,
					},
				});

				if (recommendations.length >= 10) {
					break;
				}
			}

			if (recommendations.length >= 10) {
				break;
			}
		}

		// Sort by score
		recommendations.sort(
			(a, b) => b.recommendationScore - a.recommendationScore
		);

		// ==========================================
		// DEBUG LOGGING
		// ==========================================

		console.log(`🎯 Recommendation explanations generated for userId: ${userId}`);
		console.log(
			`📈 Recent accuracy: ${(recentAccuracy * 100).toFixed(1)}%, Target difficulty: ${targetDifficulty[0]}`
		);
		console.log(
			`📚 Generated ${recommendations.length} recommendations with explanation`
		);

		// ==========================================
		// RETURN RECOMMENDATIONS WITH EXPLANATIONS
		// ==========================================

		return res.status(200).json({
			success: true,
			data: {
				userId,
				learnerContext: {
					recentAccuracy: Math.round(recentAccuracy * 100),
					targetDifficulty: targetDifficulty[0],
					weakSkillsCount: weakSkills.length,
					overdueMemoriesCount: overdueMemories.length,
					weakMemoriesCount: weakMemories.length,
				},
				recommendations: recommendations.slice(0, 10),
			},
		});
	} catch (error) {
		console.log("error in explaining recommendations:", error.message);
		res.status(500).json({ success: false, message: "Server Error" });
	}
};

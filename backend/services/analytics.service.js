/**
 * Analytics Service
 * Measures whether adaptive decisions improved learning outcomes
 */

export const generateSessionAnalytics = ({
	attempts = [],
	skills = [],
	memories = [],
	previousSessions = [],
}) => {
	// ==========================================
	// 1. CALCULATE ACCURACY TREND
	// ==========================================
	
	const currentSessionAccuracy =
		attempts.length > 0
			? attempts.filter((a) => a.isCorrect).length / attempts.length
			: 0;

	let accuracyTrend = 0;
	if (previousSessions.length > 0) {
		// Get previous session accuracy
		const previousSession = previousSessions[0];
		const previousAccuracy = previousSession.score?.percentage / 100 || 0;
		// Trend: change in percentage points
		accuracyTrend = (currentSessionAccuracy - previousAccuracy) * 100;
	}

	// ==========================================
	// 2. CALCULATE DIFFICULTY BREAKDOWN
	// ==========================================

	const difficultyBreakdown = {
		easy: {
			correct: 0,
			total: 0,
			accuracy: 0,
		},
		medium: {
			correct: 0,
			total: 0,
			accuracy: 0,
		},
		hard: {
			correct: 0,
			total: 0,
			accuracy: 0,
		},
	};

	const normalizeDifficulty = (difficulty) => {
		if (typeof difficulty === "number") {
			if (difficulty === 1) return "easy";
			if (difficulty === 2) return "medium";
			if (difficulty === 3) return "hard";
		}

		if (typeof difficulty === "string") {
			difficulty = difficulty.toLowerCase().trim();
			if (difficulty === "easy" || difficulty === "e") return "easy";
			if (difficulty === "medium" || difficulty === "m") return "medium";
			if (difficulty === "hard" || difficulty === "h") return "hard";
		}

		return "easy";
	};

	for (const attempt of attempts) {
		let difficulty = normalizeDifficulty(attempt.difficulty);

		if (!difficultyBreakdown[difficulty]) {
			difficultyBreakdown[difficulty] = {
				correct: 0,
				total: 0,
				accuracy: 0,
			};
		}

		difficultyBreakdown[difficulty].total += 1;
		if (attempt.isCorrect) {
			difficultyBreakdown[difficulty].correct += 1;
		}
	}

	// Calculate accuracy for each difficulty
	for (const difficulty of ["easy", "medium", "hard"]) {
		const breakdown = difficultyBreakdown[difficulty];
		breakdown.accuracy =
			breakdown.total > 0
				? Math.round((breakdown.correct / breakdown.total) * 100) / 100
				: 0;
	}

	// ==========================================
	// 3. IDENTIFY WEAK TOPICS (accuracy < 0.5)
	// ==========================================

	const topicAccuracy = {};
	for (const attempt of attempts) {
		const topic = attempt.topic || "unknown";
		if (!topicAccuracy[topic]) {
			topicAccuracy[topic] = { correct: 0, total: 0 };
		}
		topicAccuracy[topic].total += 1;
		if (attempt.isCorrect) {
			topicAccuracy[topic].correct += 1;
		}
	}

	const weakTopics = Object.entries(topicAccuracy)
		.filter(
			([topic, data]) =>
				data.total > 0 && data.correct / data.total < 0.5
		)
		.map(([topic]) => topic);

	// ==========================================
	// 4. IDENTIFY STRONG TOPICS (accuracy >= 0.8)
	// ==========================================

	const strongTopics = Object.entries(topicAccuracy)
		.filter(
			([topic, data]) =>
				data.total > 0 && data.correct / data.total >= 0.8
		)
		.map(([topic]) => topic);

	// ==========================================
	// 5. CALCULATE MEMORY IMPACT
	// ==========================================

	// Compare memory state before/after session
	// For now, we'll count strengthened/weakened based on attempts
	let strengthened = 0;
	let weakened = 0;

	// A simple heuristic: if user got questions right, memories likely strengthened
	// if user got them wrong, memories likely weakened
	for (const attempt of attempts) {
		if (attempt.isCorrect) {
			strengthened += 1;
		} else {
			weakened += 1;
		}
	}

	const memoryImpact = {
		strengthened,
		weakened,
	};

	// ==========================================
	// 6. CALCULATE RECOMMENDATION EFFECTIVENESS
	// ==========================================

	// Formula:
	// (current session accuracy + average memory strength + average skill mastery) / 3
	// Clamped 0-1

	let averageMemoryStrength = 0;
	if (memories.length > 0) {
		const totalStrength = memories.reduce((sum, m) => sum + (m.strength || 0), 0);
		averageMemoryStrength = totalStrength / memories.length;
	}

	let averageSkillMastery = 0;
	if (skills.length > 0) {
		const totalMastery = skills.reduce((sum, s) => sum + (s.mastery || 0), 0);
		averageSkillMastery = totalMastery / skills.length;
	}

	const recommendationEffectiveness = Math.max(
		0,
		Math.min(
			1,
			(currentSessionAccuracy + averageMemoryStrength + averageSkillMastery) / 3
		)
	);

	// ==========================================
	// DEBUG LOGGING
	// ==========================================

	console.log("📊 Analytics generated");
	console.log(`📈 Accuracy trend: ${accuracyTrend.toFixed(2)}%`);
	console.log(`🧠 Recommendation effectiveness: ${(recommendationEffectiveness * 100).toFixed(1)}%`);
	console.log(`📚 Weak topics: ${weakTopics.length > 0 ? weakTopics.join(", ") : "None"}`);
	console.log(`🏆 Strong topics: ${strongTopics.length > 0 ? strongTopics.join(", ") : "None"}`);

	// ==========================================
	// RETURN ANALYTICS OBJECT
	// ==========================================

	return {
		accuracyTrend,
		difficultyBreakdown,
		weakTopics,
		strongTopics,
		memoryImpact,
		recommendationEffectiveness,
	};
};

const safeAnswers = (session) => Array.isArray(session?.answers) ? session.answers : [];

const calcAccuracy = (correct, total) => (total > 0 ? Number((correct / total).toFixed(3)) : 0);

const buildStats = (answers, key, labelName) => {
	const stats = answers.reduce((acc, answer) => {
		const value = String(answer?.[key] ?? "unknown").trim() || "unknown";
		if (!acc[value]) {
			acc[value] = { label: value, total: 0, correct: 0 };
		}
		acc[value].total += 1;
		if (answer.isCorrect) {
			acc[value].correct += 1;
		}
		return acc;
	}, {});

	return Object.values(stats).map(({ label, total, correct }) => ({
		[labelName]: label,
		accuracy: calcAccuracy(correct, total),
	}));
};

const sortByAccuracy = (items, descending = false) => {
	return [...items].sort((a, b) => {
		const diff = descending ? b.accuracy - a.accuracy : a.accuracy - b.accuracy;
		if (Math.abs(diff) > Number.EPSILON) return diff;
		const key = Object.keys(a).find((k) => k !== "accuracy");
		return String(a[key]).localeCompare(String(b[key]));
	});
};

const buildDifficultyBreakdown = (answers) => {
	const counts = {
		easy: { total: 0, correct: 0 },
		medium: { total: 0, correct: 0 },
		hard: { total: 0, correct: 0 },
	};

	answers.forEach((answer) => {
		const difficulty = String(answer?.difficulty ?? "easy").trim().toLowerCase();
		if (!counts[difficulty]) return;
		counts[difficulty].total += 1;
		if (answer.isCorrect) {
			counts[difficulty].correct += 1;
		}
	});

	return {
		easy: calcAccuracy(counts.easy.correct, counts.easy.total),
		medium: calcAccuracy(counts.medium.correct, counts.medium.total),
		hard: calcAccuracy(counts.hard.correct, counts.hard.total),
	};
};

const getRepeatedMistakes = (answers) => {
	const mistakes = answers
		.filter((answer) => !answer.isCorrect)
		.flatMap((answer) => [
			...(Array.isArray(answer.commonMistakes) ? answer.commonMistakes : []),
			...(Array.isArray(answer.tags) ? answer.tags : []),
		])
		.map((item) => String(item).trim())
		.filter((item) => item.length > 0);

	return [...new Set(mistakes)].slice(0, 5);
};

const buildImprovementAreas = (weakestTopics, weakestSubtopics, difficultyBreakdown) => {
	const areas = [
		...weakestTopics.map(({ topic }) => `${topic} fundamentals`),
		...weakestSubtopics.map(({ subtopic }) => `${subtopic} mastery`),
	];

	Object.entries(difficultyBreakdown).forEach(([level, accuracy]) => {
		if (accuracy > 0 && accuracy < 0.75) {
			areas.push(`${level} difficulty practice`);
		}
	});

	return [...new Set(areas.filter((item) => item && !item.includes("unknown")))].slice(0, 5);
};

const estimateSkillLevel = (overallAccuracy) => {
	if (overallAccuracy >= 0.85) return "advanced";
	if (overallAccuracy >= 0.65) return "intermediate";
	if (overallAccuracy >= 0.4) return "beginner";
	return "beginner";
};

export const analyzeSession = (session) => {
	const answers = safeAnswers(session);
	const totalCorrect = answers.reduce((total, answer) => total + (answer.isCorrect ? 1 : 0), 0);
	const totalIncorrect = answers.length - totalCorrect;
	const overallAccuracy = calcAccuracy(totalCorrect, answers.length);

	const topicStats = buildStats(answers, "topic", "topic");
	const subtopicStats = buildStats(answers, "subtopic", "subtopic");

	const weakestTopics = sortByAccuracy(topicStats).slice(0, 3);
	const strongestTopics = sortByAccuracy(topicStats, true).slice(0, 3);
	const weakestSubtopics = sortByAccuracy(subtopicStats).slice(0, 3);
	const difficultyBreakdown = buildDifficultyBreakdown(answers);
	const repeatedMistakes = getRepeatedMistakes(answers);
	const improvementAreas = buildImprovementAreas(weakestTopics, weakestSubtopics, difficultyBreakdown);
	const estimatedSkillLevel = estimateSkillLevel(overallAccuracy);

	return {
		overallAccuracy,
		weakestTopics,
		strongestTopics,
		weakestSubtopics,
		difficultyBreakdown,
		repeatedMistakes,
		improvementAreas,
		estimatedSkillLevel,
		totalCorrect,
		totalIncorrect,
	};
};

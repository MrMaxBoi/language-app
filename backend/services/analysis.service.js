export const analyzeSession = (session) => {
	const answers = Array.isArray(session?.answers) ? session.answers : [];

	const topicStats = answers.reduce((stats, answer) => {
		const topic = String(answer?.topic ?? "unknown").trim() || "unknown";

		if (!stats[topic]) {
			stats[topic] = { topic, total: 0, correct: 0 };
		}

		stats[topic].total += 1;
		if (answer.isCorrect) {
			stats[topic].correct += 1;
		}

		return stats;
	}, {});

	const weakestTopics = Object.values(topicStats)
		.map(({ topic, total, correct }) => ({
			topic,
			accuracy: total > 0 ? Number((correct / total).toFixed(3)) : 0,
		}))
		.sort((a, b) => a.accuracy - b.accuracy || a.topic.localeCompare(b.topic))
		.slice(0, 3);

	const totalQuestions = answers.length;
	const totalCorrect = answers.reduce((count, answer) => count + (answer.isCorrect ? 1 : 0), 0);
	const overallAccuracy = totalQuestions > 0 ? Number((totalCorrect / totalQuestions).toFixed(3)) : 0;

	return {
		weakestTopics,
		overallAccuracy,
		totalQuestions,
	};
};

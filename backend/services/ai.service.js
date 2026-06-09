export const generateLearningFeedback = async (sessionAnalysis) => {
  const {
    overallAccuracy = 0,
    strongestTopics = [],
    weakestTopics = [],
    weakestSubtopics = [],
    difficultyBreakdown = { easy: 0, medium: 0, hard: 0 },
    repeatedMistakes = [],
    improvementAreas = [],
    estimatedSkillLevel = "beginner",
    totalCorrect = 0,
    totalIncorrect = 0,
  } = sessionAnalysis;

  const formatList = (items, key) =>
    items.map((item) => `${item[key]} (${Math.round(item.accuracy * 100)}%)`).join(", ") || "None";

  const difficultySummary = ["easy", "medium", "hard"]
    .map((level) => `${level}: ${Math.round((difficultyBreakdown[level] ?? 0) * 100)}%`)
    .join(" | ");

  const prompt = `You are a Japanese tutor providing a learning diagnosis.

Student summary:
- Estimated skill level: ${estimatedSkillLevel}
- Overall accuracy: ${Math.round(overallAccuracy * 100)}%
- Correct answers: ${totalCorrect}
- Incorrect answers: ${totalIncorrect}
- Strongest topics: ${formatList(strongestTopics, "topic")}
- Weakest subtopics: ${formatList(weakestSubtopics, "subtopic")}
- Difficulty performance: ${difficultySummary}
- Repeated mistake patterns: ${repeatedMistakes.join(", ") || "None identified"}
- Suggested improvement areas: ${improvementAreas.join(", ") || "General practice"}

Please provide:
1. A clear explanation of the student's learning patterns.
2. The most important conceptual weaknesses.
3. Personalized study advice.
4. Strengths to reinforce.
5. A recommended next focus area.`;

  // ⚠️ OPENROUTER DISABLED - Using local prompt only
  console.log("📝 Using local feedback prompt (OpenRouter disabled)");
  return prompt;
};
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

  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    console.log("OPENROUTER_API_KEY missing");
    return prompt;
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    const data = await response.json();

    console.log("=== OPENROUTER RESPONSE ===");
    console.log(JSON.stringify(data, null, 2));

    return data?.choices?.[0]?.message?.content || prompt;
  } catch (error) {
    console.log("OpenRouter error:", error);
    return prompt;
  }
};
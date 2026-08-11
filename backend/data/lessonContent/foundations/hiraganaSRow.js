const kanaItem = ({ conceptId, character, romanization, pronunciationHint, example }) => ({
  conceptId,
  character,
  romanization,
  pronunciationHint,
  example,
});

const choice = (text, isCorrect = false) => ({ text, isCorrect });

export const HIRAGANA_S_ROW_CONTENT = {
  lessonId: "foundations-hiragana-s-row",
  version: 1,
  eyebrow: "HIRAGANA BEGINNINGS",
  title: "Hiragana S-row",
  description: "Learn the next sound row and its important shi sound.",
  estimatedMinutes: 7,
  objectives: [
    "Recognize さ, し, す, せ, and そ.",
    "Remember that the second S-row sound is shi, not si.",
  ],
  steps: [
    {
      id: "welcome",
      type: "introduction",
      title: "One familiar pattern, one special sound",
      body: "The S-row also follows a, i, u, e, o. Most sounds are predictable, but し is read shi rather than si.",
      callout: "Read the row as sa, shi, su, se, so.",
    },
    {
      id: "learn-sa-shi",
      type: "kana_group",
      title: "Start with sa and shi",
      body: "Listen closely to shi. It is the first irregular reading in the core rows.",
      items: [
        kanaItem({
          conceptId: "kana.hiragana.sa",
          character: "さ",
          romanization: "sa",
          pronunciationHint: "A light s sound followed by a short a.",
          example: { japanese: "さかな", reading: "sakana", meaning: "fish" },
        }),
        kanaItem({
          conceptId: "kana.hiragana.shi",
          character: "し",
          romanization: "shi",
          pronunciationHint: "Like she without stretching the vowel.",
          example: { japanese: "しま", reading: "shima", meaning: "island" },
        }),
      ],
      callout: "し curves upward like a hook. Its sound is shi, not si.",
    },
    {
      id: "check-shi",
      type: "guided_choice",
      prompt: "What sound does し represent?",
      choices: [choice("sa"), choice("si"), choice("shi", true), choice("su")],
      correctAnswer: "shi",
      explanation: "し is read shi in standard romanization.",
      hint: "This is the special sound in the S-row.",
    },
    {
      id: "learn-su-se",
      type: "kana_group",
      title: "Continue with su and se",
      body: "Return to the regular pattern: s plus u, then s plus e.",
      items: [
        kanaItem({
          conceptId: "kana.hiragana.su",
          character: "す",
          romanization: "su",
          pronunciationHint: "A soft s followed by a light Japanese u.",
          example: { japanese: "すし", reading: "sushi", meaning: "sushi" },
        }),
        kanaItem({
          conceptId: "kana.hiragana.se",
          character: "せ",
          romanization: "se",
          pronunciationHint: "An s sound followed by e, like the e in met.",
          example: { japanese: "せかい", reading: "sekai", meaning: "world" },
        }),
      ],
    },
    {
      id: "check-se",
      type: "guided_choice",
      prompt: "Which character makes the sound se?",
      choices: [choice("さ"), choice("す"), choice("せ", true), choice("そ")],
      correctAnswer: "せ",
      explanation: "せ is the Hiragana character for se.",
      hint: "It is the fourth sound in sa, shi, su, se, so.",
    },
    {
      id: "learn-so",
      type: "kana_group",
      title: "Finish with so",
      body: "そ completes the row with the o vowel sound.",
      items: [
        kanaItem({
          conceptId: "kana.hiragana.so",
          character: "そ",
          romanization: "so",
          pronunciationHint: "An s sound followed by a short, steady o.",
          example: { japanese: "そら", reading: "sora", meaning: "sky" },
        }),
      ],
      callout: "Say the whole row without changing the order: sa, shi, su, se, so.",
    },
    {
      id: "check-order",
      type: "guided_choice",
      prompt: "Which character completes さ・し・す・せ・__?",
      choices: [choice("そ", true), choice("さ"), choice("こ"), choice("す")],
      correctAnswer: "そ",
      explanation: "The S-row ends with そ, the so sound.",
      hint: "The last sound in the row is so.",
    },
    {
      id: "recap",
      type: "recap",
      title: "You can read the S-row",
      body: "Read the row once more and give shi its special sound.",
      items: [
        { character: "さ", romanization: "sa" },
        { character: "し", romanization: "shi" },
        { character: "す", romanization: "su" },
        { character: "せ", romanization: "se" },
        { character: "そ", romanization: "so" },
      ],
    },
  ],
  practice: {
    questionCount: 5,
    title: "Ready to practise the S-row?",
    description: "Check all five characters, including the special shi reading.",
    ctaLabel: "Start practice",
  },
};

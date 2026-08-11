const kanaItem = ({ conceptId, character, romanization, pronunciationHint, example }) => ({
  conceptId,
  character,
  romanization,
  pronunciationHint,
  example,
});

const choice = (text, isCorrect = false) => ({ text, isCorrect });

export const HIRAGANA_K_ROW_CONTENT = {
  lessonId: "foundations-hiragana-k-row",
  version: 1,
  eyebrow: "HIRAGANA BEGINNINGS",
  title: "Hiragana K-row",
  description: "Add a k sound to the five vowels you already know.",
  estimatedMinutes: 7,
  objectives: [
    "Recognize か, き, く, け, and こ.",
    "Read the K-row in Japanese vowel order.",
  ],
  steps: [
    {
      id: "welcome",
      type: "introduction",
      title: "Build on the five vowels",
      body: "The K-row keeps the vowel order you already learned. Add k to a, i, u, e, and o to make ka, ki, ku, ke, and ko.",
      callout: "Keep the vowel at the end clear: ka, ki, ku, ke, ko.",
    },
    {
      id: "learn-ka-ki",
      type: "kana_group",
      title: "Begin with ka and ki",
      body: "Tap each character, listen once, then say it yourself.",
      items: [
        kanaItem({
          conceptId: "kana.hiragana.ka",
          character: "か",
          romanization: "ka",
          pronunciationHint: "A clean k sound followed by a, as in father.",
          example: { japanese: "かお", reading: "kao", meaning: "face" },
        }),
        kanaItem({
          conceptId: "kana.hiragana.ki",
          character: "き",
          romanization: "ki",
          pronunciationHint: "A light k sound followed by a short ee sound.",
          example: { japanese: "き", reading: "ki", meaning: "tree" },
        }),
      ],
    },
    {
      id: "check-ki",
      type: "guided_choice",
      prompt: "Which character makes the sound ki?",
      choices: [choice("か"), choice("き", true), choice("く"), choice("こ")],
      correctAnswer: "き",
      explanation: "き is the Hiragana character for ki.",
      hint: "It is the second sound in ka, ki, ku, ke, ko.",
    },
    {
      id: "learn-ku-ke",
      type: "kana_group",
      title: "Continue with ku and ke",
      body: "Notice how the vowel changes while the opening k stays steady.",
      items: [
        kanaItem({
          conceptId: "kana.hiragana.ku",
          character: "く",
          romanization: "ku",
          pronunciationHint: "A light k followed by the Japanese u sound.",
          example: { japanese: "くち", reading: "kuchi", meaning: "mouth" },
        }),
        kanaItem({
          conceptId: "kana.hiragana.ke",
          character: "け",
          romanization: "ke",
          pronunciationHint: "A k sound followed by e, like the e in met.",
          example: { japanese: "けさ", reading: "kesa", meaning: "this morning" },
        }),
      ],
    },
    {
      id: "check-ku",
      type: "guided_choice",
      prompt: "What sound does く represent?",
      choices: [choice("ke"), choice("ko"), choice("ku", true), choice("ki")],
      correctAnswer: "ku",
      explanation: "く represents the sound ku.",
      hint: "Pair k with the vowel u.",
    },
    {
      id: "learn-ko",
      type: "kana_group",
      title: "Complete the row with ko",
      body: "こ is made from two simple horizontal strokes and completes the K-row.",
      items: [
        kanaItem({
          conceptId: "kana.hiragana.ko",
          character: "こ",
          romanization: "ko",
          pronunciationHint: "A k sound followed by a short, steady o.",
          example: { japanese: "こえ", reading: "koe", meaning: "voice" },
        }),
      ],
      callout: "The full row follows the same order as あ・い・う・え・お.",
    },
    {
      id: "check-order",
      type: "guided_choice",
      prompt: "Which character completes か・き・く・け・__?",
      choices: [choice("か"), choice("こ", true), choice("く"), choice("お")],
      correctAnswer: "こ",
      explanation: "The K-row ends with こ, the ko sound.",
      hint: "The final vowel in the Japanese vowel order is o.",
    },
    {
      id: "recap",
      type: "recap",
      title: "You can read the K-row",
      body: "Read the row once at an even pace before practice.",
      items: [
        { character: "か", romanization: "ka" },
        { character: "き", romanization: "ki" },
        { character: "く", romanization: "ku" },
        { character: "け", romanization: "ke" },
        { character: "こ", romanization: "ko" },
      ],
    },
  ],
  practice: {
    questionCount: 5,
    title: "Ready to practise the K-row?",
    description: "Use the five sounds you just learned to strengthen this lesson.",
    ctaLabel: "Start practice",
  },
};

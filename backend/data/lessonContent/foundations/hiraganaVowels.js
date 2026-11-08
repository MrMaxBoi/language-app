const characterFocus = ({ id, conceptId, title, character, romanization, soundCue, soundNote }) => ({
  id,
  type: "character_focus",
  conceptId,
  title,
  character,
  romanization,
  soundCue,
  soundNote,
  audioText: character,
});

const characterTrace = ({ id, conceptId, character, romanization, tracingKey }) => ({
  id,
  type: "character_trace",
  conceptId,
  title: `Trace ${character}`,
  character,
  romanization,
  tracingKey,
});

// Quick ear-calibration check: the prompt is spoken, the learner picks the kana.
const soundCheck = ({ id, answer, distractors, hint }) => {
  const choices = [answer, ...distractors];
  return {
    id,
    type: "guided_choice",
    prompt: "Which sound did you hear?",
    audioText: answer,
    choices: choices.map((text) => ({ text, isCorrect: text === answer })),
    correctAnswer: answer,
    explanation: `That was ${answer}.`,
    hint,
  };
};

// Characters the learner has just met fuse into a real word.
const synthesis = ({
  id,
  conceptIds,
  illustrationKey,
  illustrationAlt,
  japanese,
  meaning,
  segments,
}) => ({
  id,
  type: "synthesis",
  conceptIds,
  illustrationKey,
  illustrationAlt,
  japanese,
  meaning,
  audioText: japanese,
  segments,
});

export const HIRAGANA_VOWELS_CONTENT = {
  lessonId: "foundations-hiragana-vowels",
  version: 9,
  eyebrow: "HIRAGANA BEGINNINGS",
  title: "Hiragana Vowels",
  description: "Meet the five vowel sounds that appear throughout Japanese.",
  estimatedMinutes: 9,
  objectives: [
    "Recognize あ, い, う, え, and お.",
    "Connect each character with its Japanese vowel sound.",
  ],
  steps: [
    {
      id: "welcome",
      type: "introduction",
      title: "How Hiragana works",
      body: "Hiragana is a syllabary: each character stands for one sound, not one letter.",
      statements: [
        "Japanese writes with three scripts: hiragana, katakana and kanji.",
        "Hiragana comes first. It spells native words and the grammar that holds a sentence together.",
      ],
    },
    {
      id: "vowel-grid",
      type: "introduction",
      title: "Five vowels, every row",
      body: "Hiragana is laid out as a grid of rows, called the gojūon.",
      statements: [
        "Almost every row ends on the same five vowels: a, i, u, e, o.",
      ],
      callout: "In this lesson: hear, write and read あ い う え お.",
      beats: [
        { label: "あ", reading: "a", audioText: "あ" },
        { label: "い", reading: "i", audioText: "い" },
        { label: "う", reading: "u", audioText: "う" },
        { label: "え", reading: "e", audioText: "え" },
        { label: "お", reading: "o", audioText: "お" },
      ],
    },
    characterFocus({
      id: "focus-a",
      conceptId: "kana.hiragana.a",
      title: "Meet the sound a",
      character: "あ",
      romanization: "a",
      soundCue: "ah",
      soundNote: "Short and open.",
    }),
    characterTrace({
      id: "trace-a",
      conceptId: "kana.hiragana.a",
      character: "あ",
      romanization: "a",
      tracingKey: "hiragana-a",
    }),
    characterFocus({
      id: "focus-i",
      conceptId: "kana.hiragana.i",
      title: "Meet the sound i",
      character: "い",
      romanization: "i",
      soundCue: "ee",
      soundNote: "Quick and clear.",
    }),
    characterTrace({
      id: "trace-i",
      conceptId: "kana.hiragana.i",
      character: "い",
      romanization: "i",
      tracingKey: "hiragana-i",
    }),
    soundCheck({
      id: "check-a-i",
      answer: "い",
      distractors: ["あ"],
      hint: "Listen for the quick, bright \"ee\".",
    }),
    synthesis({
      id: "synthesis-ai",
      conceptIds: ["kana.hiragana.a", "kana.hiragana.i"],
      illustrationKey: "vowels-ai-love",
      illustrationAlt: "Two hands holding a red heart",
      japanese: "あい",
      meaning: "love",
      segments: [
        { character: "あ", romanization: "a" },
        { character: "い", romanization: "i" },
      ],
    }),
    characterFocus({
      id: "focus-u",
      conceptId: "kana.hiragana.u",
      title: "Meet the sound u",
      character: "う",
      romanization: "u",
      soundCue: "oo",
      soundNote: "Light, with relaxed lips.",
    }),
    characterTrace({
      id: "trace-u",
      conceptId: "kana.hiragana.u",
      character: "う",
      romanization: "u",
      tracingKey: "hiragana-u",
    }),
    characterFocus({
      id: "focus-e",
      conceptId: "kana.hiragana.e",
      title: "Meet the sound e",
      character: "え",
      romanization: "e",
      soundCue: "eh",
      soundNote: "Short and steady.",
    }),
    characterTrace({
      id: "trace-e",
      conceptId: "kana.hiragana.e",
      character: "え",
      romanization: "e",
      tracingKey: "hiragana-e",
    }),
    soundCheck({
      id: "check-u-e",
      answer: "う",
      distractors: ["え", "い"],
      hint: "Relaxed lips, a light \"oo\".",
    }),
    synthesis({
      id: "synthesis-ue",
      conceptIds: ["kana.hiragana.u", "kana.hiragana.e"],
      illustrationKey: "vowels-ue-above",
      illustrationAlt: "A red ball floating above a blue block",
      japanese: "うえ",
      meaning: "above",
      segments: [
        { character: "う", romanization: "u" },
        { character: "え", romanization: "e" },
      ],
    }),
    characterFocus({
      id: "focus-o",
      conceptId: "kana.hiragana.o",
      title: "Meet the sound o",
      character: "お",
      romanization: "o",
      soundCue: "oh",
      soundNote: "Short, without an English-style glide.",
    }),
    characterTrace({
      id: "trace-o",
      conceptId: "kana.hiragana.o",
      character: "お",
      romanization: "o",
      tracingKey: "hiragana-o",
    }),
    // Moment 1, one section after うえ was taught, so the learner has to recall it. The sentence
    // carries the meaning (diglot weave); the Japanese word always ends its line.
    {
      id: "moment-ue",
      type: "moment",
      conceptIds: ["kana.hiragana.u", "kana.hiragana.e"],
      tone: "accent",
      lines: [
        { phrases: ["Golden hour.", "The wind tugs Hana's balloon", "from her hand."] },
        {
          phrases: ["It drifts higher and higher.", "Hana points"],
          word: { japanese: "うえ", romanization: "ue", tail: "!" },
        },
      ],
    },
    soundCheck({
      id: "check-a-o",
      answer: "お",
      distractors: ["あ", "う"],
      hint: "A short, rounded \"oh\" with no glide.",
    }),
    synthesis({
      id: "synthesis-ao",
      conceptIds: ["kana.hiragana.a", "kana.hiragana.o"],
      illustrationKey: "vowels-ao-blue",
      illustrationAlt: "A vivid blue sky with one white cloud",
      japanese: "あお",
      meaning: "blue",
      segments: [
        { character: "あ", romanization: "a" },
        { character: "お", romanization: "o" },
      ],
    }),
    // Moment 2 closes the same balloon story and the lesson.
    {
      id: "moment-ao",
      type: "moment",
      conceptIds: ["kana.hiragana.a", "kana.hiragana.o"],
      tone: "indigo",
      lines: [
        { phrases: ["The balloon grows small."] },
        {
          phrases: ["Grandma watches it fade", "into the evening"],
          word: { japanese: "あお", romanization: "ao", tail: "." },
        },
      ],
    },
    {
      id: "recap",
      type: "recap",
      title: "Five sounds, ready to use",
      items: [
        { character: "あ", romanization: "a" },
        { character: "い", romanization: "i" },
        { character: "う", romanization: "u" },
        { character: "え", romanization: "e" },
        { character: "お", romanization: "o" },
      ],
    },
  ],
  practice: {
    questionCount: 5,
    title: "Now make the sounds yours",
    description: "A few short questions will check what stayed with you.",
    ctaLabel: "Start practice",
  },
};

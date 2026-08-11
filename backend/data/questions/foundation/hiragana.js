// Hiragana recognition (kana.hiragana)
const createVowelQuestion = ({ id, questionText, correctAnswer, options, conceptId, explanation }) => ({
  _id: id,
  questionText,
  questionType: "multiple_choice",
  options: options.map((text) => ({ text, isCorrect: text === correctAnswer })),
  correctAnswer,
  topic: "kana",
  subtopic: "hiragana recognition",
  skillId: "kana.hiragana",
  lessonIds: ["lesson-hiragana-recognition", "foundations-hiragana-vowels"],
  conceptIds: [conceptId],
  difficulty: "easy",
  tags: ["kana", "hiragana", "foundation", "vowels"],
  explanation,
  learningObjective: "Connect each core Hiragana vowel with its sound.",
  commonMistakes: ["Confusing visually similar Hiragana", "Choosing the matching Katakana character"],
});

const placeAnswer = (answer, distractors, answerIndex) => {
  const options = distractors.slice(0, 3);
  options.splice(answerIndex % 4, 0, answer);
  return options;
};

const createRowQuestion = ({
  id,
  questionText,
  correctAnswer,
  options,
  conceptId,
  lessonId,
  rowName,
  explanation,
}) => ({
  _id: id,
  questionText,
  questionType: "multiple_choice",
  options: options.map((text) => ({ text, isCorrect: text === correctAnswer })),
  correctAnswer,
  topic: "kana",
  subtopic: "hiragana recognition",
  skillId: "kana.hiragana",
  lessonIds: ["lesson-hiragana-recognition", lessonId],
  conceptIds: [conceptId],
  difficulty: "easy",
  tags: ["kana", "hiragana", "foundation", rowName],
  explanation,
  learningObjective: `Recognize the Hiragana ${rowName.toUpperCase()}-row and connect each character with its sound.`,
  commonMistakes: ["Confusing characters in the same Hiragana row", "Choosing the matching Katakana character"],
});

const createRowQuestions = ({ lessonId, rowName, entries }) =>
  entries.flatMap(({ reading, character }, index) => {
    const otherCharacters = entries.filter((entry) => entry.character !== character).map((entry) => entry.character);
    const otherReadings = entries.filter((entry) => entry.reading !== reading).map((entry) => entry.reading);
    const pair = `${character} = ${reading}`;
    const otherPairs = otherReadings.map((otherReading) => `${character} = ${otherReading}`);
    const idPrefix = `q_foundations_hiragana_${rowName}_row_${reading}`;
    const conceptId = `kana.hiragana.${reading}`;

    return [
      createRowQuestion({
        id: `${idPrefix}_character`,
        questionText: `Which hiragana represents the sound '${reading}'?`,
        correctAnswer: character,
        options: placeAnswer(character, otherCharacters, index),
        conceptId,
        lessonId,
        rowName,
        explanation: `${character} is the Hiragana character for '${reading}'.`,
      }),
      createRowQuestion({
        id: `${idPrefix}_sound`,
        questionText: `What sound does ${character} represent?`,
        correctAnswer: reading,
        options: placeAnswer(reading, otherReadings, index + 1),
        conceptId,
        lessonId,
        rowName,
        explanation: `${character} represents the sound '${reading}'.`,
      }),
      createRowQuestion({
        id: `${idPrefix}_pair`,
        questionText: `Which Hiragana and sound pair is correct for ${character}?`,
        correctAnswer: pair,
        options: placeAnswer(pair, otherPairs, index + 2),
        conceptId,
        lessonId,
        rowName,
        explanation: `${character} and '${reading}' are the correct character and sound pair.`,
      }),
    ];
  });

const kRowQuestions = createRowQuestions({
  lessonId: "foundations-hiragana-k-row",
  rowName: "k",
  entries: [
    { reading: "ka", character: "か" },
    { reading: "ki", character: "き" },
    { reading: "ku", character: "く" },
    { reading: "ke", character: "け" },
    { reading: "ko", character: "こ" },
  ],
});

const sRowQuestions = createRowQuestions({
  lessonId: "foundations-hiragana-s-row",
  rowName: "s",
  entries: [
    { reading: "sa", character: "さ" },
    { reading: "shi", character: "し" },
    { reading: "su", character: "す" },
    { reading: "se", character: "せ" },
    { reading: "so", character: "そ" },
  ],
});

const questions = [
  {
    "_id": "mock_101",
    "questionText": "Which hiragana represents the sound 'a'?",
    "questionType": "multiple_choice",
    "options": [
      {
        "text": "い",
        "isCorrect": false
      },
      {
        "text": "く",
        "isCorrect": false
      },
      {
        "text": "ね",
        "isCorrect": false
      },
      {
        "text": "あ",
        "isCorrect": true
      }
    ],
    "correctAnswer": "あ",
    "topic": "kana",
    "subtopic": "hiragana recognition",
    "skillId": "kana.hiragana",
    "lessonIds": [
      "lesson-hiragana-recognition",
      "foundations-hiragana-vowels"
    ],
    "conceptIds": [
      "kana.hiragana.a"
    ],
    "difficulty": "easy",
    "tags": [
      "kana",
      "hiragana",
      "foundation"
    ],
    "explanation": "あ is the hiragana character for the vowel sound 'a'.",
    "learningObjective": "Recognize core hiragana characters.",
    "commonMistakes": [
      "Confusing あ with お",
      "Using katakana ア instead"
    ]
  },
  {
    "_id": "mock_115",
    "questionText": "Which hiragana represents the sound 'i'?",
    "questionType": "multiple_choice",
    "options": [
      {
        "text": "い",
        "isCorrect": true
      },
      {
        "text": "あ",
        "isCorrect": false
      },
      {
        "text": "く",
        "isCorrect": false
      },
      {
        "text": "ね",
        "isCorrect": false
      }
    ],
    "correctAnswer": "い",
    "topic": "kana",
    "subtopic": "hiragana recognition",
    "skillId": "kana.hiragana",
    "lessonIds": [
      "lesson-hiragana-recognition",
      "foundations-hiragana-vowels"
    ],
    "conceptIds": [
      "kana.hiragana.i"
    ],
    "difficulty": "easy",
    "tags": [
      "kana",
      "hiragana",
      "foundation"
    ],
    "explanation": "い is the hiragana character for the vowel sound 'i'.",
    "learningObjective": "Recognize core hiragana characters.",
    "commonMistakes": [
      "Confusing い with り",
      "Using katakana イ instead"
    ]
  },
  {
    "_id": "mock_116",
    "questionText": "Which hiragana represents the sound 'ku'?",
    "questionType": "multiple_choice",
    "options": [
      {
        "text": "あ",
        "isCorrect": false
      },
      {
        "text": "い",
        "isCorrect": false
      },
      {
        "text": "ね",
        "isCorrect": false
      },
      {
        "text": "く",
        "isCorrect": true
      }
    ],
    "correctAnswer": "く",
    "topic": "kana",
    "subtopic": "hiragana recognition",
    "skillId": "kana.hiragana",
    "lessonIds": [
      "lesson-hiragana-recognition",
      "foundations-hiragana-k-row"
    ],
    "conceptIds": [
      "kana.hiragana.ku"
    ],
    "difficulty": "easy",
    "tags": [
      "kana",
      "hiragana",
      "foundation"
    ],
    "explanation": "く is the hiragana character for 'ku'.",
    "learningObjective": "Recognize core hiragana characters.",
    "commonMistakes": [
      "Confusing く with へ",
      "Using katakana ク instead"
    ]
  },
  {
    "_id": "mock_117",
    "questionText": "Which hiragana represents the sound 'ne'?",
    "questionType": "multiple_choice",
    "options": [
      {
        "text": "い",
        "isCorrect": false
      },
      {
        "text": "く",
        "isCorrect": false
      },
      {
        "text": "ね",
        "isCorrect": true
      },
      {
        "text": "あ",
        "isCorrect": false
      }
    ],
    "correctAnswer": "ね",
    "topic": "kana",
    "subtopic": "hiragana recognition",
    "skillId": "kana.hiragana",
    "lessonIds": [
      "lesson-hiragana-recognition",
      "foundations-hiragana-n-row"
    ],
    "conceptIds": [
      "kana.hiragana.ne"
    ],
    "difficulty": "easy",
    "tags": [
      "kana",
      "hiragana",
      "foundation"
    ],
    "explanation": "ね is the hiragana character for 'ne'.",
    "learningObjective": "Recognize core hiragana characters.",
    "commonMistakes": [
      "Confusing ね with れ",
      "Using katakana ネ instead"
    ]
  },
  {
    "_id": "mock_118",
    "questionText": "Which hiragana represents the sound 'mo'?",
    "questionType": "multiple_choice",
    "options": [
      {
        "text": "と",
        "isCorrect": false
      },
      {
        "text": "も",
        "isCorrect": true
      },
      {
        "text": "が",
        "isCorrect": false
      },
      {
        "text": "で",
        "isCorrect": false
      }
    ],
    "correctAnswer": "も",
    "topic": "kana",
    "subtopic": "hiragana recognition",
    "skillId": "kana.hiragana",
    "lessonIds": [
      "lesson-hiragana-recognition",
      "foundations-hiragana-m-row"
    ],
    "conceptIds": [
      "kana.hiragana.mo"
    ],
    "difficulty": "easy",
    "tags": [
      "kana",
      "hiragana",
      "foundation"
    ],
    "explanation": "も is the hiragana character for 'mo'.",
    "learningObjective": "Recognize core hiragana characters.",
    "commonMistakes": [
      "Confusing も with ま",
      "Using katakana モ instead"
    ]
  },
  createVowelQuestion({
    id: "q_foundations_hiragana_vowels_001",
    questionText: "Which hiragana represents the sound 'u'?",
    correctAnswer: "う",
    options: ["う", "お", "え", "あ"],
    conceptId: "kana.hiragana.u",
    explanation: "う is the Hiragana character for the vowel sound 'u'.",
  }),
  createVowelQuestion({
    id: "q_foundations_hiragana_vowels_002",
    questionText: "Which hiragana represents the sound 'e'?",
    correctAnswer: "え",
    options: ["い", "あ", "え", "お"],
    conceptId: "kana.hiragana.e",
    explanation: "え is the Hiragana character for the vowel sound 'e'.",
  }),
  createVowelQuestion({
    id: "q_foundations_hiragana_vowels_003",
    questionText: "Which hiragana represents the sound 'o'?",
    correctAnswer: "お",
    options: ["あ", "お", "う", "え"],
    conceptId: "kana.hiragana.o",
    explanation: "お is the Hiragana character for the vowel sound 'o'.",
  }),
  createVowelQuestion({
    id: "q_foundations_hiragana_vowels_004",
    questionText: "What sound does あ represent?",
    correctAnswer: "a",
    options: ["o", "e", "a", "i"],
    conceptId: "kana.hiragana.a",
    explanation: "あ represents the Japanese vowel sound 'a'.",
  }),
  createVowelQuestion({
    id: "q_foundations_hiragana_vowels_005",
    questionText: "What sound does い represent?",
    correctAnswer: "i",
    options: ["i", "u", "a", "e"],
    conceptId: "kana.hiragana.i",
    explanation: "い represents the Japanese vowel sound 'i'.",
  }),
  createVowelQuestion({
    id: "q_foundations_hiragana_vowels_006",
    questionText: "What sound does う represent?",
    correctAnswer: "u",
    options: ["e", "o", "i", "u"],
    conceptId: "kana.hiragana.u",
    explanation: "う represents the Japanese vowel sound 'u'.",
  }),
  createVowelQuestion({
    id: "q_foundations_hiragana_vowels_007",
    questionText: "What sound does え represent?",
    correctAnswer: "e",
    options: ["a", "e", "o", "u"],
    conceptId: "kana.hiragana.e",
    explanation: "え represents the Japanese vowel sound 'e'.",
  }),
  createVowelQuestion({
    id: "q_foundations_hiragana_vowels_008",
    questionText: "What sound does お represent?",
    correctAnswer: "o",
    options: ["u", "a", "i", "o"],
    conceptId: "kana.hiragana.o",
    explanation: "お represents the Japanese vowel sound 'o'.",
  }),
  createVowelQuestion({
    id: "q_foundations_hiragana_vowels_009",
    questionText: "Which Hiragana and sound pair is correct for あ?",
    correctAnswer: "あ = a",
    options: ["あ = o", "あ = e", "あ = a", "あ = i"],
    conceptId: "kana.hiragana.a",
    explanation: "あ and 'a' are the same Japanese vowel.",
  }),
  createVowelQuestion({
    id: "q_foundations_hiragana_vowels_010",
    questionText: "Which Hiragana and sound pair is correct for い?",
    correctAnswer: "い = i",
    options: ["い = i", "い = u", "い = e", "い = a"],
    conceptId: "kana.hiragana.i",
    explanation: "い and 'i' are the same Japanese vowel.",
  }),
  createVowelQuestion({
    id: "q_foundations_hiragana_vowels_011",
    questionText: "Which Hiragana and sound pair is correct for う?",
    correctAnswer: "う = u",
    options: ["う = i", "う = o", "う = u", "う = e"],
    conceptId: "kana.hiragana.u",
    explanation: "う and 'u' are the same Japanese vowel.",
  }),
  createVowelQuestion({
    id: "q_foundations_hiragana_vowels_012",
    questionText: "Which Hiragana and sound pair is correct for え?",
    correctAnswer: "え = e",
    options: ["え = a", "え = e", "え = i", "え = o"],
    conceptId: "kana.hiragana.e",
    explanation: "え and 'e' are the same Japanese vowel.",
  }),
  createVowelQuestion({
    id: "q_foundations_hiragana_vowels_013",
    questionText: "Which Hiragana and sound pair is correct for お?",
    correctAnswer: "お = o",
    options: ["お = u", "お = a", "お = e", "お = o"],
    conceptId: "kana.hiragana.o",
    explanation: "お and 'o' are the same Japanese vowel.",
  }),
  ...kRowQuestions,
  ...sRowQuestions,
];

export default questions;

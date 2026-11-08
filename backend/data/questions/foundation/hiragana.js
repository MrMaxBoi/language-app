// Hiragana recognition (kana.hiragana)
// Vowels pool, by layer (cognitiveType):
// - recognition: kana -> sound. Table stakes, kept to one per kana.
// - production: hear the sound -> pick the kana. Needs `audioText` played by the quiz screen.
// - connection: a tiny situation -> the word, or a word -> the situation. No romaji anywhere.
const VOWEL_LEARNING_OBJECTIVES = {
  recognition: "Connect each core Hiragana vowel with its sound.",
  production: "Pick the Hiragana vowel for a sound you hear.",
  connection: "Understand あお and うえ in a small everyday moment, without romaji.",
};

const createVowelQuestion = ({
  id,
  layer = "recognition",
  difficulty = "easy",
  questionText,
  audioText,
  correctAnswer,
  options,
  conceptIds,
  explanation,
  commonMistakes = ["Confusing visually similar Hiragana", "Choosing the matching Katakana character"],
}) => ({
  _id: id,
  questionText,
  questionType: "multiple_choice",
  cognitiveType: layer,
  ...(audioText ? { audioText } : {}),
  options: options.map((text) => ({ text, isCorrect: text === correctAnswer })),
  correctAnswer,
  topic: "kana",
  subtopic: "hiragana recognition",
  skillId: "kana.hiragana",
  lessonIds: ["lesson-hiragana-recognition", "foundations-hiragana-vowels"],
  conceptIds,
  difficulty,
  tags: ["kana", "hiragana", "foundation", "vowels", layer],
  explanation,
  learningObjective: VOWEL_LEARNING_OBJECTIVES[layer],
  commonMistakes,
});

// K-row pool, by layer (cognitiveType), built on the proven Vowels shape:
// - recognition: kana <-> sound. Table stakes, kept few. Romaji allowed in this layer only.
// - production: hear the sound -> pick the kana. Needs `audioText` played by the quiz screen.
// - connection: a tiny golden-hour station moment -> the word. No romaji in prompts or options.
//   Words use only taught kana (あ い う え お か き く け こ): えき (station), あか (red),
//   かお (face), こえ (voice), plus あお (blue) as a callback to the Vowels lesson.
const K_ROW_LEARNING_OBJECTIVES = {
  recognition: "Connect each Hiragana K-row character with its sound.",
  production: "Pick the Hiragana K-row kana for a sound you hear.",
  connection: "Understand a K-row word in a small station moment, without romaji.",
};

const createKRowQuestion = ({
  id,
  layer = "recognition",
  difficulty = "easy",
  questionText,
  audioText,
  correctAnswer,
  options,
  conceptIds,
  explanation,
  commonMistakes = ["Confusing characters in the same Hiragana row", "Choosing the matching Katakana character"],
}) => ({
  _id: id,
  questionText,
  questionType: "multiple_choice",
  cognitiveType: layer,
  ...(audioText ? { audioText } : {}),
  options: options.map((text) => ({ text, isCorrect: text === correctAnswer })),
  correctAnswer,
  topic: "kana",
  subtopic: "hiragana recognition",
  skillId: "kana.hiragana",
  lessonIds: ["lesson-hiragana-recognition", "foundations-hiragana-k-row"],
  conceptIds,
  difficulty,
  tags: ["kana", "hiragana", "foundation", "k-row", layer],
  explanation,
  learningObjective: K_ROW_LEARNING_OBJECTIVES[layer],
  commonMistakes,
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

// K-row pool rebuilt to the Question-philosophy standard (replaces the old
// auto-generated character/sound/pair drills). 5 recognition, 5 production, 5 connection.
const kRowQuestions = [
  // Recognition: one per kana, kept few. Romaji allowed here only. 105 is the harder look-alike rung.
  createKRowQuestion({
    id: "q_foundations_hiragana_k_row_101",
    difficulty: "easy",
    questionText: "What sound does か represent?",
    correctAnswer: "ka",
    options: ["ko", "ka", "ki", "ku"],
    conceptIds: ["kana.hiragana.ka"],
    explanation: "か is 'ka'. Not 'ko' — こ is the stacked-curve kana, か has the cross stroke.",
  }),
  createKRowQuestion({
    id: "q_foundations_hiragana_k_row_102",
    difficulty: "easy",
    questionText: "What sound does き represent?",
    correctAnswer: "ki",
    options: ["ki", "ke", "ka", "ku"],
    conceptIds: ["kana.hiragana.ki"],
    explanation: "き is 'ki'. Not 'ke' — け is a single upright kana, き has the stacked strokes.",
  }),
  createKRowQuestion({
    id: "q_foundations_hiragana_k_row_103",
    difficulty: "easy",
    questionText: "What sound does く represent?",
    correctAnswer: "ku",
    options: ["ku", "ko", "ki", "ka"],
    conceptIds: ["kana.hiragana.ku"],
    explanation: "く is 'ku', a single angled stroke. Not 'ko' — こ is two separate strokes.",
  }),
  createKRowQuestion({
    id: "q_foundations_hiragana_k_row_104",
    difficulty: "easy",
    questionText: "What sound does け represent?",
    correctAnswer: "ke",
    options: ["ka", "ke", "ki", "ko"],
    conceptIds: ["kana.hiragana.ke"],
    explanation: "け is 'ke'. Not 'ka' — か has the small cross stroke, け stands upright.",
  }),
  createKRowQuestion({
    id: "q_foundations_hiragana_k_row_105",
    difficulty: "medium",
    questionText: "Which kana is こ?",
    correctAnswer: "こ",
    options: ["こ", "か", "く", "き"],
    conceptIds: ["kana.hiragana.ko"],
    explanation: "こ is 'ko', two stacked strokes. か is the look-alike to rule out — it carries the small cross stroke こ never has.",
    commonMistakes: ["Confusing こ with か"],
  }),

  // Production: hear the sound, pick the kana. audioText plays. Sound/look-alikes sit together.
  // 106 easy, 107 easy, 108 medium, 109 medium, 110 hard (ear-only, no situation help).
  createKRowQuestion({
    id: "q_foundations_hiragana_k_row_106",
    layer: "production",
    difficulty: "easy",
    questionText: "At the station, a voice says one sound. Which kana did you hear?",
    audioText: "か",
    correctAnswer: "か",
    options: ["か", "き", "く", "こ"],
    conceptIds: ["kana.hiragana.ka"],
    explanation: "You heard か, open and clear. The other three sit well apart from it, so this is a plain catch-the-sound step.",
    commonMistakes: ["Over-thinking a sound that stands on its own"],
  }),
  createKRowQuestion({
    id: "q_foundations_hiragana_k_row_107",
    layer: "production",
    difficulty: "easy",
    questionText: "Hana repeats a sound back to Grandma. Which kana did she hear?",
    audioText: "け",
    correctAnswer: "け",
    options: ["け", "か", "こ", "く"],
    conceptIds: ["kana.hiragana.ke"],
    explanation: "She heard け, with an 'e' vowel. None of the others share that vowel, so it stands alone.",
    commonMistakes: ["Over-thinking a sound that stands on its own"],
  }),
  createKRowQuestion({
    id: "q_foundations_hiragana_k_row_108",
    layer: "production",
    difficulty: "medium",
    questionText: "Grandma says the first sound of a word. Which kana did you hear?",
    audioText: "き",
    correctAnswer: "き",
    options: ["き", "く", "け", "か"],
    conceptIds: ["kana.hiragana.ki"],
    explanation: "You heard き ('ki'). く ('ku') is the trap — the closest K-row vowel by ear.",
    commonMistakes: ["Confusing き with く by ear"],
  }),
  createKRowQuestion({
    id: "q_foundations_hiragana_k_row_109",
    layer: "production",
    difficulty: "medium",
    questionText: "On the platform you catch one sound. Which kana was it?",
    audioText: "く",
    correctAnswer: "く",
    options: ["く", "こ", "き", "か"],
    conceptIds: ["kana.hiragana.ku"],
    explanation: "You heard く ('ku'). こ ('ko') is the trap — both are back vowels, close by ear.",
    commonMistakes: ["Confusing く with こ by ear"],
  }),
  createKRowQuestion({
    id: "q_foundations_hiragana_k_row_110",
    layer: "production",
    difficulty: "hard",
    questionText: "Listen. Which kana is this?",
    audioText: "こ",
    correctAnswer: "こ",
    options: ["こ", "く", "か", "け"],
    conceptIds: ["kana.hiragana.ko"],
    explanation: "こ is 'ko'. With no situation to lean on and く sitting right beside it, this is ear alone.",
    commonMistakes: ["Confusing こ with く by ear", "Expecting a situation to narrow it down"],
  }),

  // Connection: a golden-hour station. One short line, Japanese word, no romaji. あお is the
  // Vowels callback — answer once (115), tempting wrong option twice (112, 114).
  createKRowQuestion({
    id: "q_foundations_hiragana_k_row_111",
    layer: "connection",
    difficulty: "easy",
    questionText: "You need the train. One sign tells you where to catch it. Which word?",
    correctAnswer: "えき",
    options: ["えき", "かお", "こえ", "あか"],
    conceptIds: ["kana.hiragana.e", "kana.hiragana.ki"],
    explanation: "えき is station — the sign you need. The others are real words (face, voice, red) but none points you to the train.",
    commonMistakes: ["Picking a familiar word that is not the one on the sign"],
  }),
  createKRowQuestion({
    id: "q_foundations_hiragana_k_row_112",
    layer: "connection",
    difficulty: "medium",
    questionText: "The station sign glows in the low sun. Its colour is warm and bright. Which word?",
    correctAnswer: "あか",
    options: ["あか", "あお", "えき", "かお"],
    conceptIds: ["kana.hiragana.a", "kana.hiragana.ka"],
    explanation: "あか is red — the warm, lit sign. あお (blue) tempts because you just learned it for the sky, but this colour is red.",
    commonMistakes: ["Choosing あお, the colour from the Vowels lesson"],
  }),
  createKRowQuestion({
    id: "q_foundations_hiragana_k_row_113",
    layer: "connection",
    difficulty: "medium",
    questionText: "Grandma calls up the platform stairs. You can't see her yet, but you know her by this. Which word?",
    correctAnswer: "こえ",
    options: ["こえ", "かお", "えき", "あか"],
    conceptIds: ["kana.hiragana.ko", "kana.hiragana.e"],
    explanation: "こえ is voice — you heard her before you saw her. かお (face) tempts, but you know her here by sound, not sight.",
    commonMistakes: ["Choosing かお (face) when you only heard her"],
  }),
  createKRowQuestion({
    id: "q_foundations_hiragana_k_row_114",
    layer: "connection",
    difficulty: "medium",
    questionText: "On the platform Grandma turns toward the sunset, and the warm light lands on her. What are you looking at?",
    correctAnswer: "かお",
    options: ["かお", "こえ", "あお", "えき"],
    conceptIds: ["kana.hiragana.ka", "kana.hiragana.o"],
    explanation: "かお is face — lit by the sunset. あお (blue) tempts because the sky behind her is blue, but you are watching her face.",
    commonMistakes: ["Choosing あお because the sky behind is blue"],
  }),
  createKRowQuestion({
    id: "q_foundations_hiragana_k_row_115",
    layer: "connection",
    difficulty: "hard",
    questionText: "At dusk the whole sky over the station settles into one deep colour. Which word?",
    correctAnswer: "あお",
    options: ["あお", "あか", "えき", "かお"],
    conceptIds: ["kana.hiragana.a", "kana.hiragana.o"],
    explanation: "あお is blue — the deep dusk sky, a callback to the Vowels lesson. あか (red) is the strong rival because a sunset also reddens, but the settling dusk sky reads blue.",
    commonMistakes: ["Choosing あか because sunsets look red"],
  }),
];

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
      "lesson-hiragana-recognition"
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
      "lesson-hiragana-recognition"
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
      "lesson-hiragana-recognition"
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
  // Recognition: one per kana. Romaji is allowed in this layer only.
  // 004 is the one harder rung: お sits in the options as a look-alike to rule out.
  createVowelQuestion({
    id: "q_foundations_hiragana_vowels_004",
    difficulty: "medium",
    questionText: "What sound does あ represent?",
    correctAnswer: "a",
    options: ["o", "e", "a", "i"],
    conceptIds: ["kana.hiragana.a"],
    explanation: "あ is 'a'. The near-miss is 'o' (お): same open loop, but お is rounder.",
    commonMistakes: ["Confusing あ with お"],
  }),
  createVowelQuestion({
    id: "q_foundations_hiragana_vowels_005",
    questionText: "What sound does い represent?",
    correctAnswer: "i",
    options: ["i", "u", "a", "e"],
    conceptIds: ["kana.hiragana.i"],
    explanation: "い is 'i', bright and spread. Not 'e' — え is flatter and more open.",
    commonMistakes: ["Confusing い with え"],
  }),
  createVowelQuestion({
    id: "q_foundations_hiragana_vowels_006",
    questionText: "What sound does う represent?",
    correctAnswer: "u",
    options: ["e", "o", "i", "u"],
    conceptIds: ["kana.hiragana.u"],
    explanation: "う is 'u'. Not 'o' — う keeps the lips relaxed, not rounded.",
    commonMistakes: ["Confusing う with お"],
  }),
  createVowelQuestion({
    id: "q_foundations_hiragana_vowels_007",
    questionText: "What sound does え represent?",
    correctAnswer: "e",
    options: ["a", "e", "o", "u"],
    conceptIds: ["kana.hiragana.e"],
    explanation: "え is 'e', short and flat. Not 'i' — い is brighter and more spread.",
    commonMistakes: ["Confusing え with い"],
  }),
  createVowelQuestion({
    id: "q_foundations_hiragana_vowels_008",
    questionText: "What sound does お represent?",
    correctAnswer: "o",
    options: ["u", "a", "i", "o"],
    conceptIds: ["kana.hiragana.o"],
    explanation: "お is 'o', rounded with no glide. Not 'a' — あ is more open and unrounded.",
    commonMistakes: ["Confusing お with あ"],
  }),

  // Production: a one-line rooftop moment wraps the ear so these no longer repeat the in-lesson
  // sound check. Someone says a sound; the learner picks the kana. audioText plays the sound.
  // Spread: 024 easy, 025 medium, 026 medium, 027 easy, 028 hard (ear-only, no situation help).
  // Reworked from retired 014-018 (purpose changed: situation added), so they carry new IDs.
  createVowelQuestion({
    id: "q_foundations_hiragana_vowels_024",
    layer: "production",
    difficulty: "easy",
    questionText: "Hana points at the sky and says one sound. Which kana did she say?",
    audioText: "あ",
    correctAnswer: "あ",
    options: ["あ", "い", "え", "う"],
    conceptIds: ["kana.hiragana.a"],
    explanation: "She said あ, open and short. The other three sound clearly different, so this one is about catching the sound at all.",
    commonMistakes: ["Second-guessing a sound that stands on its own"],
  }),
  createVowelQuestion({
    id: "q_foundations_hiragana_vowels_025",
    layer: "production",
    difficulty: "medium",
    questionText: "Grandma says the first sound of a word. Which kana did you hear?",
    audioText: "い",
    correctAnswer: "い",
    options: ["い", "え", "う", "あ"],
    conceptIds: ["kana.hiragana.i"],
    explanation: "You heard い: bright, with the lips spread. え is the trap — flatter and more open, easy to mishear.",
    commonMistakes: ["Confusing い with え by ear"],
  }),
  createVowelQuestion({
    id: "q_foundations_hiragana_vowels_026",
    layer: "production",
    difficulty: "medium",
    questionText: "On the rooftop someone says one sound. Which kana was it?",
    audioText: "う",
    correctAnswer: "う",
    options: ["う", "お", "え", "い"],
    conceptIds: ["kana.hiragana.u"],
    explanation: "You heard う: relaxed lips, not pushed forward. お is the trap — rounded, and close to う by ear.",
    commonMistakes: ["Confusing う with お by ear"],
  }),
  createVowelQuestion({
    id: "q_foundations_hiragana_vowels_027",
    layer: "production",
    difficulty: "easy",
    questionText: "Hana repeats a sound back to Grandma. Which kana did she hear?",
    audioText: "え",
    correctAnswer: "え",
    options: ["え", "あ", "お", "う"],
    conceptIds: ["kana.hiragana.e"],
    explanation: "She heard え, short and flat. The other three sit well apart from it, so this is a plain catch-the-sound step.",
    commonMistakes: ["Over-thinking a sound that stands on its own"],
  }),
  createVowelQuestion({
    id: "q_foundations_hiragana_vowels_028",
    layer: "production",
    difficulty: "hard",
    questionText: "Listen. Which kana is this?",
    audioText: "お",
    correctAnswer: "お",
    options: ["お", "う", "あ", "え"],
    conceptIds: ["kana.hiragana.o"],
    explanation: "お is rounded with no glide. With no situation to lean on and う sitting right beside it, this is ear alone.",
    commonMistakes: ["Confusing お with う by ear", "Expecting a situation to narrow it down"],
  }),

  // Connection: the rooftop moment and the words the lesson built. No romaji in prompts or options.
  // Spread: 019 easy, 020 medium, 029 medium, 030 medium, 023 hard.
  createVowelQuestion({
    id: "q_foundations_hiragana_vowels_019",
    layer: "connection",
    difficulty: "easy",
    questionText: "Grandma looks at the clear evening sky and names its colour. What does she say?",
    correctAnswer: "あお",
    options: ["うえ", "あお", "あい", "いえ"],
    conceptIds: ["kana.hiragana.a", "kana.hiragana.o"],
    explanation: "あお is blue, the colour of the sky. うえ means up — it would point at the sky, not name its colour.",
    commonMistakes: ["Choosing うえ because the sky is above"],
  }),
  createVowelQuestion({
    id: "q_foundations_hiragana_vowels_020",
    layer: "connection",
    difficulty: "medium",
    questionText: "Hana's balloon floats high over her head. She points and calls out one word. Which one?",
    correctAnswer: "うえ",
    options: ["あお", "あい", "うえ", "おい"],
    conceptIds: ["kana.hiragana.u", "kana.hiragana.e"],
    explanation: "うえ means up, above — where the balloon is. あお (blue) tempts because the sky behind it is blue, but that is the colour, not the direction.",
    commonMistakes: ["Choosing あお because the sky is blue"],
  }),
  createVowelQuestion({
    id: "q_foundations_hiragana_vowels_029",
    layer: "connection",
    difficulty: "medium",
    questionText: "Grandma looks out at the sea at dusk and names its colour. Which word?",
    correctAnswer: "あお",
    options: ["あお", "うえ", "あい", "いえ"],
    conceptIds: ["kana.hiragana.a", "kana.hiragana.o"],
    explanation: "あお is blue — the sea and the sky both. うえ tempts because the sea sits below the rooftop, but that is direction, not colour.",
    commonMistakes: ["Choosing うえ because you look down at the sea"],
  }),
  createVowelQuestion({
    id: "q_foundations_hiragana_vowels_030",
    layer: "connection",
    difficulty: "medium",
    questionText: "Hana's balloon is caught in the tree above her. She points and shouts one word. Which word?",
    correctAnswer: "うえ",
    options: ["うえ", "あお", "あい", "おい"],
    conceptIds: ["kana.hiragana.u", "kana.hiragana.e"],
    explanation: "うえ is up, above — where the balloon is stuck. あお (blue) tempts because the sky behind the tree is blue, but she is pointing at a place, not a colour.",
    commonMistakes: ["Choosing あお because the sky behind is blue"],
  }),
  createVowelQuestion({
    id: "q_foundations_hiragana_vowels_023",
    layer: "connection",
    difficulty: "hard",
    questionText: "Grandma signs Hana's birthday card with one word for what she feels. Which word?",
    correctAnswer: "あい",
    options: ["あお", "いえ", "うえ", "あい"],
    conceptIds: ["kana.hiragana.a", "kana.hiragana.i"],
    explanation: "あい is love, built from あ and い. あお tempts because it also starts with あ, but it names a colour, not a feeling.",
    commonMistakes: ["Choosing あお because it also starts with あ"],
  }),
  ...kRowQuestions,
  ...sRowQuestions,
];

export default questions;

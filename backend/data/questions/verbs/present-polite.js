// Present polite verbs (verbs.present_polite)
const questions = [
  {
    "_id": "mock_005",
    "questionText": "Translate 'I eat sushi.' into Japanese.",
    "questionType": "fill_in_blank",
    "options": [],
    "correctAnswer": "わたしはすしをたべます",
    "topic": "verbs",
    "subtopic": "present tense verbs",
    "skillId": "verbs.present_polite",
    "lessonIds": [
      "lesson-present-polite-verbs"
    ],
    "conceptIds": [],
    "difficulty": "medium",
    "tags": [
      "verbs",
      "sentence building"
    ],
    "explanation": "を marks the object and たべます means to eat.",
    "learningObjective": "Construct simple present tense sentences.",
    "commonMistakes": [
      "Using は instead of を",
      "Incorrect verb conjugation"
    ]
  },
  {
    "_id": "mock_025",
    "questionText": "Translate 'I drink coffee every morning.'",
    "questionType": "fill_in_blank",
    "options": [],
    "correctAnswer": "まいあさコーヒーをのみます",
    "topic": "verbs",
    "subtopic": "daily routine",
    "skillId": "verbs.present_polite",
    "lessonIds": [
      "lesson-present-polite-verbs"
    ],
    "conceptIds": [],
    "difficulty": "medium",
    "tags": [
      "verbs",
      "habits",
      "food"
    ],
    "explanation": "まいあさ means every morning and のみます means drink.",
    "learningObjective": "Describe daily habits in Japanese.",
    "commonMistakes": [
      "Missing を particle",
      "Incorrect word order"
    ]
  },
  {
    "_id": "mock_038",
    "questionText": "Translate 'I will study Japanese tomorrow.'",
    "questionType": "fill_in_blank",
    "options": [],
    "correctAnswer": "あしたにほんごをべんきょうします",
    "topic": "grammar",
    "subtopic": "future intention",
    "skillId": "verbs.present_polite",
    "lessonIds": [
      "lesson-present-polite-verbs"
    ],
    "conceptIds": [],
    "difficulty": "hard",
    "tags": [
      "future",
      "study",
      "sentence building"
    ],
    "explanation": "Japanese often uses present polite form to indicate future actions.",
    "learningObjective": "Express future plans naturally.",
    "commonMistakes": [
      "Adding unnecessary future tense",
      "Incorrect particle usage"
    ]
  },
  {
    "_id": "mock_045",
    "questionText": "Translate 'She reads a newspaper every day.'",
    "questionType": "fill_in_blank",
    "options": [],
    "correctAnswer": "かのじょはまいにちしんぶんをよみます",
    "topic": "verbs",
    "subtopic": "daily habits",
    "skillId": "verbs.present_polite",
    "lessonIds": [
      "lesson-present-polite-verbs"
    ],
    "conceptIds": [],
    "difficulty": "medium",
    "tags": [
      "reading",
      "habits",
      "verbs"
    ],
    "explanation": "まいにち means every day and よみます means read.",
    "learningObjective": "Describe routines using verbs.",
    "commonMistakes": [
      "Forgetting は",
      "Incorrect object particle"
    ]
  },
  {
    "_id": "mock_077",
    "questionText": "Translate 'I will meet my friend tomorrow.'",
    "questionType": "fill_in_blank",
    "options": [],
    "correctAnswer": "あしたともだちにあいます",
    "topic": "verbs",
    "subtopic": "future plan",
    "skillId": "verbs.present_polite",
    "lessonIds": [
      "lesson-present-polite-verbs"
    ],
    "conceptIds": [],
    "difficulty": "medium",
    "tags": [
      "verbs"
    ],
    "explanation": "Japanese uses present tense for future.",
    "learningObjective": "Express future actions.",
    "commonMistakes": [
      "Adding unnecessary future tense markers",
      "Wrong particle"
    ]
  },
  {
    "_id": "mock_094",
    "questionText": "What does 〜ようにする mean?",
    "questionType": "translation_choice",
    "options": [
      {
        "text": "be able to do",
        "isCorrect": false
      },
      {
        "text": "must not do",
        "isCorrect": false
      },
      {
        "text": "make an effort to do",
        "isCorrect": true
      },
      {
        "text": "try doing once",
        "isCorrect": false
      }
    ],
    "correctAnswer": "make an effort to do",
    "topic": "grammar",
    "subtopic": "intentions",
    "skillId": "verbs.present_polite",
    "lessonIds": [
      "lesson-present-polite-verbs"
    ],
    "conceptIds": [],
    "difficulty": "hard",
    "tags": [
      "grammar"
    ],
    "explanation": "Indicates effort to do something regularly.",
    "learningObjective": "Express habits and efforts.",
    "commonMistakes": [
      "Confusing with intention form",
      "Incorrect verb pairing"
    ]
  },
  {
    "_id": "mock_095",
    "questionText": "Translate 'I will try not to be late.'",
    "questionType": "fill_in_blank",
    "options": [],
    "correctAnswer": "おくれないようにします",
    "topic": "grammar",
    "subtopic": "intentions",
    "skillId": "verbs.present_polite",
    "lessonIds": [
      "lesson-present-polite-verbs"
    ],
    "conceptIds": [],
    "difficulty": "hard",
    "tags": [
      "grammar"
    ],
    "explanation": "ないようにします expresses avoidance.",
    "learningObjective": "Express preventive intention.",
    "commonMistakes": [
      "Using negative incorrectly",
      "Wrong verb form"
    ]
  },
  {
    "_id": "mock_202",
    "questionText": "What is the polite present form of いく?",
    "questionType": "multiple_choice",
    "options": [
      {
        "text": "いきました",
        "isCorrect": false
      },
      {
        "text": "いきます",
        "isCorrect": true
      },
      {
        "text": "します",
        "isCorrect": false
      },
      {
        "text": "みずをのみます",
        "isCorrect": false
      }
    ],
    "correctAnswer": "いきます",
    "topic": "verbs",
    "subtopic": "present tense verbs",
    "skillId": "verbs.present_polite",
    "lessonIds": [
      "lesson-present-polite-verbs"
    ],
    "conceptIds": [],
    "difficulty": "easy",
    "tags": [
      "verbs",
      "present polite"
    ],
    "explanation": "The polite present/non-past form of いく is いきます.",
    "learningObjective": "Form polite present verbs.",
    "commonMistakes": [
      "Using dictionary form in polite speech",
      "Writing いくます"
    ]
  },
  {
    "_id": "mock_203",
    "questionText": "Translate: 'I drink water.'",
    "questionType": "fill_in_blank",
    "options": [],
    "correctAnswer": "みずをのみます",
    "topic": "verbs",
    "subtopic": "present tense verbs",
    "skillId": "verbs.present_polite",
    "lessonIds": [
      "lesson-present-polite-verbs"
    ],
    "conceptIds": [],
    "difficulty": "medium",
    "tags": [
      "verbs",
      "present polite",
      "sentence building"
    ],
    "explanation": "のみます is the polite present form of のむ, and みず is marked by を.",
    "learningObjective": "Use polite present verbs in simple sentences.",
    "commonMistakes": [
      "Using のむ in a polite sentence",
      "Omitting を"
    ]
  },
  {
    "_id": "mock_204",
    "questionText": "Choose the correct polite present verb: まいにちべんきょう___.",
    "questionType": "multiple_choice",
    "options": [
      {
        "text": "いきます",
        "isCorrect": false
      },
      {
        "text": "みずをのみます",
        "isCorrect": false
      },
      {
        "text": "いきました",
        "isCorrect": false
      },
      {
        "text": "します",
        "isCorrect": true
      }
    ],
    "correctAnswer": "します",
    "topic": "verbs",
    "subtopic": "present tense verbs",
    "skillId": "verbs.present_polite",
    "lessonIds": [
      "lesson-present-polite-verbs"
    ],
    "conceptIds": [],
    "difficulty": "easy",
    "tags": [
      "verbs",
      "present polite",
      "daily habits"
    ],
    "explanation": "べんきょうします means study in polite present/non-past form.",
    "learningObjective": "Recognize polite present verbs for daily habits.",
    "commonMistakes": [
      "Using する without polite ending",
      "Adding ます twice"
    ]
  }
];

export default questions;

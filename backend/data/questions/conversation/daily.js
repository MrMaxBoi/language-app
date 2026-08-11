// Daily greetings (greetings.daily)
const questions = [
  {
    "_id": "mock_002",
    "questionText": "Choose the correct greeting for the morning.",
    "questionType": "multiple_choice",
    "options": [
      {
        "text": "こんにちは",
        "isCorrect": false
      },
      {
        "text": "ありがとうございます",
        "isCorrect": false
      },
      {
        "text": "おやすみ",
        "isCorrect": false
      },
      {
        "text": "おはよう",
        "isCorrect": true
      }
    ],
    "correctAnswer": "おはよう",
    "topic": "greetings",
    "subtopic": "daily greetings",
    "skillId": "greetings.daily",
    "lessonIds": [
      "lesson-daily-greetings"
    ],
    "conceptIds": [],
    "difficulty": "easy",
    "tags": [
      "greetings",
      "daily conversation"
    ],
    "explanation": "おはよう is used to say good morning.",
    "learningObjective": "Use common Japanese greetings appropriately.",
    "commonMistakes": [
      "Using こんばんは in the morning",
      "Forgetting long vowel pronunciation"
    ]
  },
  {
    "_id": "mock_010",
    "questionText": "What does こんにちは mean?",
    "questionType": "translation_choice",
    "options": [
      {
        "text": "goodbye",
        "isCorrect": false
      },
      {
        "text": "a little",
        "isCorrect": false
      },
      {
        "text": "hello",
        "isCorrect": true
      },
      {
        "text": "good evening",
        "isCorrect": false
      }
    ],
    "correctAnswer": "hello",
    "topic": "greetings",
    "subtopic": "daily greetings",
    "skillId": "greetings.daily",
    "lessonIds": [
      "lesson-daily-greetings"
    ],
    "conceptIds": [],
    "difficulty": "easy",
    "tags": [
      "greetings",
      "conversation"
    ],
    "explanation": "こんにちは is a common daytime greeting.",
    "learningObjective": "Understand basic conversational phrases.",
    "commonMistakes": [
      "Using it late at night",
      "Misspelling the hiragana"
    ]
  },
  {
    "_id": "mock_022",
    "questionText": "How do you say 'thank you' politely?",
    "questionType": "translation_choice",
    "options": [
      {
        "text": "こんにちは",
        "isCorrect": false
      },
      {
        "text": "ありがとうございます",
        "isCorrect": true
      },
      {
        "text": "おはよう",
        "isCorrect": false
      },
      {
        "text": "おやすみ",
        "isCorrect": false
      }
    ],
    "correctAnswer": "ありがとうございます",
    "topic": "greetings",
    "subtopic": "polite expressions",
    "skillId": "greetings.daily",
    "lessonIds": [
      "lesson-daily-greetings"
    ],
    "conceptIds": [],
    "difficulty": "easy",
    "tags": [
      "politeness",
      "conversation"
    ],
    "explanation": "ありがとうございます is a polite expression of gratitude.",
    "learningObjective": "Use polite conversational phrases.",
    "commonMistakes": [
      "Using casual form in formal settings",
      "Misspelling kana"
    ]
  },
  {
    "_id": "mock_030",
    "questionText": "What does こんばんは mean?",
    "questionType": "translation_choice",
    "options": [
      {
        "text": "good evening",
        "isCorrect": true
      },
      {
        "text": "hello",
        "isCorrect": false
      },
      {
        "text": "goodbye",
        "isCorrect": false
      },
      {
        "text": "a little",
        "isCorrect": false
      }
    ],
    "correctAnswer": "good evening",
    "topic": "greetings",
    "subtopic": "daily greetings",
    "skillId": "greetings.daily",
    "lessonIds": [
      "lesson-daily-greetings"
    ],
    "conceptIds": [],
    "difficulty": "easy",
    "tags": [
      "greetings",
      "conversation"
    ],
    "explanation": "こんばんは is used during the evening.",
    "learningObjective": "Recognize time-based greetings.",
    "commonMistakes": [
      "Using in the morning",
      "Confusing with こんにちは"
    ]
  },
  {
    "_id": "mock_042",
    "questionText": "How do you say 'good night' in Japanese?",
    "questionType": "translation_choice",
    "options": [
      {
        "text": "ありがとうございます",
        "isCorrect": false
      },
      {
        "text": "おはよう",
        "isCorrect": false
      },
      {
        "text": "こんにちは",
        "isCorrect": false
      },
      {
        "text": "おやすみ",
        "isCorrect": true
      }
    ],
    "correctAnswer": "おやすみ",
    "topic": "greetings",
    "subtopic": "night expressions",
    "skillId": "greetings.daily",
    "lessonIds": [
      "lesson-daily-greetings"
    ],
    "conceptIds": [],
    "difficulty": "easy",
    "tags": [
      "greetings",
      "daily life"
    ],
    "explanation": "おやすみ is used before sleeping.",
    "learningObjective": "Use nighttime greetings appropriately.",
    "commonMistakes": [
      "Using こんばんは instead",
      "Using overly casual form in formal settings"
    ]
  },
  {
    "_id": "mock_050",
    "questionText": "What does さようなら mean?",
    "questionType": "translation_choice",
    "options": [
      {
        "text": "hello",
        "isCorrect": false
      },
      {
        "text": "a little",
        "isCorrect": false
      },
      {
        "text": "goodbye",
        "isCorrect": true
      },
      {
        "text": "good evening",
        "isCorrect": false
      }
    ],
    "correctAnswer": "goodbye",
    "topic": "greetings",
    "subtopic": "farewells",
    "skillId": "greetings.daily",
    "lessonIds": [
      "lesson-daily-greetings"
    ],
    "conceptIds": [],
    "difficulty": "easy",
    "tags": [
      "conversation",
      "farewell"
    ],
    "explanation": "さようなら is a formal goodbye.",
    "learningObjective": "Recognize common farewell expressions.",
    "commonMistakes": [
      "Using casually with close friends",
      "Incorrect pronunciation"
    ]
  },
  {
    "_id": "mock_052",
    "questionText": "How do you say 'good afternoon' in Japanese?",
    "questionType": "translation_choice",
    "options": [
      {
        "text": "こんにちは",
        "isCorrect": true
      },
      {
        "text": "おはよう",
        "isCorrect": false
      },
      {
        "text": "ありがとうございます",
        "isCorrect": false
      },
      {
        "text": "おやすみ",
        "isCorrect": false
      }
    ],
    "correctAnswer": "こんにちは",
    "topic": "greetings",
    "subtopic": "daily greetings",
    "skillId": "greetings.daily",
    "lessonIds": [
      "lesson-daily-greetings"
    ],
    "conceptIds": [],
    "difficulty": "easy",
    "tags": [
      "greetings",
      "conversation"
    ],
    "explanation": "こんにちは is used during daytime greetings.",
    "learningObjective": "Use appropriate daytime greetings.",
    "commonMistakes": [
      "Using in morning only",
      "Confusing with こんばんは"
    ]
  },
  {
    "_id": "mock_057",
    "questionText": "How do you say 'yes' in Japanese?",
    "questionType": "translation_choice",
    "options": [
      {
        "text": "ありがとうございます",
        "isCorrect": false
      },
      {
        "text": "おはよう",
        "isCorrect": false
      },
      {
        "text": "おやすみ",
        "isCorrect": false
      },
      {
        "text": "はい",
        "isCorrect": true
      }
    ],
    "correctAnswer": "はい",
    "topic": "greetings",
    "subtopic": "basic responses",
    "skillId": "greetings.daily",
    "lessonIds": [
      "lesson-daily-greetings"
    ],
    "conceptIds": [],
    "difficulty": "easy",
    "tags": [
      "conversation"
    ],
    "explanation": "はい means yes.",
    "learningObjective": "Use basic affirmative responses.",
    "commonMistakes": [
      "Overusing in informal context",
      "Pronunciation issues"
    ]
  },
  {
    "_id": "mock_324",
    "questionText": "How do you say 'good evening' in Japanese?",
    "questionType": "translation_choice",
    "options": [
      {
        "text": "こんばんは",
        "isCorrect": true
      },
      {
        "text": "またあした",
        "isCorrect": false
      },
      {
        "text": "おはよう",
        "isCorrect": false
      },
      {
        "text": "こんにちは",
        "isCorrect": false
      }
    ],
    "correctAnswer": "こんばんは",
    "topic": "conversation",
    "subtopic": "daily greetings",
    "skillId": "greetings.daily",
    "lessonIds": [
      "lesson-daily-greetings"
    ],
    "conceptIds": [],
    "difficulty": "easy",
    "tags": [
      "greetings",
      "conversation"
    ],
    "explanation": "こんばんは is the standard greeting for good evening.",
    "learningObjective": "Use daily greetings appropriately.",
    "commonMistakes": [
      "Writing こんばんわ",
      "Using おはよう at night"
    ]
  },
  {
    "_id": "mock_325",
    "questionText": "How do you say 'see you tomorrow'?",
    "questionType": "translation_choice",
    "options": [
      {
        "text": "こんばんは",
        "isCorrect": false
      },
      {
        "text": "おはよう",
        "isCorrect": false
      },
      {
        "text": "こんにちは",
        "isCorrect": false
      },
      {
        "text": "またあした",
        "isCorrect": true
      }
    ],
    "correctAnswer": "またあした",
    "topic": "conversation",
    "subtopic": "daily greetings",
    "skillId": "greetings.daily",
    "lessonIds": [
      "lesson-daily-greetings"
    ],
    "conceptIds": [],
    "difficulty": "easy",
    "tags": [
      "greetings",
      "conversation"
    ],
    "explanation": "またあした means see you tomorrow.",
    "learningObjective": "Recognize simple farewell phrases.",
    "commonMistakes": [
      "Confusing あした with あさ",
      "Using さようなら for every goodbye"
    ]
  }
];

export default questions;

// Te-form and requests (verbs.te_form)
const questions = [
  {
    "_id": "mock_063",
    "questionText": "What is the te-form of かきます?",
    "questionType": "fill_in_blank",
    "options": [],
    "correctAnswer": "かいて",
    "topic": "verbs",
    "subtopic": "te-form",
    "skillId": "verbs.te_form",
    "lessonIds": [
      "lesson-te-form-requests"
    ],
    "conceptIds": [],
    "difficulty": "medium",
    "tags": [
      "verbs"
    ],
    "explanation": "かきます becomes かいて in te-form.",
    "learningObjective": "Form te-forms of u-verbs.",
    "commonMistakes": [
      "Using かきますて",
      "Incorrect conjugation pattern"
    ]
  },
  {
    "_id": "mock_074",
    "questionText": "What is the te-form of のみます?",
    "questionType": "fill_in_blank",
    "options": [],
    "correctAnswer": "のんで",
    "topic": "verbs",
    "subtopic": "te-form",
    "skillId": "verbs.te_form",
    "lessonIds": [
      "lesson-te-form-requests"
    ],
    "conceptIds": [],
    "difficulty": "medium",
    "tags": [
      "verbs"
    ],
    "explanation": "のむ becomes のんで.",
    "learningObjective": "Conjugate te-forms.",
    "commonMistakes": [
      "Using のみて",
      "Incorrect stem change"
    ]
  },
  {
    "_id": "mock_075",
    "questionText": "Translate 'Please eat.'",
    "questionType": "fill_in_blank",
    "options": [],
    "correctAnswer": "たべてください",
    "topic": "grammar",
    "subtopic": "requests",
    "skillId": "verbs.te_form",
    "lessonIds": [
      "lesson-te-form-requests"
    ],
    "conceptIds": [],
    "difficulty": "medium",
    "tags": [
      "requests"
    ],
    "explanation": "てください is polite request form.",
    "learningObjective": "Make polite requests.",
    "commonMistakes": [
      "Using ますください",
      "Incorrect verb form"
    ]
  },
  {
    "_id": "mock_217",
    "questionText": "What is the te-form of たべます?",
    "questionType": "fill_in_blank",
    "options": [],
    "correctAnswer": "たべて",
    "topic": "verbs",
    "subtopic": "te-form",
    "skillId": "verbs.te_form",
    "lessonIds": [
      "lesson-te-form-requests"
    ],
    "conceptIds": [],
    "difficulty": "medium",
    "tags": [
      "verbs",
      "te-form"
    ],
    "explanation": "The te-form of たべる/たべます is たべて.",
    "learningObjective": "Recognize te-form of common verbs.",
    "commonMistakes": [
      "Writing たべって",
      "Keeping ます in te-form"
    ]
  },
  {
    "_id": "mock_218",
    "questionText": "What is the te-form of いきます?",
    "questionType": "fill_in_blank",
    "options": [],
    "correctAnswer": "いって",
    "topic": "verbs",
    "subtopic": "te-form",
    "skillId": "verbs.te_form",
    "lessonIds": [
      "lesson-te-form-requests"
    ],
    "conceptIds": [],
    "difficulty": "medium",
    "tags": [
      "verbs",
      "te-form",
      "irregular"
    ],
    "explanation": "いく has the common te-form いって.",
    "learningObjective": "Recognize irregular/common te-form patterns.",
    "commonMistakes": [
      "Writing いいて",
      "Keeping いきます"
    ]
  },
  {
    "_id": "mock_219",
    "questionText": "Translate: 'Please eat.'",
    "questionType": "fill_in_blank",
    "options": [],
    "correctAnswer": "たべてください",
    "topic": "verbs",
    "subtopic": "te-form",
    "skillId": "verbs.te_form",
    "lessonIds": [
      "lesson-te-form-requests"
    ],
    "conceptIds": [],
    "difficulty": "medium",
    "tags": [
      "verbs",
      "te-form",
      "requests"
    ],
    "explanation": "Te-form plus ください creates a polite request.",
    "learningObjective": "Use te-form to make requests.",
    "commonMistakes": [
      "Using たべますください",
      "Dropping ください in polite request context"
    ]
  },
  {
    "_id": "mock_220",
    "questionText": "Translate: 'Please drink water.'",
    "questionType": "fill_in_blank",
    "options": [],
    "correctAnswer": "みずをのんでください",
    "topic": "verbs",
    "subtopic": "te-form",
    "skillId": "verbs.te_form",
    "lessonIds": [
      "lesson-te-form-requests"
    ],
    "conceptIds": [],
    "difficulty": "medium",
    "tags": [
      "verbs",
      "te-form",
      "requests"
    ],
    "explanation": "The te-form of のむ is のんで, followed by ください.",
    "learningObjective": "Use te-form requests with objects.",
    "commonMistakes": [
      "Writing のみてください",
      "Omitting を"
    ]
  },
  {
    "_id": "mock_221",
    "questionText": "What is the te-form of よみます?",
    "questionType": "fill_in_blank",
    "options": [],
    "correctAnswer": "よんで",
    "topic": "verbs",
    "subtopic": "te-form",
    "skillId": "verbs.te_form",
    "lessonIds": [
      "lesson-te-form-requests"
    ],
    "conceptIds": [],
    "difficulty": "medium",
    "tags": [
      "verbs",
      "te-form"
    ],
    "explanation": "よむ becomes よんで in te-form.",
    "learningObjective": "Form te-form for mu-ending verbs.",
    "commonMistakes": [
      "Writing よみて",
      "Using よんだ instead"
    ]
  },
  {
    "_id": "mock_222",
    "questionText": "Choose the correct request: ここに名前を___.",
    "questionType": "multiple_choice",
    "options": [
      {
        "text": "いって",
        "isCorrect": false
      },
      {
        "text": "かいて",
        "isCorrect": false
      },
      {
        "text": "たべて",
        "isCorrect": false
      },
      {
        "text": "かいてください",
        "isCorrect": true
      }
    ],
    "correctAnswer": "かいてください",
    "topic": "verbs",
    "subtopic": "te-form",
    "skillId": "verbs.te_form",
    "lessonIds": [
      "lesson-te-form-requests"
    ],
    "conceptIds": [],
    "difficulty": "medium",
    "tags": [
      "verbs",
      "te-form",
      "requests"
    ],
    "explanation": "かいてください means please write.",
    "learningObjective": "Use te-form requests in practical contexts.",
    "commonMistakes": [
      "Using かきますください",
      "Using past form かきました"
    ]
  },
  {
    "_id": "mock_223",
    "questionText": "What does まってください mean?",
    "questionType": "translation_choice",
    "options": [
      {
        "text": "a little",
        "isCorrect": false
      },
      {
        "text": "action location",
        "isCorrect": false
      },
      {
        "text": "please wait",
        "isCorrect": true
      },
      {
        "text": "completion or regret",
        "isCorrect": false
      }
    ],
    "correctAnswer": "please wait",
    "topic": "verbs",
    "subtopic": "te-form",
    "skillId": "verbs.te_form",
    "lessonIds": [
      "lesson-te-form-requests"
    ],
    "conceptIds": [],
    "difficulty": "easy",
    "tags": [
      "verbs",
      "te-form",
      "requests"
    ],
    "explanation": "まって is the te-form of まつ, and ください makes it a polite request.",
    "learningObjective": "Recognize common te-form request expressions.",
    "commonMistakes": [
      "Confusing with もってください",
      "Ignoring ください"
    ]
  }
];

export default questions;

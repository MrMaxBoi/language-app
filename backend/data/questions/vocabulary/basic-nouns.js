// Basic nouns (vocab.basic_nouns)
const questions = [
  {
    "_id": "mock_001",
    "questionText": "What is the Japanese word for 'water'?",
    "questionType": "translation_choice",
    "options": [
      {
        "text": "みず",
        "isCorrect": true
      },
      {
        "text": "いす",
        "isCorrect": false
      },
      {
        "text": "かさ",
        "isCorrect": false
      },
      {
        "text": "ほん",
        "isCorrect": false
      }
    ],
    "correctAnswer": "みず",
    "topic": "vocabulary",
    "subtopic": "basic nouns",
    "skillId": "vocab.basic_nouns",
    "lessonIds": [
      "lesson-basic-nouns"
    ],
    "conceptIds": [],
    "difficulty": "easy",
    "tags": [
      "vocabulary",
      "basic",
      "nouns"
    ],
    "explanation": "みず means water in Japanese.",
    "learningObjective": "Recognize common everyday vocabulary.",
    "commonMistakes": [
      "Confusing みず with おちゃ",
      "Writing ミズ instead of みず"
    ]
  },
  {
    "_id": "mock_041",
    "questionText": "What is the Japanese word for 'book'?",
    "questionType": "translation_choice",
    "options": [
      {
        "text": "ほん",
        "isCorrect": true
      },
      {
        "text": "いす",
        "isCorrect": false
      },
      {
        "text": "おかね",
        "isCorrect": false
      },
      {
        "text": "かさ",
        "isCorrect": false
      }
    ],
    "correctAnswer": "ほん",
    "topic": "vocabulary",
    "subtopic": "objects",
    "skillId": "vocab.basic_nouns",
    "lessonIds": [
      "lesson-basic-nouns"
    ],
    "conceptIds": [],
    "difficulty": "easy",
    "tags": [
      "objects",
      "reading"
    ],
    "explanation": "ほん means book.",
    "learningObjective": "Identify common object vocabulary.",
    "commonMistakes": [
      "Confusing with ノート",
      "Incorrect kana"
    ]
  },
  {
    "_id": "mock_056",
    "questionText": "What is the Japanese word for 'money'?",
    "questionType": "translation_choice",
    "options": [
      {
        "text": "おかね",
        "isCorrect": true
      },
      {
        "text": "いす",
        "isCorrect": false
      },
      {
        "text": "かさ",
        "isCorrect": false
      },
      {
        "text": "ほん",
        "isCorrect": false
      }
    ],
    "correctAnswer": "おかね",
    "topic": "vocabulary",
    "subtopic": "daily objects",
    "skillId": "vocab.basic_nouns",
    "lessonIds": [
      "lesson-basic-nouns"
    ],
    "conceptIds": [],
    "difficulty": "easy",
    "tags": [
      "daily life"
    ],
    "explanation": "おかね means money.",
    "learningObjective": "Recognize essential daily vocabulary.",
    "commonMistakes": [
      "Confusing with かね (casual form)",
      "Incorrect kanji usage"
    ]
  },
  {
    "_id": "mock_082",
    "questionText": "What is the meaning of すこし?",
    "questionType": "multiple_choice",
    "options": [
      {
        "text": "bag",
        "isCorrect": false
      },
      {
        "text": "desk",
        "isCorrect": false
      },
      {
        "text": "house",
        "isCorrect": false
      },
      {
        "text": "a little",
        "isCorrect": true
      }
    ],
    "correctAnswer": "a little",
    "topic": "vocabulary",
    "subtopic": "quantity",
    "skillId": "vocab.basic_nouns",
    "lessonIds": [
      "lesson-basic-nouns"
    ],
    "conceptIds": [],
    "difficulty": "medium",
    "tags": [
      "vocabulary"
    ],
    "explanation": "すこし means a little.",
    "learningObjective": "Express quantity.",
    "commonMistakes": [
      "Confusing with たくさん",
      "Incorrect placement"
    ]
  },
  {
    "_id": "mock_224",
    "questionText": "What is the Japanese word for 'book'?",
    "questionType": "translation_choice",
    "options": [
      {
        "text": "みず",
        "isCorrect": false
      },
      {
        "text": "ほん",
        "isCorrect": true
      },
      {
        "text": "いす",
        "isCorrect": false
      },
      {
        "text": "かさ",
        "isCorrect": false
      }
    ],
    "correctAnswer": "ほん",
    "topic": "vocabulary",
    "subtopic": "basic nouns",
    "skillId": "vocab.basic_nouns",
    "lessonIds": [
      "lesson-basic-nouns"
    ],
    "conceptIds": [],
    "difficulty": "easy",
    "tags": [
      "vocabulary",
      "basic nouns"
    ],
    "explanation": "ほん means book.",
    "learningObjective": "Recognize high-frequency everyday nouns.",
    "commonMistakes": [
      "Confusing ほん with えん",
      "Forgetting the nasal ん"
    ]
  },
  {
    "_id": "mock_225",
    "questionText": "What does かばん mean?",
    "questionType": "translation_choice",
    "options": [
      {
        "text": "bag",
        "isCorrect": true
      },
      {
        "text": "desk",
        "isCorrect": false
      },
      {
        "text": "house",
        "isCorrect": false
      },
      {
        "text": "a little",
        "isCorrect": false
      }
    ],
    "correctAnswer": "bag",
    "topic": "vocabulary",
    "subtopic": "basic nouns",
    "skillId": "vocab.basic_nouns",
    "lessonIds": [
      "lesson-basic-nouns"
    ],
    "conceptIds": [],
    "difficulty": "easy",
    "tags": [
      "vocabulary",
      "basic nouns",
      "objects"
    ],
    "explanation": "かばん means bag.",
    "learningObjective": "Recognize common object nouns.",
    "commonMistakes": [
      "Confusing かばん with かぞく",
      "Dropping ん"
    ]
  },
  {
    "_id": "mock_226",
    "questionText": "What is the Japanese word for 'chair'?",
    "questionType": "translation_choice",
    "options": [
      {
        "text": "かさ",
        "isCorrect": false
      },
      {
        "text": "ほん",
        "isCorrect": false
      },
      {
        "text": "みず",
        "isCorrect": false
      },
      {
        "text": "いす",
        "isCorrect": true
      }
    ],
    "correctAnswer": "いす",
    "topic": "vocabulary",
    "subtopic": "basic nouns",
    "skillId": "vocab.basic_nouns",
    "lessonIds": [
      "lesson-basic-nouns"
    ],
    "conceptIds": [],
    "difficulty": "easy",
    "tags": [
      "vocabulary",
      "basic nouns",
      "objects"
    ],
    "explanation": "いす means chair.",
    "learningObjective": "Recognize everyday object nouns.",
    "commonMistakes": [
      "Confusing いす with いえ",
      "Using English loanword unnecessarily"
    ]
  },
  {
    "_id": "mock_227",
    "questionText": "What does つくえ mean?",
    "questionType": "translation_choice",
    "options": [
      {
        "text": "house",
        "isCorrect": false
      },
      {
        "text": "a little",
        "isCorrect": false
      },
      {
        "text": "desk",
        "isCorrect": true
      },
      {
        "text": "bag",
        "isCorrect": false
      }
    ],
    "correctAnswer": "desk",
    "topic": "vocabulary",
    "subtopic": "basic nouns",
    "skillId": "vocab.basic_nouns",
    "lessonIds": [
      "lesson-basic-nouns"
    ],
    "conceptIds": [],
    "difficulty": "easy",
    "tags": [
      "vocabulary",
      "basic nouns",
      "objects"
    ],
    "explanation": "つくえ means desk.",
    "learningObjective": "Recognize common classroom/object nouns.",
    "commonMistakes": [
      "Confusing つくえ with いす",
      "Misreading つ"
    ]
  },
  {
    "_id": "mock_228",
    "questionText": "What is the Japanese word for 'umbrella'?",
    "questionType": "translation_choice",
    "options": [
      {
        "text": "みず",
        "isCorrect": false
      },
      {
        "text": "かさ",
        "isCorrect": true
      },
      {
        "text": "いす",
        "isCorrect": false
      },
      {
        "text": "ほん",
        "isCorrect": false
      }
    ],
    "correctAnswer": "かさ",
    "topic": "vocabulary",
    "subtopic": "basic nouns",
    "skillId": "vocab.basic_nouns",
    "lessonIds": [
      "lesson-basic-nouns"
    ],
    "conceptIds": [],
    "difficulty": "easy",
    "tags": [
      "vocabulary",
      "basic nouns",
      "objects"
    ],
    "explanation": "かさ means umbrella.",
    "learningObjective": "Recognize everyday nouns.",
    "commonMistakes": [
      "Confusing かさ with かぜ",
      "Adding honorific お unnecessarily"
    ]
  },
  {
    "_id": "mock_229",
    "questionText": "What does いえ mean?",
    "questionType": "translation_choice",
    "options": [
      {
        "text": "house",
        "isCorrect": true
      },
      {
        "text": "bag",
        "isCorrect": false
      },
      {
        "text": "desk",
        "isCorrect": false
      },
      {
        "text": "a little",
        "isCorrect": false
      }
    ],
    "correctAnswer": "house",
    "topic": "vocabulary",
    "subtopic": "basic nouns",
    "skillId": "vocab.basic_nouns",
    "lessonIds": [
      "lesson-basic-nouns"
    ],
    "conceptIds": [],
    "difficulty": "easy",
    "tags": [
      "vocabulary",
      "basic nouns",
      "places"
    ],
    "explanation": "いえ means house or home.",
    "learningObjective": "Recognize high-frequency place/object nouns.",
    "commonMistakes": [
      "Confusing いえ with えき",
      "Using うち in every context"
    ]
  }
];

export default questions;

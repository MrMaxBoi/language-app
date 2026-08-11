// Word recognition (reading.word_recognition)
const questions = [
  {
    "_id": "mock_112",
    "questionText": "Read this word: ねこ",
    "questionType": "multiple_choice",
    "options": [
      {
        "text": "family",
        "isCorrect": false
      },
      {
        "text": "friend",
        "isCorrect": false
      },
      {
        "text": "rice",
        "isCorrect": false
      },
      {
        "text": "cat",
        "isCorrect": true
      }
    ],
    "correctAnswer": "cat",
    "topic": "reading",
    "subtopic": "word recognition",
    "skillId": "reading.word_recognition",
    "lessonIds": [
      "lesson-word-recognition"
    ],
    "conceptIds": [],
    "difficulty": "easy",
    "tags": [
      "reading",
      "word recognition"
    ],
    "explanation": "ねこ means cat.",
    "learningObjective": "Recognize familiar words in kana.",
    "commonMistakes": [
      "Reading kana one by one without meaning",
      "Confusing ね with れ"
    ]
  },
  {
    "_id": "mock_127",
    "questionText": "Read this word: みず",
    "questionType": "multiple_choice",
    "options": [
      {
        "text": "cat",
        "isCorrect": false
      },
      {
        "text": "family",
        "isCorrect": false
      },
      {
        "text": "friend",
        "isCorrect": false
      },
      {
        "text": "water",
        "isCorrect": true
      }
    ],
    "correctAnswer": "water",
    "topic": "reading",
    "subtopic": "word recognition",
    "skillId": "reading.word_recognition",
    "lessonIds": [
      "lesson-word-recognition"
    ],
    "conceptIds": [],
    "difficulty": "easy",
    "tags": [
      "reading",
      "word recognition"
    ],
    "explanation": "みず means water.",
    "learningObjective": "Recognize familiar words in kana.",
    "commonMistakes": [
      "Confusing み with に",
      "Reading the kana without recalling meaning"
    ]
  },
  {
    "_id": "mock_128",
    "questionText": "Read this word: えき",
    "questionType": "multiple_choice",
    "options": [
      {
        "text": "family",
        "isCorrect": false
      },
      {
        "text": "friend",
        "isCorrect": false
      },
      {
        "text": "station",
        "isCorrect": true
      },
      {
        "text": "cat",
        "isCorrect": false
      }
    ],
    "correctAnswer": "station",
    "topic": "reading",
    "subtopic": "word recognition",
    "skillId": "reading.word_recognition",
    "lessonIds": [
      "lesson-word-recognition"
    ],
    "conceptIds": [],
    "difficulty": "easy",
    "tags": [
      "reading",
      "word recognition",
      "travel"
    ],
    "explanation": "えき means station.",
    "learningObjective": "Recognize familiar place and travel words.",
    "commonMistakes": [
      "Confusing え with さ",
      "Mistaking it for train"
    ]
  },
  {
    "_id": "mock_129",
    "questionText": "Read this word: ごはん",
    "questionType": "multiple_choice",
    "options": [
      {
        "text": "friend",
        "isCorrect": false
      },
      {
        "text": "rice",
        "isCorrect": true
      },
      {
        "text": "cat",
        "isCorrect": false
      },
      {
        "text": "family",
        "isCorrect": false
      }
    ],
    "correctAnswer": "rice",
    "topic": "reading",
    "subtopic": "word recognition",
    "skillId": "reading.word_recognition",
    "lessonIds": [
      "lesson-word-recognition"
    ],
    "conceptIds": [],
    "difficulty": "easy",
    "tags": [
      "reading",
      "word recognition",
      "food"
    ],
    "explanation": "ごはん means cooked rice or meal.",
    "learningObjective": "Recognize familiar food words.",
    "commonMistakes": [
      "Confusing は pronunciation in words and particles",
      "Forgetting dakuten in ご"
    ]
  },
  {
    "_id": "mock_130",
    "questionText": "Read this word: せんせい",
    "questionType": "multiple_choice",
    "options": [
      {
        "text": "cat",
        "isCorrect": false
      },
      {
        "text": "family",
        "isCorrect": false
      },
      {
        "text": "friend",
        "isCorrect": false
      },
      {
        "text": "teacher",
        "isCorrect": true
      }
    ],
    "correctAnswer": "teacher",
    "topic": "reading",
    "subtopic": "word recognition",
    "skillId": "reading.word_recognition",
    "lessonIds": [
      "lesson-word-recognition"
    ],
    "conceptIds": [],
    "difficulty": "easy",
    "tags": [
      "reading",
      "word recognition",
      "people"
    ],
    "explanation": "せんせい means teacher.",
    "learningObjective": "Recognize familiar people words.",
    "commonMistakes": [
      "Missing the nasal ん",
      "Shortening the long vowel"
    ]
  },
  {
    "_id": "mock_131",
    "questionText": "Read this word: がっこう",
    "questionType": "multiple_choice",
    "options": [
      {
        "text": "family",
        "isCorrect": false
      },
      {
        "text": "friend",
        "isCorrect": false
      },
      {
        "text": "school",
        "isCorrect": true
      },
      {
        "text": "cat",
        "isCorrect": false
      }
    ],
    "correctAnswer": "school",
    "topic": "reading",
    "subtopic": "word recognition",
    "skillId": "reading.word_recognition",
    "lessonIds": [
      "lesson-word-recognition"
    ],
    "conceptIds": [],
    "difficulty": "easy",
    "tags": [
      "reading",
      "word recognition",
      "school"
    ],
    "explanation": "がっこう means school.",
    "learningObjective": "Recognize familiar school words.",
    "commonMistakes": [
      "Ignoring small っ",
      "Forgetting the long vowel"
    ]
  },
  {
    "_id": "mock_132",
    "questionText": "Read this word: おちゃ",
    "questionType": "multiple_choice",
    "options": [
      {
        "text": "friend",
        "isCorrect": false
      },
      {
        "text": "tea",
        "isCorrect": true
      },
      {
        "text": "cat",
        "isCorrect": false
      },
      {
        "text": "family",
        "isCorrect": false
      }
    ],
    "correctAnswer": "tea",
    "topic": "reading",
    "subtopic": "word recognition",
    "skillId": "reading.word_recognition",
    "lessonIds": [
      "lesson-word-recognition"
    ],
    "conceptIds": [],
    "difficulty": "easy",
    "tags": [
      "reading",
      "word recognition",
      "food"
    ],
    "explanation": "おちゃ means tea.",
    "learningObjective": "Recognize familiar food and drink words.",
    "commonMistakes": [
      "Reading small ゃ as full や",
      "Confusing おちゃ with おかし"
    ]
  },
  {
    "_id": "mock_133",
    "questionText": "Read this word: ともだち",
    "questionType": "multiple_choice",
    "options": [
      {
        "text": "friend",
        "isCorrect": true
      },
      {
        "text": "cat",
        "isCorrect": false
      },
      {
        "text": "family",
        "isCorrect": false
      },
      {
        "text": "rice",
        "isCorrect": false
      }
    ],
    "correctAnswer": "friend",
    "topic": "reading",
    "subtopic": "word recognition",
    "skillId": "reading.word_recognition",
    "lessonIds": [
      "lesson-word-recognition"
    ],
    "conceptIds": [],
    "difficulty": "easy",
    "tags": [
      "reading",
      "word recognition",
      "people"
    ],
    "explanation": "ともだち means friend.",
    "learningObjective": "Recognize familiar people words.",
    "commonMistakes": [
      "Missing dakuten in だ",
      "Confusing と with こ"
    ]
  },
  {
    "_id": "mock_134",
    "questionText": "Read this word: でんしゃ",
    "questionType": "multiple_choice",
    "options": [
      {
        "text": "cat",
        "isCorrect": false
      },
      {
        "text": "family",
        "isCorrect": false
      },
      {
        "text": "friend",
        "isCorrect": false
      },
      {
        "text": "train",
        "isCorrect": true
      }
    ],
    "correctAnswer": "train",
    "topic": "reading",
    "subtopic": "word recognition",
    "skillId": "reading.word_recognition",
    "lessonIds": [
      "lesson-word-recognition"
    ],
    "conceptIds": [],
    "difficulty": "easy",
    "tags": [
      "reading",
      "word recognition",
      "transportation"
    ],
    "explanation": "でんしゃ means train.",
    "learningObjective": "Recognize familiar transportation words.",
    "commonMistakes": [
      "Reading small ゃ as full や",
      "Confusing でんしゃ with えき"
    ]
  },
  {
    "_id": "mock_152",
    "questionText": "Read this word: かぞく",
    "questionType": "multiple_choice",
    "options": [
      {
        "text": "cat",
        "isCorrect": false
      },
      {
        "text": "friend",
        "isCorrect": false
      },
      {
        "text": "rice",
        "isCorrect": false
      },
      {
        "text": "family",
        "isCorrect": true
      }
    ],
    "correctAnswer": "family",
    "topic": "reading",
    "subtopic": "word recognition",
    "skillId": "reading.word_recognition",
    "lessonIds": [
      "lesson-word-recognition"
    ],
    "conceptIds": [],
    "difficulty": "easy",
    "tags": [
      "reading",
      "word recognition",
      "family"
    ],
    "explanation": "かぞく means family.",
    "learningObjective": "Recognize familiar family vocabulary in kana.",
    "commonMistakes": [
      "Confusing ぞ with そ",
      "Reading kana without recalling meaning"
    ]
  }
];

export default questions;

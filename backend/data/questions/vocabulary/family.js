// Family vocabulary (vocab.family)
const questions = [
  {
    "_id": "mock_105",
    "questionText": "What is the Japanese word for 'mother' in a general/polite context?",
    "questionType": "translation_choice",
    "options": [
      {
        "text": "あね",
        "isCorrect": false
      },
      {
        "text": "いもうと",
        "isCorrect": false
      },
      {
        "text": "おとうさん",
        "isCorrect": false
      },
      {
        "text": "おかあさん",
        "isCorrect": true
      }
    ],
    "correctAnswer": "おかあさん",
    "topic": "vocabulary",
    "subtopic": "family",
    "skillId": "vocab.family",
    "lessonIds": [
      "lesson-family-vocabulary"
    ],
    "conceptIds": [],
    "difficulty": "easy",
    "tags": [
      "vocabulary",
      "family"
    ],
    "explanation": "おかあさん is a common polite word for mother.",
    "learningObjective": "Recognize common family vocabulary.",
    "commonMistakes": [
      "Confusing おかあさん with おとうさん",
      "Omitting the long vowel"
    ]
  },
  {
    "_id": "mock_246",
    "questionText": "What is the Japanese word for 'father' in a general/polite context?",
    "questionType": "translation_choice",
    "options": [
      {
        "text": "おかあさん",
        "isCorrect": false
      },
      {
        "text": "おとうさん",
        "isCorrect": true
      },
      {
        "text": "あね",
        "isCorrect": false
      },
      {
        "text": "いもうと",
        "isCorrect": false
      }
    ],
    "correctAnswer": "おとうさん",
    "topic": "vocabulary",
    "subtopic": "family",
    "skillId": "vocab.family",
    "lessonIds": [
      "lesson-family-vocabulary"
    ],
    "conceptIds": [],
    "difficulty": "easy",
    "tags": [
      "vocabulary",
      "family"
    ],
    "explanation": "おとうさん is a common polite word for father.",
    "learningObjective": "Recognize common family vocabulary.",
    "commonMistakes": [
      "Confusing with おかあさん",
      "Shortening the long vowel"
    ]
  },
  {
    "_id": "mock_247",
    "questionText": "What does あに mean?",
    "questionType": "translation_choice",
    "options": [
      {
        "text": "older brother",
        "isCorrect": true
      },
      {
        "text": "family",
        "isCorrect": false
      },
      {
        "text": "parents",
        "isCorrect": false
      },
      {
        "text": "younger brother",
        "isCorrect": false
      }
    ],
    "correctAnswer": "older brother",
    "topic": "vocabulary",
    "subtopic": "family",
    "skillId": "vocab.family",
    "lessonIds": [
      "lesson-family-vocabulary"
    ],
    "conceptIds": [],
    "difficulty": "medium",
    "tags": [
      "vocabulary",
      "family"
    ],
    "explanation": "あに means one's own older brother.",
    "learningObjective": "Recognize family vocabulary.",
    "commonMistakes": [
      "Confusing with おにいさん",
      "Using it for someone else's brother"
    ]
  },
  {
    "_id": "mock_248",
    "questionText": "What is the Japanese word for 'older sister'?",
    "questionType": "translation_choice",
    "options": [
      {
        "text": "いもうと",
        "isCorrect": false
      },
      {
        "text": "おかあさん",
        "isCorrect": false
      },
      {
        "text": "おとうさん",
        "isCorrect": false
      },
      {
        "text": "あね",
        "isCorrect": true
      }
    ],
    "correctAnswer": "あね",
    "topic": "vocabulary",
    "subtopic": "family",
    "skillId": "vocab.family",
    "lessonIds": [
      "lesson-family-vocabulary"
    ],
    "conceptIds": [],
    "difficulty": "medium",
    "tags": [
      "vocabulary",
      "family"
    ],
    "explanation": "あね means one's own older sister.",
    "learningObjective": "Recognize family vocabulary.",
    "commonMistakes": [
      "Confusing with おねえさん",
      "Using it for someone else's sister"
    ]
  },
  {
    "_id": "mock_249",
    "questionText": "What does おとうと mean?",
    "questionType": "translation_choice",
    "options": [
      {
        "text": "older brother",
        "isCorrect": false
      },
      {
        "text": "parents",
        "isCorrect": false
      },
      {
        "text": "younger brother",
        "isCorrect": true
      },
      {
        "text": "family",
        "isCorrect": false
      }
    ],
    "correctAnswer": "younger brother",
    "topic": "vocabulary",
    "subtopic": "family",
    "skillId": "vocab.family",
    "lessonIds": [
      "lesson-family-vocabulary"
    ],
    "conceptIds": [],
    "difficulty": "medium",
    "tags": [
      "vocabulary",
      "family"
    ],
    "explanation": "おとうと means younger brother.",
    "learningObjective": "Recognize family vocabulary.",
    "commonMistakes": [
      "Confusing with おとうさん",
      "Omitting long vowel"
    ]
  },
  {
    "_id": "mock_250",
    "questionText": "What is the Japanese word for 'younger sister'?",
    "questionType": "translation_choice",
    "options": [
      {
        "text": "いもうと",
        "isCorrect": true
      },
      {
        "text": "あね",
        "isCorrect": false
      },
      {
        "text": "おかあさん",
        "isCorrect": false
      },
      {
        "text": "おとうさん",
        "isCorrect": false
      }
    ],
    "correctAnswer": "いもうと",
    "topic": "vocabulary",
    "subtopic": "family",
    "skillId": "vocab.family",
    "lessonIds": [
      "lesson-family-vocabulary"
    ],
    "conceptIds": [],
    "difficulty": "medium",
    "tags": [
      "vocabulary",
      "family"
    ],
    "explanation": "いもうと means younger sister.",
    "learningObjective": "Recognize family vocabulary.",
    "commonMistakes": [
      "Confusing with いもうとさん",
      "Shortening the long vowel"
    ]
  },
  {
    "_id": "mock_251",
    "questionText": "What does かぞく mean?",
    "questionType": "translation_choice",
    "options": [
      {
        "text": "older brother",
        "isCorrect": false
      },
      {
        "text": "parents",
        "isCorrect": false
      },
      {
        "text": "younger brother",
        "isCorrect": false
      },
      {
        "text": "family",
        "isCorrect": true
      }
    ],
    "correctAnswer": "family",
    "topic": "vocabulary",
    "subtopic": "family",
    "skillId": "vocab.family",
    "lessonIds": [
      "lesson-family-vocabulary"
    ],
    "conceptIds": [],
    "difficulty": "easy",
    "tags": [
      "vocabulary",
      "family"
    ],
    "explanation": "かぞく means family.",
    "learningObjective": "Recognize common family terms.",
    "commonMistakes": [
      "Confusing かぞく with がくせい",
      "Missing dakuten in ぞ"
    ]
  },
  {
    "_id": "mock_252",
    "questionText": "What is the Japanese word for 'child'?",
    "questionType": "translation_choice",
    "options": [
      {
        "text": "いもうと",
        "isCorrect": false
      },
      {
        "text": "おかあさん",
        "isCorrect": false
      },
      {
        "text": "こども",
        "isCorrect": true
      },
      {
        "text": "あね",
        "isCorrect": false
      }
    ],
    "correctAnswer": "こども",
    "topic": "vocabulary",
    "subtopic": "family",
    "skillId": "vocab.family",
    "lessonIds": [
      "lesson-family-vocabulary"
    ],
    "conceptIds": [],
    "difficulty": "easy",
    "tags": [
      "vocabulary",
      "family",
      "people"
    ],
    "explanation": "こども means child.",
    "learningObjective": "Recognize family and people vocabulary.",
    "commonMistakes": [
      "Confusing with ともだち",
      "Missing dakuten in ど"
    ]
  },
  {
    "_id": "mock_253",
    "questionText": "What does りょうしん mean?",
    "questionType": "translation_choice",
    "options": [
      {
        "text": "younger brother",
        "isCorrect": false
      },
      {
        "text": "parents",
        "isCorrect": true
      },
      {
        "text": "family",
        "isCorrect": false
      },
      {
        "text": "older brother",
        "isCorrect": false
      }
    ],
    "correctAnswer": "parents",
    "topic": "vocabulary",
    "subtopic": "family",
    "skillId": "vocab.family",
    "lessonIds": [
      "lesson-family-vocabulary"
    ],
    "conceptIds": [],
    "difficulty": "medium",
    "tags": [
      "vocabulary",
      "family"
    ],
    "explanation": "りょうしん means parents.",
    "learningObjective": "Recognize family group terms.",
    "commonMistakes": [
      "Confusing with りょうり",
      "Missing small ょ"
    ]
  },
  {
    "_id": "mock_254",
    "questionText": "What is the Japanese word for 'grandmother'?",
    "questionType": "translation_choice",
    "options": [
      {
        "text": "おばあさん",
        "isCorrect": true
      },
      {
        "text": "あね",
        "isCorrect": false
      },
      {
        "text": "いもうと",
        "isCorrect": false
      },
      {
        "text": "おかあさん",
        "isCorrect": false
      }
    ],
    "correctAnswer": "おばあさん",
    "topic": "vocabulary",
    "subtopic": "family",
    "skillId": "vocab.family",
    "lessonIds": [
      "lesson-family-vocabulary"
    ],
    "conceptIds": [],
    "difficulty": "medium",
    "tags": [
      "vocabulary",
      "family"
    ],
    "explanation": "おばあさん means grandmother.",
    "learningObjective": "Recognize extended family vocabulary.",
    "commonMistakes": [
      "Confusing おばあさん and おばさん",
      "Shortening the long vowel"
    ]
  }
];

export default questions;

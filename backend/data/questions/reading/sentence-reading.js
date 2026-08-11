// Sentence reading (reading.sentence_reading)
const questions = [
  {
    "_id": "mock_113",
    "questionText": "Read and translate: わたしはがくせいです。",
    "questionType": "multiple_choice",
    "options": [
      {
        "text": "I go to school",
        "isCorrect": false
      },
      {
        "text": "This is a book",
        "isCorrect": false
      },
      {
        "text": "I am a student",
        "isCorrect": true
      },
      {
        "text": "I am a teacher",
        "isCorrect": false
      }
    ],
    "correctAnswer": "I am a student",
    "topic": "reading",
    "subtopic": "sentence reading",
    "skillId": "reading.sentence_reading",
    "lessonIds": [
      "lesson-sentence-reading"
    ],
    "conceptIds": [],
    "difficulty": "medium",
    "tags": [
      "reading",
      "sentence reading"
    ],
    "explanation": "わたしは marks 'I' as the topic, and がくせいです means am a student.",
    "learningObjective": "Read a short N5 sentence for literal meaning.",
    "commonMistakes": [
      "Ignoring は as topic marker",
      "Missing です"
    ]
  },
  {
    "_id": "mock_135",
    "questionText": "Read and translate: これはみずです。",
    "questionType": "multiple_choice",
    "options": [
      {
        "text": "I like cats",
        "isCorrect": false
      },
      {
        "text": "Today is hot",
        "isCorrect": false
      },
      {
        "text": "This is water",
        "isCorrect": true
      },
      {
        "text": "I eat sushi",
        "isCorrect": false
      }
    ],
    "correctAnswer": "This is water",
    "topic": "reading",
    "subtopic": "sentence reading",
    "skillId": "reading.sentence_reading",
    "lessonIds": [
      "lesson-sentence-reading"
    ],
    "conceptIds": [],
    "difficulty": "easy",
    "tags": [
      "reading",
      "sentence reading"
    ],
    "explanation": "これは marks 'this' as the topic, and みずです means is water.",
    "learningObjective": "Read a short identification sentence.",
    "commonMistakes": [
      "Ignoring は as topic marker",
      "Confusing これ with それ"
    ]
  },
  {
    "_id": "mock_136",
    "questionText": "Read and translate: ねこがいます。",
    "questionType": "multiple_choice",
    "options": [
      {
        "text": "The cat is small",
        "isCorrect": false
      },
      {
        "text": "There is a cat",
        "isCorrect": true
      },
      {
        "text": "There is a dog",
        "isCorrect": false
      },
      {
        "text": "I like cats",
        "isCorrect": false
      }
    ],
    "correctAnswer": "There is a cat",
    "topic": "reading",
    "subtopic": "sentence reading",
    "skillId": "reading.sentence_reading",
    "lessonIds": [
      "lesson-sentence-reading"
    ],
    "conceptIds": [],
    "difficulty": "easy",
    "tags": [
      "reading",
      "sentence reading",
      "existence"
    ],
    "explanation": "ねこがいます means there is a cat.",
    "learningObjective": "Read a short existence sentence.",
    "commonMistakes": [
      "Using あります for living things",
      "Missing が"
    ]
  },
  {
    "_id": "mock_137",
    "questionText": "Read and translate: すしをたべます。",
    "questionType": "multiple_choice",
    "options": [
      {
        "text": "I eat sushi",
        "isCorrect": true
      },
      {
        "text": "I like cats",
        "isCorrect": false
      },
      {
        "text": "This is water",
        "isCorrect": false
      },
      {
        "text": "Today is hot",
        "isCorrect": false
      }
    ],
    "correctAnswer": "I eat sushi",
    "topic": "reading",
    "subtopic": "sentence reading",
    "skillId": "reading.sentence_reading",
    "lessonIds": [
      "lesson-sentence-reading"
    ],
    "conceptIds": [],
    "difficulty": "medium",
    "tags": [
      "reading",
      "sentence reading",
      "verbs"
    ],
    "explanation": "すし is marked by を as the object, and たべます means eat.",
    "learningObjective": "Read a simple object-verb sentence.",
    "commonMistakes": [
      "Ignoring を",
      "Assuming a subject must be written"
    ]
  },
  {
    "_id": "mock_138",
    "questionText": "Read and translate: えきにいきます。",
    "questionType": "multiple_choice",
    "options": [
      {
        "text": "I go to school",
        "isCorrect": false
      },
      {
        "text": "I return home",
        "isCorrect": false
      },
      {
        "text": "I ride the train",
        "isCorrect": false
      },
      {
        "text": "I go to the station",
        "isCorrect": true
      }
    ],
    "correctAnswer": "I go to the station",
    "topic": "reading",
    "subtopic": "sentence reading",
    "skillId": "reading.sentence_reading",
    "lessonIds": [
      "lesson-sentence-reading"
    ],
    "conceptIds": [],
    "difficulty": "medium",
    "tags": [
      "reading",
      "sentence reading",
      "travel"
    ],
    "explanation": "えき is station, に marks the destination, and いきます means go.",
    "learningObjective": "Read a simple movement sentence.",
    "commonMistakes": [
      "Missing に as destination marker",
      "Confusing えき with でんしゃ"
    ]
  },
  {
    "_id": "mock_139",
    "questionText": "Read and translate: きょうはあついです。",
    "questionType": "multiple_choice",
    "options": [
      {
        "text": "I like cats",
        "isCorrect": false
      },
      {
        "text": "This is water",
        "isCorrect": false
      },
      {
        "text": "Today is hot",
        "isCorrect": true
      },
      {
        "text": "I eat sushi",
        "isCorrect": false
      }
    ],
    "correctAnswer": "Today is hot",
    "topic": "reading",
    "subtopic": "sentence reading",
    "skillId": "reading.sentence_reading",
    "lessonIds": [
      "lesson-sentence-reading"
    ],
    "conceptIds": [],
    "difficulty": "easy",
    "tags": [
      "reading",
      "sentence reading",
      "adjectives"
    ],
    "explanation": "きょう means today, and あついです means is hot.",
    "learningObjective": "Read a short adjective sentence.",
    "commonMistakes": [
      "Confusing あつい with たかい",
      "Ignoring は"
    ]
  },
  {
    "_id": "mock_140",
    "questionText": "Read and translate: あしたべんきょうします。",
    "questionType": "multiple_choice",
    "options": [
      {
        "text": "I will study tomorrow",
        "isCorrect": true
      },
      {
        "text": "I studied yesterday",
        "isCorrect": false
      },
      {
        "text": "I will go tomorrow",
        "isCorrect": false
      },
      {
        "text": "I study every day",
        "isCorrect": false
      }
    ],
    "correctAnswer": "I will study tomorrow",
    "topic": "reading",
    "subtopic": "sentence reading",
    "skillId": "reading.sentence_reading",
    "lessonIds": [
      "lesson-sentence-reading"
    ],
    "conceptIds": [],
    "difficulty": "medium",
    "tags": [
      "reading",
      "sentence reading",
      "time"
    ],
    "explanation": "あした means tomorrow, and べんきょうします means study.",
    "learningObjective": "Read a sentence with a time expression.",
    "commonMistakes": [
      "Missing the time word",
      "Assuming explicit future tense marking"
    ]
  },
  {
    "_id": "mock_141",
    "questionText": "Read and translate: これはしずかなまちです。",
    "questionType": "multiple_choice",
    "options": [
      {
        "text": "This is a convenient store",
        "isCorrect": false
      },
      {
        "text": "This is a new room",
        "isCorrect": false
      },
      {
        "text": "This is a cold day",
        "isCorrect": false
      },
      {
        "text": "This is a quiet town",
        "isCorrect": true
      }
    ],
    "correctAnswer": "This is a quiet town",
    "topic": "reading",
    "subtopic": "sentence reading",
    "skillId": "reading.sentence_reading",
    "lessonIds": [
      "lesson-sentence-reading"
    ],
    "conceptIds": [],
    "difficulty": "medium",
    "tags": [
      "reading",
      "sentence reading",
      "adjectives"
    ],
    "explanation": "しずかな modifies まち, meaning quiet town.",
    "learningObjective": "Read a short sentence with a na-adjective.",
    "commonMistakes": [
      "Dropping な before the noun",
      "Confusing まち with みち"
    ]
  },
  {
    "_id": "mock_153",
    "questionText": "Read and translate: わたしはねこがすきです。",
    "questionType": "multiple_choice",
    "options": [
      {
        "text": "This is water",
        "isCorrect": false
      },
      {
        "text": "Today is hot",
        "isCorrect": false
      },
      {
        "text": "I like cats",
        "isCorrect": true
      },
      {
        "text": "I eat sushi",
        "isCorrect": false
      }
    ],
    "correctAnswer": "I like cats",
    "topic": "reading",
    "subtopic": "sentence reading",
    "skillId": "reading.sentence_reading",
    "lessonIds": [
      "lesson-sentence-reading"
    ],
    "conceptIds": [],
    "difficulty": "medium",
    "tags": [
      "reading",
      "sentence reading",
      "likes"
    ],
    "explanation": "わたしは marks the speaker as topic, and ねこがすきです means like cats.",
    "learningObjective": "Read a sentence expressing preference.",
    "commonMistakes": [
      "Ignoring が with すき",
      "Translating は as the subject marker only"
    ]
  },
  {
    "_id": "mock_154",
    "questionText": "Read and translate: でんしゃでがっこうにいきます。",
    "questionType": "multiple_choice",
    "options": [
      {
        "text": "I eat lunch at school",
        "isCorrect": false
      },
      {
        "text": "I go to school by train",
        "isCorrect": true
      },
      {
        "text": "I go to the station",
        "isCorrect": false
      },
      {
        "text": "I study at school",
        "isCorrect": false
      }
    ],
    "correctAnswer": "I go to school by train",
    "topic": "reading",
    "subtopic": "sentence reading",
    "skillId": "reading.sentence_reading",
    "lessonIds": [
      "lesson-sentence-reading"
    ],
    "conceptIds": [],
    "difficulty": "medium",
    "tags": [
      "reading",
      "sentence reading",
      "transportation"
    ],
    "explanation": "でんしゃで means by train, and がっこうにいきます means go to school.",
    "learningObjective": "Read a sentence combining means and destination.",
    "commonMistakes": [
      "Confusing で and に",
      "Missing the destination phrase"
    ]
  }
];

export default questions;

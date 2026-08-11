// Context understanding (reading.context_understanding)
const questions = [
  {
    "_id": "mock_114",
    "questionText": "Read: あした、としょかんにいきます。 What will the speaker do tomorrow?",
    "questionType": "multiple_choice",
    "options": [
      {
        "text": "study at home",
        "isCorrect": false
      },
      {
        "text": "go to the library",
        "isCorrect": true
      },
      {
        "text": "go to school",
        "isCorrect": false
      },
      {
        "text": "read a book",
        "isCorrect": false
      }
    ],
    "correctAnswer": "go to the library",
    "topic": "reading",
    "subtopic": "context understanding",
    "skillId": "reading.context_understanding",
    "lessonIds": [
      "lesson-context-understanding"
    ],
    "conceptIds": [],
    "difficulty": "medium",
    "tags": [
      "reading",
      "context"
    ],
    "explanation": "あした means tomorrow, としょかん is library, and にいきます means go to.",
    "learningObjective": "Use context to understand a short sentence.",
    "commonMistakes": [
      "Missing the time expression",
      "Confusing destination with current location"
    ]
  },
  {
    "_id": "mock_142",
    "questionText": "Read: きょうはあついです。 What is the weather like today?",
    "questionType": "multiple_choice",
    "options": [
      {
        "text": "cats",
        "isCorrect": false
      },
      {
        "text": "expensive",
        "isCorrect": false
      },
      {
        "text": "hot",
        "isCorrect": true
      },
      {
        "text": "by train",
        "isCorrect": false
      }
    ],
    "correctAnswer": "hot",
    "topic": "reading",
    "subtopic": "context understanding",
    "skillId": "reading.context_understanding",
    "lessonIds": [
      "lesson-context-understanding"
    ],
    "conceptIds": [],
    "difficulty": "easy",
    "tags": [
      "reading",
      "context",
      "weather"
    ],
    "explanation": "あつい means hot when describing weather.",
    "learningObjective": "Use sentence context to identify a weather condition.",
    "commonMistakes": [
      "Confusing あつい with cold",
      "Ignoring きょう"
    ]
  },
  {
    "_id": "mock_143",
    "questionText": "Read: たなかさんはせんせいです。 Who is Tanaka?",
    "questionType": "multiple_choice",
    "options": [
      {
        "text": "expensive",
        "isCorrect": false
      },
      {
        "text": "teacher",
        "isCorrect": true
      },
      {
        "text": "by train",
        "isCorrect": false
      },
      {
        "text": "cats",
        "isCorrect": false
      }
    ],
    "correctAnswer": "teacher",
    "topic": "reading",
    "subtopic": "context understanding",
    "skillId": "reading.context_understanding",
    "lessonIds": [
      "lesson-context-understanding"
    ],
    "conceptIds": [],
    "difficulty": "easy",
    "tags": [
      "reading",
      "context",
      "people"
    ],
    "explanation": "せんせい means teacher.",
    "learningObjective": "Use context to identify a person's role.",
    "commonMistakes": [
      "Confusing せんせい with がくせい",
      "Missing は"
    ]
  },
  {
    "_id": "mock_144",
    "questionText": "Read: ねこがすきです。 What does the speaker like?",
    "questionType": "multiple_choice",
    "options": [
      {
        "text": "cats",
        "isCorrect": true
      },
      {
        "text": "by train",
        "isCorrect": false
      },
      {
        "text": "expensive",
        "isCorrect": false
      },
      {
        "text": "friend",
        "isCorrect": false
      }
    ],
    "correctAnswer": "cats",
    "topic": "reading",
    "subtopic": "context understanding",
    "skillId": "reading.context_understanding",
    "lessonIds": [
      "lesson-context-understanding"
    ],
    "conceptIds": [],
    "difficulty": "easy",
    "tags": [
      "reading",
      "context",
      "likes"
    ],
    "explanation": "ねこ means cats, and すきです means like.",
    "learningObjective": "Use context to identify the object of preference.",
    "commonMistakes": [
      "Ignoring が",
      "Confusing ねこ with いぬ"
    ]
  },
  {
    "_id": "mock_145",
    "questionText": "Read: みずがほしいです。 What does the speaker want?",
    "questionType": "multiple_choice",
    "options": [
      {
        "text": "by train",
        "isCorrect": false
      },
      {
        "text": "cats",
        "isCorrect": false
      },
      {
        "text": "expensive",
        "isCorrect": false
      },
      {
        "text": "water",
        "isCorrect": true
      }
    ],
    "correctAnswer": "water",
    "topic": "reading",
    "subtopic": "context understanding",
    "skillId": "reading.context_understanding",
    "lessonIds": [
      "lesson-context-understanding"
    ],
    "conceptIds": [],
    "difficulty": "easy",
    "tags": [
      "reading",
      "context",
      "desires"
    ],
    "explanation": "みず means water, and ほしいです means want.",
    "learningObjective": "Use context to identify a wanted object.",
    "commonMistakes": [
      "Ignoring が",
      "Confusing ほしい with すき"
    ]
  },
  {
    "_id": "mock_146",
    "questionText": "Read: きのうすしをたべました。 When did the speaker eat sushi?",
    "questionType": "multiple_choice",
    "options": [
      {
        "text": "cats",
        "isCorrect": false
      },
      {
        "text": "expensive",
        "isCorrect": false
      },
      {
        "text": "yesterday",
        "isCorrect": true
      },
      {
        "text": "by train",
        "isCorrect": false
      }
    ],
    "correctAnswer": "yesterday",
    "topic": "reading",
    "subtopic": "context understanding",
    "skillId": "reading.context_understanding",
    "lessonIds": [
      "lesson-context-understanding"
    ],
    "conceptIds": [],
    "difficulty": "medium",
    "tags": [
      "reading",
      "context",
      "past tense"
    ],
    "explanation": "きのう means yesterday, and たべました is past tense.",
    "learningObjective": "Use time expressions to understand sentence context.",
    "commonMistakes": [
      "Missing きのう",
      "Treating ました as present tense"
    ]
  },
  {
    "_id": "mock_147",
    "questionText": "Read: ともだちとえきにいきます。 Who will the speaker go with?",
    "questionType": "multiple_choice",
    "options": [
      {
        "text": "expensive",
        "isCorrect": false
      },
      {
        "text": "friend",
        "isCorrect": true
      },
      {
        "text": "by train",
        "isCorrect": false
      },
      {
        "text": "cats",
        "isCorrect": false
      }
    ],
    "correctAnswer": "friend",
    "topic": "reading",
    "subtopic": "context understanding",
    "skillId": "reading.context_understanding",
    "lessonIds": [
      "lesson-context-understanding"
    ],
    "conceptIds": [],
    "difficulty": "medium",
    "tags": [
      "reading",
      "context",
      "particles"
    ],
    "explanation": "ともだちと means with a friend.",
    "learningObjective": "Use particles to understand relationships in context.",
    "commonMistakes": [
      "Missing と as with",
      "Thinking と marks destination"
    ]
  },
  {
    "_id": "mock_148",
    "questionText": "Read: としょかんでべんきょうします。 Where does the speaker study?",
    "questionType": "multiple_choice",
    "options": [
      {
        "text": "library",
        "isCorrect": true
      },
      {
        "text": "by train",
        "isCorrect": false
      },
      {
        "text": "cats",
        "isCorrect": false
      },
      {
        "text": "expensive",
        "isCorrect": false
      }
    ],
    "correctAnswer": "library",
    "topic": "reading",
    "subtopic": "context understanding",
    "skillId": "reading.context_understanding",
    "lessonIds": [
      "lesson-context-understanding"
    ],
    "conceptIds": [],
    "difficulty": "medium",
    "tags": [
      "reading",
      "context",
      "location"
    ],
    "explanation": "としょかん means library, and で marks the action location.",
    "learningObjective": "Use context and particles to identify action location.",
    "commonMistakes": [
      "Confusing で with に",
      "Missing としょかん"
    ]
  },
  {
    "_id": "mock_149",
    "questionText": "Read: あしたでんしゃでいきます。 How will the speaker go tomorrow?",
    "questionType": "multiple_choice",
    "options": [
      {
        "text": "cats",
        "isCorrect": false
      },
      {
        "text": "expensive",
        "isCorrect": false
      },
      {
        "text": "friend",
        "isCorrect": false
      },
      {
        "text": "by train",
        "isCorrect": true
      }
    ],
    "correctAnswer": "by train",
    "topic": "reading",
    "subtopic": "context understanding",
    "skillId": "reading.context_understanding",
    "lessonIds": [
      "lesson-context-understanding"
    ],
    "conceptIds": [],
    "difficulty": "medium",
    "tags": [
      "reading",
      "context",
      "transportation"
    ],
    "explanation": "でんしゃで means by train.",
    "learningObjective": "Use context to identify means of transportation.",
    "commonMistakes": [
      "Confusing で with destination marker",
      "Missing あした"
    ]
  },
  {
    "_id": "mock_150",
    "questionText": "Read: げつようびにがっこうにいきます。 When does the speaker go to school?",
    "questionType": "multiple_choice",
    "options": [
      {
        "text": "expensive",
        "isCorrect": false
      },
      {
        "text": "Monday",
        "isCorrect": true
      },
      {
        "text": "by train",
        "isCorrect": false
      },
      {
        "text": "cats",
        "isCorrect": false
      }
    ],
    "correctAnswer": "Monday",
    "topic": "reading",
    "subtopic": "context understanding",
    "skillId": "reading.context_understanding",
    "lessonIds": [
      "lesson-context-understanding"
    ],
    "conceptIds": [],
    "difficulty": "medium",
    "tags": [
      "reading",
      "context",
      "time"
    ],
    "explanation": "げつようび means Monday.",
    "learningObjective": "Use context to identify timing.",
    "commonMistakes": [
      "Confusing weekdays",
      "Missing the first に as time marker"
    ]
  },
  {
    "_id": "mock_151",
    "questionText": "Read: これはたかいです。 What does the speaker think about it?",
    "questionType": "multiple_choice",
    "options": [
      {
        "text": "expensive",
        "isCorrect": true
      },
      {
        "text": "by train",
        "isCorrect": false
      },
      {
        "text": "cats",
        "isCorrect": false
      },
      {
        "text": "friend",
        "isCorrect": false
      }
    ],
    "correctAnswer": "expensive",
    "topic": "reading",
    "subtopic": "context understanding",
    "skillId": "reading.context_understanding",
    "lessonIds": [
      "lesson-context-understanding"
    ],
    "conceptIds": [],
    "difficulty": "easy",
    "tags": [
      "reading",
      "context",
      "adjectives"
    ],
    "explanation": "たかい can mean expensive in shopping-like contexts.",
    "learningObjective": "Use context to infer adjective meaning.",
    "commonMistakes": [
      "Only reading たかい as tall",
      "Ignoring context"
    ]
  }
];

export default questions;

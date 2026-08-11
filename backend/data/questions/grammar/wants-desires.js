// Wants and desires (grammar.wants_desires)
const questions = [
  {
    "_id": "mock_111",
    "questionText": "Translate 'I want water.'",
    "questionType": "fill_in_blank",
    "options": [],
    "correctAnswer": "みずがほしいです",
    "topic": "grammar",
    "subtopic": "wants and desires",
    "skillId": "grammar.wants_desires",
    "lessonIds": [
      "lesson-wants-desires"
    ],
    "conceptIds": [],
    "difficulty": "medium",
    "tags": [
      "grammar",
      "desires"
    ],
    "explanation": "ほしい expresses wanting an object, and the wanted object is marked with が.",
    "learningObjective": "Express wanting an object.",
    "commonMistakes": [
      "Using を with ほしい",
      "Confusing ほしい with たい"
    ]
  },
  {
    "_id": "mock_353",
    "questionText": "Which word expresses wanting an object?",
    "questionType": "multiple_choice",
    "options": [
      {
        "text": "ほしい",
        "isCorrect": true
      },
      {
        "text": "たい",
        "isCorrect": false
      },
      {
        "text": "すき",
        "isCorrect": false
      },
      {
        "text": "きらい",
        "isCorrect": false
      }
    ],
    "correctAnswer": "ほしい",
    "topic": "grammar",
    "subtopic": "wants and desires",
    "skillId": "grammar.wants_desires",
    "lessonIds": [
      "lesson-wants-desires"
    ],
    "conceptIds": [],
    "difficulty": "easy",
    "tags": [
      "grammar",
      "desires"
    ],
    "explanation": "ほしい is used to say you want a thing.",
    "learningObjective": "Recognize object-wanting expressions.",
    "commonMistakes": [
      "Using たい with nouns",
      "Treating ほしい as a movement verb"
    ]
  },
  {
    "_id": "mock_354",
    "questionText": "Translate: 'I want a book.'",
    "questionType": "fill_in_blank",
    "options": [],
    "correctAnswer": "ほんがほしいです",
    "topic": "grammar",
    "subtopic": "wants and desires",
    "skillId": "grammar.wants_desires",
    "lessonIds": [
      "lesson-wants-desires"
    ],
    "conceptIds": [],
    "difficulty": "easy",
    "tags": [
      "grammar",
      "desires",
      "objects"
    ],
    "explanation": "The wanted object is marked with が before ほしいです.",
    "learningObjective": "Express wanting an object.",
    "commonMistakes": [
      "Using を with ほしい",
      "Using たい after a noun"
    ]
  },
  {
    "_id": "mock_355",
    "questionText": "Which particle usually marks the thing wanted with ほしい?",
    "questionType": "multiple_choice",
    "options": [
      {
        "text": "は",
        "isCorrect": false
      },
      {
        "text": "に",
        "isCorrect": false
      },
      {
        "text": "が",
        "isCorrect": true
      },
      {
        "text": "を",
        "isCorrect": false
      }
    ],
    "correctAnswer": "が",
    "topic": "grammar",
    "subtopic": "wants and desires",
    "skillId": "grammar.wants_desires",
    "lessonIds": [
      "lesson-wants-desires"
    ],
    "conceptIds": [],
    "difficulty": "easy",
    "tags": [
      "grammar",
      "desires",
      "particles"
    ],
    "explanation": "が marks the thing wanted in beginner ほしい sentences.",
    "learningObjective": "Use が with ほしい.",
    "commonMistakes": [
      "Using を because English says want an object",
      "Using に for wanted objects"
    ]
  },
  {
    "_id": "mock_356",
    "questionText": "Translate: 'I want coffee.'",
    "questionType": "fill_in_blank",
    "options": [],
    "correctAnswer": "コーヒーがほしいです",
    "topic": "grammar",
    "subtopic": "wants and desires",
    "skillId": "grammar.wants_desires",
    "lessonIds": [
      "lesson-wants-desires"
    ],
    "conceptIds": [],
    "difficulty": "easy",
    "tags": [
      "grammar",
      "desires",
      "food"
    ],
    "explanation": "コーヒーがほしいです means I want coffee.",
    "learningObjective": "Express wanting drinks and food.",
    "commonMistakes": [
      "Using を with ほしい",
      "Forgetting the long vowel mark in コーヒー"
    ]
  },
  {
    "_id": "mock_357",
    "questionText": "What does たべたい mean?",
    "questionType": "translation_choice",
    "options": [
      {
        "text": "want to eat",
        "isCorrect": true
      },
      {
        "text": "asking for advice",
        "isCorrect": false
      },
      {
        "text": "end",
        "isCorrect": false
      },
      {
        "text": "makes it polite",
        "isCorrect": false
      }
    ],
    "correctAnswer": "want to eat",
    "topic": "grammar",
    "subtopic": "wants and desires",
    "skillId": "grammar.wants_desires",
    "lessonIds": [
      "lesson-wants-desires"
    ],
    "conceptIds": [],
    "difficulty": "medium",
    "tags": [
      "grammar",
      "desires",
      "tai-form"
    ],
    "explanation": "たべたい means want to eat.",
    "learningObjective": "Recognize the tai-form for wanting to do actions.",
    "commonMistakes": [
      "Using ほしい after a verb",
      "Confusing たい with past tense"
    ]
  },
  {
    "_id": "mock_358",
    "questionText": "Translate: 'I want to go to Japan.'",
    "questionType": "fill_in_blank",
    "options": [],
    "correctAnswer": "にほんにいきたいです",
    "topic": "grammar",
    "subtopic": "wants and desires",
    "skillId": "grammar.wants_desires",
    "lessonIds": [
      "lesson-wants-desires"
    ],
    "conceptIds": [],
    "difficulty": "medium",
    "tags": [
      "grammar",
      "desires",
      "movement"
    ],
    "explanation": "いきたい means want to go, and にほんに marks the destination.",
    "learningObjective": "Express wanting to do an action.",
    "commonMistakes": [
      "Using にほんがほしい",
      "Dropping に after にほん"
    ]
  },
  {
    "_id": "mock_359",
    "questionText": "What ending means 'want to do' with verbs?",
    "questionType": "multiple_choice",
    "options": [
      {
        "text": "ます",
        "isCorrect": false
      },
      {
        "text": "ません",
        "isCorrect": false
      },
      {
        "text": "たい",
        "isCorrect": true
      },
      {
        "text": "ほしい",
        "isCorrect": false
      }
    ],
    "correctAnswer": "たい",
    "topic": "grammar",
    "subtopic": "wants and desires",
    "skillId": "grammar.wants_desires",
    "lessonIds": [
      "lesson-wants-desires"
    ],
    "conceptIds": [],
    "difficulty": "medium",
    "tags": [
      "grammar",
      "desires",
      "tai-form"
    ],
    "explanation": "たい attaches to a verb stem to express wanting to do that action.",
    "learningObjective": "Identify the basic desire verb ending.",
    "commonMistakes": [
      "Using ほしい for actions",
      "Adding たい after a full ます form"
    ]
  },
  {
    "_id": "mock_360",
    "questionText": "Translate: 'I want to read a book.'",
    "questionType": "fill_in_blank",
    "options": [],
    "correctAnswer": "ほんをよみたいです",
    "topic": "grammar",
    "subtopic": "wants and desires",
    "skillId": "grammar.wants_desires",
    "lessonIds": [
      "lesson-wants-desires"
    ],
    "conceptIds": [],
    "difficulty": "medium",
    "tags": [
      "grammar",
      "desires",
      "reading"
    ],
    "explanation": "よみたい means want to read, and ほんを marks the object.",
    "learningObjective": "Use tai-form with an object.",
    "commonMistakes": [
      "Using ほんがほしい when the action is reading",
      "Writing よみますたい"
    ]
  },
  {
    "_id": "mock_361",
    "questionText": "Choose the sentence that means 'I want a new phone.'",
    "questionType": "multiple_choice",
    "options": [
      {
        "text": "あたらしいでんわをたべたいです",
        "isCorrect": false
      },
      {
        "text": "ふるいでんわがほしいです",
        "isCorrect": false
      },
      {
        "text": "あたらしいほんがほしいです",
        "isCorrect": false
      },
      {
        "text": "あたらしいでんわがほしいです",
        "isCorrect": true
      }
    ],
    "correctAnswer": "あたらしいでんわがほしいです",
    "topic": "grammar",
    "subtopic": "wants and desires",
    "skillId": "grammar.wants_desires",
    "lessonIds": [
      "lesson-wants-desires"
    ],
    "conceptIds": [],
    "difficulty": "medium",
    "tags": [
      "grammar",
      "desires",
      "adjectives"
    ],
    "explanation": "あたらしいでんわ is the wanted object, so it is marked with が before ほしいです.",
    "learningObjective": "Combine adjectives with wanting-object sentences.",
    "commonMistakes": [
      "Using を with ほしい",
      "Putting あたらしい after でんわ"
    ]
  }
];

export default questions;

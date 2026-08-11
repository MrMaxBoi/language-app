// Likes and dislikes (grammar.likes_dislikes)
const questions = [
  {
    "_id": "mock_110",
    "questionText": "Translate 'I like cats.'",
    "questionType": "fill_in_blank",
    "options": [],
    "correctAnswer": "ねこがすきです",
    "topic": "grammar",
    "subtopic": "likes and dislikes",
    "skillId": "grammar.likes_dislikes",
    "lessonIds": [
      "lesson-likes-dislikes"
    ],
    "conceptIds": [],
    "difficulty": "medium",
    "tags": [
      "grammar",
      "likes",
      "adjectives"
    ],
    "explanation": "すき commonly uses が to mark the thing liked.",
    "learningObjective": "Express simple likes and dislikes.",
    "commonMistakes": [
      "Using を with すき",
      "Forgetting です"
    ]
  },
  {
    "_id": "mock_335",
    "questionText": "Translate: 'I like sushi.'",
    "questionType": "fill_in_blank",
    "options": [],
    "correctAnswer": "すしがすきです",
    "topic": "grammar",
    "subtopic": "likes and dislikes",
    "skillId": "grammar.likes_dislikes",
    "lessonIds": [
      "lesson-likes-dislikes"
    ],
    "conceptIds": [],
    "difficulty": "easy",
    "tags": [
      "grammar",
      "likes",
      "food"
    ],
    "explanation": "すき uses が to mark the thing liked.",
    "learningObjective": "Express simple likes.",
    "commonMistakes": [
      "Using を with すき",
      "Adding a verb after すき"
    ]
  },
  {
    "_id": "mock_336",
    "questionText": "Translate: 'I dislike fish.'",
    "questionType": "fill_in_blank",
    "options": [],
    "correctAnswer": "さかながきらいです",
    "topic": "grammar",
    "subtopic": "likes and dislikes",
    "skillId": "grammar.likes_dislikes",
    "lessonIds": [
      "lesson-likes-dislikes"
    ],
    "conceptIds": [],
    "difficulty": "medium",
    "tags": [
      "grammar",
      "dislikes",
      "food"
    ],
    "explanation": "きらい is used with が to mark the disliked thing.",
    "learningObjective": "Express simple dislikes.",
    "commonMistakes": [
      "Using を with きらい",
      "Confusing きらい with きれい"
    ]
  },
  {
    "_id": "mock_337",
    "questionText": "Which particle usually marks the thing liked with すき?",
    "questionType": "multiple_choice",
    "options": [
      {
        "text": "を",
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
        "text": "は",
        "isCorrect": false
      }
    ],
    "correctAnswer": "が",
    "topic": "grammar",
    "subtopic": "likes and dislikes",
    "skillId": "grammar.likes_dislikes",
    "lessonIds": [
      "lesson-likes-dislikes"
    ],
    "conceptIds": [],
    "difficulty": "easy",
    "tags": [
      "grammar",
      "likes",
      "particles"
    ],
    "explanation": "が commonly marks the thing liked in beginner すき sentences.",
    "learningObjective": "Use が with すき.",
    "commonMistakes": [
      "Using を because English says like an object",
      "Using は for every noun"
    ]
  },
  {
    "_id": "mock_338",
    "questionText": "How do you say 'Do you like cats?'",
    "questionType": "translation_choice",
    "options": [
      {
        "text": "ねこにすきですか",
        "isCorrect": false
      },
      {
        "text": "ねこがすきですか",
        "isCorrect": true
      },
      {
        "text": "ねこをすきですか",
        "isCorrect": false
      },
      {
        "text": "ねこはほしいですか",
        "isCorrect": false
      }
    ],
    "correctAnswer": "ねこがすきですか",
    "topic": "grammar",
    "subtopic": "likes and dislikes",
    "skillId": "grammar.likes_dislikes",
    "lessonIds": [
      "lesson-likes-dislikes"
    ],
    "conceptIds": [],
    "difficulty": "medium",
    "tags": [
      "grammar",
      "likes",
      "questions"
    ],
    "explanation": "Adding か makes the すき sentence a question.",
    "learningObjective": "Ask about likes and dislikes.",
    "commonMistakes": [
      "Changing word order like English",
      "Using を with すき"
    ]
  },
  {
    "_id": "mock_339",
    "questionText": "Translate: 'I like Japanese.'",
    "questionType": "fill_in_blank",
    "options": [],
    "correctAnswer": "にほんごがすきです",
    "topic": "grammar",
    "subtopic": "likes and dislikes",
    "skillId": "grammar.likes_dislikes",
    "lessonIds": [
      "lesson-likes-dislikes"
    ],
    "conceptIds": [],
    "difficulty": "easy",
    "tags": [
      "grammar",
      "likes",
      "language"
    ],
    "explanation": "にほんごがすきです means I like Japanese.",
    "learningObjective": "Express language preferences.",
    "commonMistakes": [
      "Using にほんが for Japanese language",
      "Using を with すき"
    ]
  },
  {
    "_id": "mock_340",
    "questionText": "Translate: 'I do not like meat.'",
    "questionType": "fill_in_blank",
    "options": [],
    "correctAnswer": "にくがすきではありません",
    "topic": "grammar",
    "subtopic": "likes and dislikes",
    "skillId": "grammar.likes_dislikes",
    "lessonIds": [
      "lesson-likes-dislikes"
    ],
    "conceptIds": [],
    "difficulty": "medium",
    "tags": [
      "grammar",
      "likes",
      "negative"
    ],
    "explanation": "すきではありません is the polite negative form of すきです.",
    "learningObjective": "Express negative preferences politely.",
    "commonMistakes": [
      "Using すきません",
      "Using を with にく"
    ]
  },
  {
    "_id": "mock_341",
    "questionText": "Which sentence means 'I like music'?",
    "questionType": "multiple_choice",
    "options": [
      {
        "text": "おんがくがほしいです",
        "isCorrect": false
      },
      {
        "text": "おんがくがすきです",
        "isCorrect": true
      },
      {
        "text": "おんがくをすきです",
        "isCorrect": false
      },
      {
        "text": "おんがくにいきます",
        "isCorrect": false
      }
    ],
    "correctAnswer": "おんがくがすきです",
    "topic": "grammar",
    "subtopic": "likes and dislikes",
    "skillId": "grammar.likes_dislikes",
    "lessonIds": [
      "lesson-likes-dislikes"
    ],
    "conceptIds": [],
    "difficulty": "easy",
    "tags": [
      "grammar",
      "likes",
      "vocabulary"
    ],
    "explanation": "おんがくがすきです means I like music.",
    "learningObjective": "Practice preference sentences with common nouns.",
    "commonMistakes": [
      "Using おんがくをすきです",
      "Confusing おんがく with がくせい"
    ]
  },
  {
    "_id": "mock_342",
    "questionText": "What does だいすき mean?",
    "questionType": "translation_choice",
    "options": [
      {
        "text": "really like",
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
    "correctAnswer": "really like",
    "topic": "grammar",
    "subtopic": "likes and dislikes",
    "skillId": "grammar.likes_dislikes",
    "lessonIds": [
      "lesson-likes-dislikes"
    ],
    "conceptIds": [],
    "difficulty": "easy",
    "tags": [
      "grammar",
      "likes",
      "intensity"
    ],
    "explanation": "だいすき means really like or love in a broad preference sense.",
    "learningObjective": "Recognize stronger liking expressions.",
    "commonMistakes": [
      "Using it only for romance",
      "Treating it as a verb"
    ]
  },
  {
    "_id": "mock_343",
    "questionText": "Translate: 'I really like dogs.'",
    "questionType": "fill_in_blank",
    "options": [],
    "correctAnswer": "いぬがだいすきです",
    "topic": "grammar",
    "subtopic": "likes and dislikes",
    "skillId": "grammar.likes_dislikes",
    "lessonIds": [
      "lesson-likes-dislikes"
    ],
    "conceptIds": [],
    "difficulty": "medium",
    "tags": [
      "grammar",
      "likes",
      "animals"
    ],
    "explanation": "だいすき expresses strong liking, and いぬ is marked with が.",
    "learningObjective": "Express stronger preferences.",
    "commonMistakes": [
      "Using を with だいすき",
      "Forgetting です"
    ]
  }
];

export default questions;

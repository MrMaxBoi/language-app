// Asking time (time.asking_time)
const questions = [
  {
    "_id": "mock_013",
    "questionText": "Translate 'What time is it?' into Japanese.",
    "questionType": "fill_in_blank",
    "options": [],
    "correctAnswer": "なんじですか",
    "topic": "time/date",
    "subtopic": "asking time",
    "skillId": "time.asking_time",
    "lessonIds": [],
    "conceptIds": [],
    "difficulty": "medium",
    "tags": [
      "time",
      "questions"
    ],
    "explanation": "なんじ means what time.",
    "learningObjective": "Ask simple questions about time.",
    "commonMistakes": [
      "Using incorrect counter",
      "Missing か"
    ]
  },
  {
    "_id": "mock_315",
    "questionText": "How do you ask 'What time is it?'",
    "questionType": "multiple_choice",
    "options": [
      {
        "text": "しちじはんです",
        "isCorrect": false
      },
      {
        "text": "かようび",
        "isCorrect": false
      },
      {
        "text": "なんじですか",
        "isCorrect": true
      },
      {
        "text": "さんじです",
        "isCorrect": false
      }
    ],
    "correctAnswer": "なんじですか",
    "topic": "time/date",
    "subtopic": "asking time",
    "skillId": "time.asking_time",
    "lessonIds": [],
    "conceptIds": [],
    "difficulty": "easy",
    "tags": [
      "time",
      "questions"
    ],
    "explanation": "なんじですか asks what time it is.",
    "learningObjective": "Ask simple time questions.",
    "commonMistakes": [
      "Using いつ for clock time",
      "Forgetting か"
    ]
  },
  {
    "_id": "mock_316",
    "questionText": "What does いま mean?",
    "questionType": "translation_choice",
    "options": [
      {
        "text": "Friday",
        "isCorrect": false
      },
      {
        "text": "now",
        "isCorrect": true
      },
      {
        "text": "half",
        "isCorrect": false
      },
      {
        "text": "morning",
        "isCorrect": false
      }
    ],
    "correctAnswer": "now",
    "topic": "time/date",
    "subtopic": "asking time",
    "skillId": "time.asking_time",
    "lessonIds": [],
    "conceptIds": [],
    "difficulty": "easy",
    "tags": [
      "time",
      "vocabulary"
    ],
    "explanation": "いま means now.",
    "learningObjective": "Recognize words used in time questions.",
    "commonMistakes": [
      "Confusing with いつ",
      "Using it as a clock number"
    ]
  },
  {
    "_id": "mock_317",
    "questionText": "Translate: 'It is three o'clock.'",
    "questionType": "fill_in_blank",
    "options": [],
    "correctAnswer": "さんじです",
    "topic": "time/date",
    "subtopic": "asking time",
    "skillId": "time.asking_time",
    "lessonIds": [],
    "conceptIds": [],
    "difficulty": "easy",
    "tags": [
      "time",
      "clock"
    ],
    "explanation": "さんじです means it is three o'clock.",
    "learningObjective": "Answer simple clock-time questions.",
    "commonMistakes": [
      "Forgetting じ",
      "Using さん only"
    ]
  },
  {
    "_id": "mock_318",
    "questionText": "What does はん mean in time expressions like さんじはん?",
    "questionType": "translation_choice",
    "options": [
      {
        "text": "morning",
        "isCorrect": false
      },
      {
        "text": "now",
        "isCorrect": false
      },
      {
        "text": "Friday",
        "isCorrect": false
      },
      {
        "text": "half",
        "isCorrect": true
      }
    ],
    "correctAnswer": "half",
    "topic": "time/date",
    "subtopic": "asking time",
    "skillId": "time.asking_time",
    "lessonIds": [],
    "conceptIds": [],
    "difficulty": "medium",
    "tags": [
      "time",
      "clock"
    ],
    "explanation": "はん means half, so さんじはん is 3:30.",
    "learningObjective": "Recognize half-hour time expressions.",
    "commonMistakes": [
      "Reading はん as a separate number",
      "Confusing with ばん"
    ]
  },
  {
    "_id": "mock_319",
    "questionText": "Translate: 'It is seven thirty.'",
    "questionType": "fill_in_blank",
    "options": [],
    "correctAnswer": "しちじはんです",
    "topic": "time/date",
    "subtopic": "asking time",
    "skillId": "time.asking_time",
    "lessonIds": [],
    "conceptIds": [],
    "difficulty": "medium",
    "tags": [
      "time",
      "clock"
    ],
    "explanation": "しちじはんです means it is seven thirty.",
    "learningObjective": "Use はん for half past the hour.",
    "commonMistakes": [
      "Using なな without recognizing common time reading",
      "Forgetting はん"
    ]
  },
  {
    "_id": "mock_320",
    "questionText": "How do you ask 'What time do you sleep?'",
    "questionType": "multiple_choice",
    "options": [
      {
        "text": "なんじにねますか",
        "isCorrect": true
      },
      {
        "text": "なんじにおきますか",
        "isCorrect": false
      },
      {
        "text": "なんじですか",
        "isCorrect": false
      },
      {
        "text": "どこでねますか",
        "isCorrect": false
      }
    ],
    "correctAnswer": "なんじにねますか",
    "topic": "time/date",
    "subtopic": "asking time",
    "skillId": "time.asking_time",
    "lessonIds": [],
    "conceptIds": [],
    "difficulty": "medium",
    "tags": [
      "time",
      "questions",
      "particles"
    ],
    "explanation": "なんじに marks the time when the action happens.",
    "learningObjective": "Ask when a routine action happens.",
    "commonMistakes": [
      "Omitting に after なんじ",
      "Using で for time"
    ]
  },
  {
    "_id": "mock_321",
    "questionText": "Which particle marks the time an action happens?",
    "questionType": "multiple_choice",
    "options": [
      {
        "text": "が",
        "isCorrect": false
      },
      {
        "text": "で",
        "isCorrect": false
      },
      {
        "text": "と",
        "isCorrect": false
      },
      {
        "text": "に",
        "isCorrect": true
      }
    ],
    "correctAnswer": "に",
    "topic": "time/date",
    "subtopic": "asking time",
    "skillId": "time.asking_time",
    "lessonIds": [],
    "conceptIds": [],
    "difficulty": "easy",
    "tags": [
      "time",
      "particles"
    ],
    "explanation": "に marks specific times, such as しちじに.",
    "learningObjective": "Use に with clock times.",
    "commonMistakes": [
      "Using で for clock time",
      "Omitting the particle"
    ]
  },
  {
    "_id": "mock_322",
    "questionText": "Translate: 'I wake up at six o'clock.'",
    "questionType": "fill_in_blank",
    "options": [],
    "correctAnswer": "ろくじにおきます",
    "topic": "time/date",
    "subtopic": "asking time",
    "skillId": "time.asking_time",
    "lessonIds": [],
    "conceptIds": [],
    "difficulty": "medium",
    "tags": [
      "time",
      "daily activities"
    ],
    "explanation": "ろくじに marks six o'clock as the time of waking up.",
    "learningObjective": "Answer routine time questions.",
    "commonMistakes": [
      "Using を after ろくじ",
      "Confusing おきます and ねます"
    ]
  },
  {
    "_id": "mock_323",
    "questionText": "What does ごぜん mean?",
    "questionType": "translation_choice",
    "options": [
      {
        "text": "Friday",
        "isCorrect": false
      },
      {
        "text": "morning",
        "isCorrect": true
      },
      {
        "text": "half",
        "isCorrect": false
      },
      {
        "text": "now",
        "isCorrect": false
      }
    ],
    "correctAnswer": "morning",
    "topic": "time/date",
    "subtopic": "asking time",
    "skillId": "time.asking_time",
    "lessonIds": [],
    "conceptIds": [],
    "difficulty": "medium",
    "tags": [
      "time",
      "am pm"
    ],
    "explanation": "ごぜん means a.m. or morning in time expressions.",
    "learningObjective": "Recognize a.m. and p.m. time markers.",
    "commonMistakes": [
      "Confusing with ごご",
      "Treating it as a weekday"
    ]
  }
];

export default questions;

// Weekdays and daily time (time.weekdays)
const questions = [
  {
    "_id": "mock_011",
    "questionText": "How do you say 'Monday' in Japanese?",
    "questionType": "translation_choice",
    "options": [
      {
        "text": "にちようび",
        "isCorrect": false
      },
      {
        "text": "げつようび",
        "isCorrect": true
      },
      {
        "text": "かようび",
        "isCorrect": false
      },
      {
        "text": "どようび",
        "isCorrect": false
      }
    ],
    "correctAnswer": "げつようび",
    "topic": "time/date",
    "subtopic": "days of the week",
    "skillId": "time.weekdays",
    "lessonIds": [],
    "conceptIds": [],
    "difficulty": "medium",
    "tags": [
      "time",
      "calendar"
    ],
    "explanation": "げつようび means Monday.",
    "learningObjective": "Memorize Japanese weekday vocabulary.",
    "commonMistakes": [
      "Mixing up weekdays",
      "Forgetting ようび"
    ]
  },
  {
    "_id": "mock_031",
    "questionText": "How do you say 'Sunday' in Japanese?",
    "questionType": "translation_choice",
    "options": [
      {
        "text": "かようび",
        "isCorrect": false
      },
      {
        "text": "げつようび",
        "isCorrect": false
      },
      {
        "text": "どようび",
        "isCorrect": false
      },
      {
        "text": "にちようび",
        "isCorrect": true
      }
    ],
    "correctAnswer": "にちようび",
    "topic": "time/date",
    "subtopic": "days of the week",
    "skillId": "time.weekdays",
    "lessonIds": [],
    "conceptIds": [],
    "difficulty": "medium",
    "tags": [
      "calendar",
      "time"
    ],
    "explanation": "にちようび means Sunday.",
    "learningObjective": "Memorize weekday names.",
    "commonMistakes": [
      "Mixing with 月曜日",
      "Incorrect pronunciation"
    ]
  },
  {
    "_id": "mock_033",
    "questionText": "Translate 'today' into Japanese.",
    "questionType": "fill_in_blank",
    "options": [],
    "correctAnswer": "きょう",
    "topic": "time/date",
    "subtopic": "daily time expressions",
    "skillId": "time.weekdays",
    "lessonIds": [],
    "conceptIds": [],
    "difficulty": "easy",
    "tags": [
      "time",
      "daily expressions"
    ],
    "explanation": "きょう means today.",
    "learningObjective": "Recognize common time expressions.",
    "commonMistakes": [
      "Confusing with あした",
      "Using incorrect kanji"
    ]
  },
  {
    "_id": "mock_291",
    "questionText": "What is the Japanese word for 'Tuesday'?",
    "questionType": "translation_choice",
    "options": [
      {
        "text": "げつようび",
        "isCorrect": false
      },
      {
        "text": "どようび",
        "isCorrect": false
      },
      {
        "text": "にちようび",
        "isCorrect": false
      },
      {
        "text": "かようび",
        "isCorrect": true
      }
    ],
    "correctAnswer": "かようび",
    "topic": "time/date",
    "subtopic": "days of the week",
    "skillId": "time.weekdays",
    "lessonIds": [],
    "conceptIds": [],
    "difficulty": "medium",
    "tags": [
      "time",
      "weekdays"
    ],
    "explanation": "かようび means Tuesday.",
    "learningObjective": "Recognize weekday vocabulary.",
    "commonMistakes": [
      "Confusing with げつようび",
      "Forgetting ようび"
    ]
  },
  {
    "_id": "mock_292",
    "questionText": "What does すいようび mean?",
    "questionType": "translation_choice",
    "options": [
      {
        "text": "Sunday",
        "isCorrect": false
      },
      {
        "text": "morning",
        "isCorrect": false
      },
      {
        "text": "Wednesday",
        "isCorrect": true
      },
      {
        "text": "Friday",
        "isCorrect": false
      }
    ],
    "correctAnswer": "Wednesday",
    "topic": "time/date",
    "subtopic": "days of the week",
    "skillId": "time.weekdays",
    "lessonIds": [],
    "conceptIds": [],
    "difficulty": "medium",
    "tags": [
      "time",
      "weekdays"
    ],
    "explanation": "すいようび means Wednesday.",
    "learningObjective": "Recognize weekday vocabulary.",
    "commonMistakes": [
      "Confusing with きんようび",
      "Dropping ようび"
    ]
  },
  {
    "_id": "mock_293",
    "questionText": "What is the Japanese word for 'Thursday'?",
    "questionType": "translation_choice",
    "options": [
      {
        "text": "どようび",
        "isCorrect": false
      },
      {
        "text": "もくようび",
        "isCorrect": true
      },
      {
        "text": "かようび",
        "isCorrect": false
      },
      {
        "text": "げつようび",
        "isCorrect": false
      }
    ],
    "correctAnswer": "もくようび",
    "topic": "time/date",
    "subtopic": "days of the week",
    "skillId": "time.weekdays",
    "lessonIds": [],
    "conceptIds": [],
    "difficulty": "medium",
    "tags": [
      "time",
      "weekdays"
    ],
    "explanation": "もくようび means Thursday.",
    "learningObjective": "Recognize weekday vocabulary.",
    "commonMistakes": [
      "Confusing with かようび",
      "Forgetting もく"
    ]
  },
  {
    "_id": "mock_294",
    "questionText": "What does きんようび mean?",
    "questionType": "translation_choice",
    "options": [
      {
        "text": "Friday",
        "isCorrect": true
      },
      {
        "text": "Sunday",
        "isCorrect": false
      },
      {
        "text": "Wednesday",
        "isCorrect": false
      },
      {
        "text": "morning",
        "isCorrect": false
      }
    ],
    "correctAnswer": "Friday",
    "topic": "time/date",
    "subtopic": "days of the week",
    "skillId": "time.weekdays",
    "lessonIds": [],
    "conceptIds": [],
    "difficulty": "medium",
    "tags": [
      "time",
      "weekdays"
    ],
    "explanation": "きんようび means Friday.",
    "learningObjective": "Recognize weekday vocabulary.",
    "commonMistakes": [
      "Confusing with すいようび",
      "Missing ん"
    ]
  },
  {
    "_id": "mock_295",
    "questionText": "What is the Japanese word for 'Saturday'?",
    "questionType": "translation_choice",
    "options": [
      {
        "text": "かようび",
        "isCorrect": false
      },
      {
        "text": "げつようび",
        "isCorrect": false
      },
      {
        "text": "にちようび",
        "isCorrect": false
      },
      {
        "text": "どようび",
        "isCorrect": true
      }
    ],
    "correctAnswer": "どようび",
    "topic": "time/date",
    "subtopic": "days of the week",
    "skillId": "time.weekdays",
    "lessonIds": [],
    "conceptIds": [],
    "difficulty": "medium",
    "tags": [
      "time",
      "weekdays"
    ],
    "explanation": "どようび means Saturday.",
    "learningObjective": "Recognize weekday vocabulary.",
    "commonMistakes": [
      "Confusing with にちようび",
      "Missing dakuten in ど"
    ]
  },
  {
    "_id": "mock_296",
    "questionText": "What does にちようび mean?",
    "questionType": "translation_choice",
    "options": [
      {
        "text": "Wednesday",
        "isCorrect": false
      },
      {
        "text": "morning",
        "isCorrect": false
      },
      {
        "text": "Sunday",
        "isCorrect": true
      },
      {
        "text": "Friday",
        "isCorrect": false
      }
    ],
    "correctAnswer": "Sunday",
    "topic": "time/date",
    "subtopic": "days of the week",
    "skillId": "time.weekdays",
    "lessonIds": [],
    "conceptIds": [],
    "difficulty": "medium",
    "tags": [
      "time",
      "weekdays"
    ],
    "explanation": "にちようび means Sunday.",
    "learningObjective": "Recognize weekday vocabulary.",
    "commonMistakes": [
      "Confusing with げつようび",
      "Forgetting ようび"
    ]
  },
  {
    "_id": "mock_297",
    "questionText": "What does あさ mean?",
    "questionType": "translation_choice",
    "options": [
      {
        "text": "Wednesday",
        "isCorrect": false
      },
      {
        "text": "morning",
        "isCorrect": true
      },
      {
        "text": "Friday",
        "isCorrect": false
      },
      {
        "text": "Sunday",
        "isCorrect": false
      }
    ],
    "correctAnswer": "morning",
    "topic": "time/date",
    "subtopic": "daily time expressions",
    "skillId": "time.weekdays",
    "lessonIds": [],
    "conceptIds": [],
    "difficulty": "easy",
    "tags": [
      "time",
      "daily expressions"
    ],
    "explanation": "あさ means morning.",
    "learningObjective": "Recognize daily time expressions.",
    "commonMistakes": [
      "Confusing あさ with あした",
      "Using it as a weekday"
    ]
  }
];

export default questions;

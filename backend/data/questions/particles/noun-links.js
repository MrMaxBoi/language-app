// Noun-linking particles (particles.noun_links)
const questions = [
  {
    "_id": "mock_014",
    "questionText": "Which particle indicates possession?",
    "questionType": "multiple_choice",
    "options": [
      {
        "text": "で",
        "isCorrect": false
      },
      {
        "text": "が",
        "isCorrect": false
      },
      {
        "text": "の",
        "isCorrect": true
      },
      {
        "text": "と",
        "isCorrect": false
      }
    ],
    "correctAnswer": "の",
    "topic": "particles",
    "subtopic": "possession",
    "skillId": "particles.noun_links",
    "lessonIds": [
      "lesson-noun-linking-particles"
    ],
    "conceptIds": [],
    "difficulty": "easy",
    "tags": [
      "particles",
      "ownership"
    ],
    "explanation": "の connects nouns to show possession.",
    "learningObjective": "Express relationships between nouns.",
    "commonMistakes": [
      "Replacing の with は",
      "Omitting the particle"
    ]
  },
  {
    "_id": "mock_034",
    "questionText": "Which particle connects two nouns to show ownership?",
    "questionType": "multiple_choice",
    "options": [
      {
        "text": "の",
        "isCorrect": true
      },
      {
        "text": "と",
        "isCorrect": false
      },
      {
        "text": "で",
        "isCorrect": false
      },
      {
        "text": "が",
        "isCorrect": false
      }
    ],
    "correctAnswer": "の",
    "topic": "grammar",
    "subtopic": "noun connection",
    "skillId": "particles.noun_links",
    "lessonIds": [
      "lesson-noun-linking-particles"
    ],
    "conceptIds": [],
    "difficulty": "easy",
    "tags": [
      "grammar",
      "particles"
    ],
    "explanation": "の connects nouns and indicates possession.",
    "learningObjective": "Link nouns naturally in Japanese.",
    "commonMistakes": [
      "Using は",
      "Omitting の"
    ]
  },
  {
    "_id": "mock_043",
    "questionText": "Choose the correct particle: ともだち___はなします。",
    "questionType": "multiple_choice",
    "options": [
      {
        "text": "で",
        "isCorrect": false
      },
      {
        "text": "を",
        "isCorrect": false
      },
      {
        "text": "と",
        "isCorrect": true
      },
      {
        "text": "に",
        "isCorrect": false
      }
    ],
    "correctAnswer": "と",
    "topic": "particles",
    "subtopic": "companion particle",
    "skillId": "particles.noun_links",
    "lessonIds": [
      "lesson-noun-linking-particles"
    ],
    "conceptIds": [],
    "difficulty": "medium",
    "tags": [
      "particles",
      "conversation"
    ],
    "explanation": "と indicates doing something with someone.",
    "learningObjective": "Express actions with companions.",
    "commonMistakes": [
      "Using に",
      "Omitting particle"
    ]
  },
  {
    "_id": "mock_191",
    "questionText": "Choose the correct particle: わたし___ほん",
    "questionType": "multiple_choice",
    "options": [
      {
        "text": "の",
        "isCorrect": true
      },
      {
        "text": "と",
        "isCorrect": false
      },
      {
        "text": "で",
        "isCorrect": false
      },
      {
        "text": "が",
        "isCorrect": false
      }
    ],
    "correctAnswer": "の",
    "topic": "particles",
    "subtopic": "possession",
    "skillId": "particles.noun_links",
    "lessonIds": [
      "lesson-noun-linking-particles"
    ],
    "conceptIds": [],
    "difficulty": "easy",
    "tags": [
      "particles",
      "no",
      "possession"
    ],
    "explanation": "の connects nouns and can show possession: my book.",
    "learningObjective": "Use の to link nouns.",
    "commonMistakes": [
      "Using は between possessor and noun",
      "Reversing noun order"
    ]
  },
  {
    "_id": "mock_192",
    "questionText": "Translate: 'Japanese teacher'",
    "questionType": "fill_in_blank",
    "options": [],
    "correctAnswer": "にほんごのせんせい",
    "topic": "particles",
    "subtopic": "possession",
    "skillId": "particles.noun_links",
    "lessonIds": [
      "lesson-noun-linking-particles"
    ],
    "conceptIds": [],
    "difficulty": "medium",
    "tags": [
      "particles",
      "no",
      "noun connection"
    ],
    "explanation": "の connects にほんご and せんせい to mean Japanese teacher.",
    "learningObjective": "Use の for noun modification.",
    "commonMistakes": [
      "Using adjective order from English",
      "Omitting の"
    ]
  },
  {
    "_id": "mock_193",
    "questionText": "Choose the correct particle: ともだち___いきます。",
    "questionType": "multiple_choice",
    "options": [
      {
        "text": "で",
        "isCorrect": false
      },
      {
        "text": "を",
        "isCorrect": false
      },
      {
        "text": "と",
        "isCorrect": true
      },
      {
        "text": "に",
        "isCorrect": false
      }
    ],
    "correctAnswer": "と",
    "topic": "particles",
    "subtopic": "companion particle",
    "skillId": "particles.noun_links",
    "lessonIds": [
      "lesson-noun-linking-particles"
    ],
    "conceptIds": [],
    "difficulty": "easy",
    "tags": [
      "particles",
      "to",
      "with"
    ],
    "explanation": "と can mean with when marking a companion.",
    "learningObjective": "Use と to mark companions.",
    "commonMistakes": [
      "Using で for a companion",
      "Using に because movement is involved"
    ]
  },
  {
    "_id": "mock_194",
    "questionText": "Translate: 'with my friend'",
    "questionType": "fill_in_blank",
    "options": [],
    "correctAnswer": "ともだちと",
    "topic": "particles",
    "subtopic": "companion particle",
    "skillId": "particles.noun_links",
    "lessonIds": [
      "lesson-noun-linking-particles"
    ],
    "conceptIds": [],
    "difficulty": "easy",
    "tags": [
      "particles",
      "to",
      "with"
    ],
    "explanation": "ともだちと means with a friend.",
    "learningObjective": "Build simple companion phrases.",
    "commonMistakes": [
      "Using の instead of と",
      "Adding で after と"
    ]
  },
  {
    "_id": "mock_195",
    "questionText": "Choose the correct particle: ねこ___いぬ",
    "questionType": "multiple_choice",
    "options": [
      {
        "text": "と",
        "isCorrect": true
      },
      {
        "text": "の",
        "isCorrect": false
      },
      {
        "text": "で",
        "isCorrect": false
      },
      {
        "text": "が",
        "isCorrect": false
      }
    ],
    "correctAnswer": "と",
    "topic": "particles",
    "subtopic": "companion particle",
    "skillId": "particles.noun_links",
    "lessonIds": [
      "lesson-noun-linking-particles"
    ],
    "conceptIds": [],
    "difficulty": "easy",
    "tags": [
      "particles",
      "to",
      "and"
    ],
    "explanation": "と can connect nouns as 'and': cats and dogs.",
    "learningObjective": "Use と to connect nouns.",
    "commonMistakes": [
      "Using の for and",
      "Using と to connect full clauses too broadly"
    ]
  },
  {
    "_id": "mock_196",
    "questionText": "In たなかさんのかばん, what does の show?",
    "questionType": "multiple_choice",
    "options": [
      {
        "text": "action location",
        "isCorrect": false
      },
      {
        "text": "destination",
        "isCorrect": false
      },
      {
        "text": "object",
        "isCorrect": false
      },
      {
        "text": "possession",
        "isCorrect": true
      }
    ],
    "correctAnswer": "possession",
    "topic": "particles",
    "subtopic": "possession",
    "skillId": "particles.noun_links",
    "lessonIds": [
      "lesson-noun-linking-particles"
    ],
    "conceptIds": [],
    "difficulty": "easy",
    "tags": [
      "particles",
      "no",
      "analysis"
    ],
    "explanation": "の links Tanaka and bag, showing Tanaka's bag.",
    "learningObjective": "Identify possession with の.",
    "commonMistakes": [
      "Calling の an object marker",
      "Reading the nouns in the wrong relation"
    ]
  },
  {
    "_id": "mock_197",
    "questionText": "Choose the correct particle: がっこう___ともだちとあいます。",
    "questionType": "multiple_choice",
    "options": [
      {
        "text": "に",
        "isCorrect": false
      },
      {
        "text": "を",
        "isCorrect": false
      },
      {
        "text": "で",
        "isCorrect": true
      },
      {
        "text": "と",
        "isCorrect": false
      }
    ],
    "correctAnswer": "で",
    "topic": "particles",
    "subtopic": "companion particle",
    "skillId": "particles.noun_links",
    "lessonIds": [
      "lesson-noun-linking-particles"
    ],
    "conceptIds": [],
    "difficulty": "medium",
    "tags": [
      "particles",
      "mixed",
      "with"
    ],
    "explanation": "ともだちと marks with a friend; がっこうで marks where meeting happens.",
    "learningObjective": "Distinguish companion と from location で.",
    "commonMistakes": [
      "Using と after the place",
      "Missing the companion marker"
    ]
  }
];

export default questions;

// Advanced verb forms (verbs.advanced_forms)
const questions = [
  {
    "_id": "mock_067",
    "questionText": "What is the correct way to say 'I will go' (casual)?",
    "questionType": "fill_in_blank",
    "options": [],
    "correctAnswer": "いく",
    "topic": "verbs",
    "subtopic": "casual form",
    "skillId": "verbs.advanced_forms",
    "lessonIds": [],
    "conceptIds": [],
    "difficulty": "medium",
    "tags": [
      "verbs"
    ],
    "explanation": "Dictionary form いく is used casually.",
    "learningObjective": "Understand casual verb forms.",
    "commonMistakes": [
      "Using いきます in casual speech",
      "Mixing politeness levels"
    ]
  },
  {
    "_id": "mock_069",
    "questionText": "Translate 'I want to eat sushi.'",
    "questionType": "fill_in_blank",
    "options": [],
    "correctAnswer": "すしをたべたいです",
    "topic": "grammar",
    "subtopic": "desire form",
    "skillId": "verbs.advanced_forms",
    "lessonIds": [],
    "conceptIds": [],
    "difficulty": "medium",
    "tags": [
      "grammar",
      "desire"
    ],
    "explanation": "たいです expresses desire.",
    "learningObjective": "Express wants in Japanese.",
    "commonMistakes": [
      "Using ほしい incorrectly",
      "Wrong verb form"
    ]
  },
  {
    "_id": "mock_081",
    "questionText": "Translate 'I can speak Japanese a little.'",
    "questionType": "fill_in_blank",
    "options": [],
    "correctAnswer": "にほんごがすこしはなせます",
    "topic": "verbs",
    "subtopic": "ability",
    "skillId": "verbs.advanced_forms",
    "lessonIds": [],
    "conceptIds": [],
    "difficulty": "medium",
    "tags": [
      "verbs"
    ],
    "explanation": "Potential form はなせます expresses ability.",
    "learningObjective": "Express abilities.",
    "commonMistakes": [
      "Using できる incorrectly",
      "Wrong particle usage"
    ]
  },
  {
    "_id": "mock_086",
    "questionText": "What is the honorific form of いく?",
    "questionType": "multiple_choice",
    "options": [
      {
        "text": "いく",
        "isCorrect": false
      },
      {
        "text": "まいる",
        "isCorrect": false
      },
      {
        "text": "いきます",
        "isCorrect": false
      },
      {
        "text": "いらっしゃる",
        "isCorrect": true
      }
    ],
    "correctAnswer": "いらっしゃる",
    "topic": "grammar",
    "subtopic": "keigo",
    "skillId": "verbs.advanced_forms",
    "lessonIds": [],
    "conceptIds": [],
    "difficulty": "hard",
    "tags": [
      "keigo"
    ],
    "explanation": "いらっしゃる is honorific for go/come.",
    "learningObjective": "Use honorific verbs.",
    "commonMistakes": [
      "Using polite form instead of honorific",
      "Incorrect verb choice"
    ]
  },
  {
    "_id": "mock_088",
    "questionText": "What does させる form indicate?",
    "questionType": "translation_choice",
    "options": [
      {
        "text": "desire (want to do)",
        "isCorrect": false
      },
      {
        "text": "causative (make/let someone do)",
        "isCorrect": true
      },
      {
        "text": "passive (something is done)",
        "isCorrect": false
      },
      {
        "text": "potential (can do)",
        "isCorrect": false
      }
    ],
    "correctAnswer": "causative (make/let someone do)",
    "topic": "verbs",
    "subtopic": "causative",
    "skillId": "verbs.advanced_forms",
    "lessonIds": [],
    "conceptIds": [],
    "difficulty": "hard",
    "tags": [
      "verbs"
    ],
    "explanation": "させる expresses causation.",
    "learningObjective": "Understand causative verbs.",
    "commonMistakes": [
      "Confusing with passive form",
      "Incorrect conjugation"
    ]
  },
  {
    "_id": "mock_089",
    "questionText": "Translate 'I was made to study Japanese.'",
    "questionType": "fill_in_blank",
    "options": [],
    "correctAnswer": "にほんごをべんきょうさせられました",
    "topic": "verbs",
    "subtopic": "causative passive",
    "skillId": "verbs.advanced_forms",
    "lessonIds": [],
    "conceptIds": [],
    "difficulty": "hard",
    "tags": [
      "verbs"
    ],
    "explanation": "させられる is causative passive form.",
    "learningObjective": "Express forced actions.",
    "commonMistakes": [
      "Confusing with passive only",
      "Incorrect verb stem"
    ]
  },
  {
    "_id": "mock_090",
    "questionText": "What does 〜ばいいですか express?",
    "questionType": "translation_choice",
    "options": [
      {
        "text": "end",
        "isCorrect": false
      },
      {
        "text": "makes it polite",
        "isCorrect": false
      },
      {
        "text": "asking for advice",
        "isCorrect": true
      },
      {
        "text": "completion or regret",
        "isCorrect": false
      }
    ],
    "correctAnswer": "asking for advice",
    "topic": "grammar",
    "subtopic": "advice expressions",
    "skillId": "verbs.advanced_forms",
    "lessonIds": [],
    "conceptIds": [],
    "difficulty": "hard",
    "tags": [
      "grammar"
    ],
    "explanation": "Used to ask what one should do.",
    "learningObjective": "Ask for advice politely.",
    "commonMistakes": [
      "Using with wrong verb form",
      "Literal translation errors"
    ]
  },
  {
    "_id": "mock_093",
    "questionText": "Translate 'I have never eaten sushi.'",
    "questionType": "fill_in_blank",
    "options": [],
    "correctAnswer": "すしをたべたことがありません",
    "topic": "grammar",
    "subtopic": "experience",
    "skillId": "verbs.advanced_forms",
    "lessonIds": [],
    "conceptIds": [],
    "difficulty": "hard",
    "tags": [
      "grammar"
    ],
    "explanation": "たことがない expresses lack of experience.",
    "learningObjective": "Express experiences.",
    "commonMistakes": [
      "Using past tense only",
      "Omitting が"
    ]
  },
  {
    "_id": "mock_100",
    "questionText": "What is the nuance of 〜てしまう?",
    "questionType": "multiple_choice",
    "options": [
      {
        "text": "completion or regret",
        "isCorrect": true
      },
      {
        "text": "asking for advice",
        "isCorrect": false
      },
      {
        "text": "please wait",
        "isCorrect": false
      },
      {
        "text": "a little",
        "isCorrect": false
      }
    ],
    "correctAnswer": "completion or regret",
    "topic": "verbs",
    "subtopic": "aspect",
    "skillId": "verbs.advanced_forms",
    "lessonIds": [],
    "conceptIds": [],
    "difficulty": "hard",
    "tags": [
      "verbs"
    ],
    "explanation": "Indicates completion or unintended action.",
    "learningObjective": "Understand verb aspect nuance.",
    "commonMistakes": [
      "Ignoring emotional nuance",
      "Misusing in formal writing"
    ]
  }
];

export default questions;

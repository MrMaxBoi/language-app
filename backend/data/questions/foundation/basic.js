// Basic pronunciation (pronunciation.basic)
const questions = [
  {
    "_id": "mock_103",
    "questionText": "How many mora are in the word がっこう?",
    "questionType": "multiple_choice",
    "options": [
      {
        "text": "5",
        "isCorrect": false
      },
      {
        "text": "4",
        "isCorrect": true
      },
      {
        "text": "2",
        "isCorrect": false
      },
      {
        "text": "3",
        "isCorrect": false
      }
    ],
    "correctAnswer": "4",
    "topic": "pronunciation",
    "subtopic": "basic pronunciation",
    "skillId": "pronunciation.basic",
    "lessonIds": [
      "lesson-basic-pronunciation",
      "foundations-pronunciation-mora"
    ],
    "conceptIds": [
      "pronunciation.mora_counting"
    ],
    "difficulty": "medium",
    "tags": [
      "pronunciation",
      "mora",
      "foundation"
    ],
    "explanation": "がっこう is counted as が・っ・こ・う, four mora.",
    "learningObjective": "Understand basic Japanese mora timing.",
    "commonMistakes": [
      "Ignoring the small っ",
      "Treating long vowels like English stress"
    ]
  },
  {
    "_id": "mock_123",
    "questionText": "How many mora are in こんにちは?",
    "questionType": "multiple_choice",
    "options": [
      {
        "text": "3",
        "isCorrect": false
      },
      {
        "text": "4",
        "isCorrect": false
      },
      {
        "text": "6",
        "isCorrect": false
      },
      {
        "text": "5",
        "isCorrect": true
      }
    ],
    "correctAnswer": "5",
    "topic": "pronunciation",
    "subtopic": "basic pronunciation",
    "skillId": "pronunciation.basic",
    "lessonIds": [
      "lesson-basic-pronunciation",
      "foundations-pronunciation-mora"
    ],
    "conceptIds": [
      "pronunciation.mora_counting"
    ],
    "difficulty": "easy",
    "tags": [
      "pronunciation",
      "mora",
      "foundation"
    ],
    "explanation": "こんにちは is counted as こ・ん・に・ち・は, five mora.",
    "learningObjective": "Count mora in common Japanese words.",
    "commonMistakes": [
      "Treating ん as part of the previous sound",
      "Counting syllables like English"
    ]
  },
  {
    "_id": "mock_124",
    "questionText": "What does a small っ usually indicate?",
    "questionType": "translation_choice",
    "options": [
      {
        "text": "a question marker",
        "isCorrect": false
      },
      {
        "text": "a topic marker",
        "isCorrect": false
      },
      {
        "text": "a doubled consonant or brief pause",
        "isCorrect": true
      },
      {
        "text": "a long vowel",
        "isCorrect": false
      }
    ],
    "correctAnswer": "a doubled consonant or brief pause",
    "topic": "pronunciation",
    "subtopic": "basic pronunciation",
    "skillId": "pronunciation.basic",
    "lessonIds": [
      "lesson-basic-pronunciation",
      "foundations-pronunciation-small-tsu"
    ],
    "conceptIds": [
      "pronunciation.small_tsu"
    ],
    "difficulty": "medium",
    "tags": [
      "pronunciation",
      "small tsu",
      "foundation"
    ],
    "explanation": "Small っ creates a brief pause before a doubled consonant, as in がっこう.",
    "learningObjective": "Recognize the pronunciation role of small っ.",
    "commonMistakes": [
      "Pronouncing it as つ",
      "Skipping the pause"
    ]
  },
  {
    "_id": "mock_125",
    "questionText": "Which word has a long vowel sound?",
    "questionType": "multiple_choice",
    "options": [
      {
        "text": "あね",
        "isCorrect": false
      },
      {
        "text": "おかあさん",
        "isCorrect": true
      },
      {
        "text": "あ",
        "isCorrect": false
      },
      {
        "text": "あたらしい",
        "isCorrect": false
      }
    ],
    "correctAnswer": "おかあさん",
    "topic": "pronunciation",
    "subtopic": "basic pronunciation",
    "skillId": "pronunciation.basic",
    "lessonIds": [
      "lesson-basic-pronunciation",
      "foundations-pronunciation-long-vowels"
    ],
    "conceptIds": [
      "pronunciation.long_vowels"
    ],
    "difficulty": "medium",
    "tags": [
      "pronunciation",
      "long vowels",
      "foundation"
    ],
    "explanation": "おかあさん contains a long あ sound.",
    "learningObjective": "Recognize long vowel sounds.",
    "commonMistakes": [
      "Shortening long vowels",
      "Treating double vowels as separate words"
    ]
  },
  {
    "_id": "mock_126",
    "questionText": "In せんせい, what sound does ん represent?",
    "questionType": "multiple_choice",
    "options": [
      {
        "text": "n",
        "isCorrect": true
      },
      {
        "text": "a little",
        "isCorrect": false
      },
      {
        "text": "action location",
        "isCorrect": false
      },
      {
        "text": "airplane",
        "isCorrect": false
      }
    ],
    "correctAnswer": "n",
    "topic": "pronunciation",
    "subtopic": "basic pronunciation",
    "skillId": "pronunciation.basic",
    "lessonIds": [
      "lesson-basic-pronunciation",
      "foundations-pronunciation-syllabic-n"
    ],
    "conceptIds": [
      "pronunciation.syllabic_n"
    ],
    "difficulty": "easy",
    "tags": [
      "pronunciation",
      "mora",
      "foundation"
    ],
    "explanation": "ん is the nasal mora often written as 'n'.",
    "learningObjective": "Recognize the nasal mora ん.",
    "commonMistakes": [
      "Ignoring ん",
      "Attaching it fully to the next mora"
    ]
  }
];

export default questions;

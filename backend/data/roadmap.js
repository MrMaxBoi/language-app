import { getSkillById } from "./skillGraph.js";
import { getConceptById } from "./concepts.js";
import { lessonNode } from "./roadmapBuilder.js";
import { JAPANESE_FOUNDATIONS_ROADMAP } from "./roadmaps/japaneseFoundations.js";

export const ROADMAP_UNITS = [
  {
    id: "unit-1-writing-system-foundation",
    title: "Writing System Foundation",
    description: "Build the kana and pronunciation base needed for beginner Japanese.",
    lessons: [
      lessonNode({
        id: "lesson-hiragana-recognition",
        title: "Hiragana Recognition",
        description: "Recognize core hiragana characters and sounds.",
        primarySkillIds: ["kana.hiragana"],
        recommendedQuestionTypes: ["multiple_choice", "meaning_match"],
      }),
      lessonNode({
        id: "lesson-basic-pronunciation",
        title: "Basic Pronunciation",
        description: "Connect kana, mora timing, and common sound patterns.",
        primarySkillIds: ["pronunciation.basic"],
        supportSkillIds: ["kana.hiragana"],
        recommendedQuestionTypes: ["multiple_choice", "meaning_match"],
      }),
      lessonNode({
        id: "lesson-katakana-recognition",
        title: "Katakana Recognition",
        description: "Recognize core katakana characters and sounds.",
        primarySkillIds: ["kana.katakana"],
        supportSkillIds: ["kana.hiragana"],
        recommendedQuestionTypes: ["multiple_choice", "meaning_match"],
      }),
    ],
  },
  {
    id: "unit-2-first-words-greetings",
    title: "First Words and Greetings",
    description: "Learn immediate usable Japanese through greetings and starter vocabulary.",
    lessons: [
      lessonNode({
        id: "lesson-daily-greetings",
        title: "Daily Greetings",
        description: "Use basic greetings and polite everyday expressions.",
        primarySkillIds: ["greetings.daily"],
        supportSkillIds: ["kana.hiragana"],
      }),
      lessonNode({
        id: "lesson-basic-nouns",
        title: "Basic Nouns",
        description: "Recognize high-frequency everyday nouns.",
        primarySkillIds: ["vocab.basic_nouns"],
        supportSkillIds: ["kana.hiragana"],
      }),
      lessonNode({
        id: "lesson-people-school-words",
        title: "People and School Words",
        description: "Recognize common people, role, and school terms.",
        primarySkillIds: ["vocab.people_school"],
        supportSkillIds: ["kana.hiragana"],
      }),
      lessonNode({
        id: "lesson-basic-counting",
        title: "Basic Counting",
        description: "Recognize and use basic Japanese numbers.",
        primarySkillIds: ["numbers.basic_counting"],
        supportSkillIds: ["kana.hiragana"],
      }),
    ],
  },
  {
    id: "unit-3-first-sentence-shape",
    title: "First Sentence Shape",
    description: "Move from words into simple Japanese sentence structure.",
    lessons: [
      lessonNode({
        id: "lesson-basic-sentence-structure",
        title: "Basic Sentence Structure",
        description: "Understand simple Japanese word order and predicate endings.",
        primarySkillIds: ["grammar.basic_sentence_structure"],
        supportSkillIds: ["kana.hiragana"],
        recommendedQuestionTypes: ["fill_in_blank", "multiple_choice"],
      }),
      lessonNode({
        id: "lesson-topic-particle-wa",
        title: "Topic Particle wa",
        description: "Use は to mark the topic of a sentence.",
        primarySkillIds: ["particles.topic_wa"],
        supportSkillIds: ["grammar.basic_sentence_structure"],
      }),
      lessonNode({
        id: "lesson-questions-with-ka",
        title: "Questions with ka",
        description: "Form and understand simple questions with か.",
        primarySkillIds: ["grammar.questions"],
        supportSkillIds: ["grammar.basic_sentence_structure"],
      }),
      lessonNode({
        id: "lesson-subject-ga-existence",
        title: "Subject Particle ga and Existence",
        description: "Use が for subjects and simple existence patterns.",
        primarySkillIds: ["particles.subject_ga"],
        supportSkillIds: ["grammar.basic_sentence_structure"],
      }),
    ],
  },
  {
    id: "unit-4-everyday-vocabulary-expansion",
    title: "Everyday Vocabulary Expansion",
    description: "Build enough vocabulary for meaningful beginner sentences.",
    lessons: [
      lessonNode({
        id: "lesson-family-vocabulary",
        title: "Family Vocabulary",
        description: "Recognize common family terms.",
        primarySkillIds: ["vocab.family"],
        supportSkillIds: ["kana.hiragana"],
      }),
      lessonNode({
        id: "lesson-food-drinks",
        title: "Food and Drinks",
        description: "Recognize common food and drink terms.",
        primarySkillIds: ["vocab.food_drinks"],
        supportSkillIds: ["kana.hiragana"],
      }),
      lessonNode({
        id: "lesson-places-vocabulary",
        title: "Places Vocabulary",
        description: "Recognize common place and location words.",
        primarySkillIds: ["vocab.places"],
        supportSkillIds: ["kana.hiragana"],
      }),
      lessonNode({
        id: "lesson-transportation-vocabulary",
        title: "Transportation Vocabulary",
        description: "Recognize travel and transportation terms.",
        primarySkillIds: ["vocab.transportation"],
        supportSkillIds: ["kana.hiragana"],
      }),
      lessonNode({
        id: "lesson-daily-activities",
        title: "Daily Activities",
        description: "Recognize common daily activity words.",
        primarySkillIds: ["vocab.daily_activities"],
        supportSkillIds: ["kana.hiragana"],
      }),
      lessonNode({
        id: "lesson-animal-vocabulary",
        title: "Animal Vocabulary",
        description: "Recognize basic animal vocabulary.",
        primarySkillIds: ["vocab.animals"],
        supportSkillIds: ["kana.hiragana"],
      }),
    ],
  },
  {
    id: "unit-5-core-particles",
    title: "Core Particles",
    description: "Practice the particles that make beginner Japanese sentences work.",
    lessons: [
      lessonNode({
        id: "lesson-object-particle-wo",
        title: "Object Particle wo",
        description: "Use を to mark direct objects.",
        primarySkillIds: ["particles.object_wo"],
        supportSkillIds: ["grammar.basic_sentence_structure", "verbs.present_polite"],
      }),
      lessonNode({
        id: "lesson-destination-particle-ni",
        title: "Destination Particle ni",
        description: "Use に to mark destinations and movement targets.",
        primarySkillIds: ["particles.destination_ni"],
        supportSkillIds: ["grammar.basic_sentence_structure", "vocab.transportation"],
      }),
      lessonNode({
        id: "lesson-location-means-particle-de",
        title: "Location and Means Particle de",
        description: "Use で for action locations and means.",
        primarySkillIds: ["particles.location_de"],
        supportSkillIds: ["grammar.basic_sentence_structure"],
      }),
      lessonNode({
        id: "lesson-noun-linking-particles",
        title: "Noun-Linking Particles",
        description: "Use の and と to connect nouns and companions.",
        primarySkillIds: ["particles.noun_links"],
        supportSkillIds: ["grammar.basic_sentence_structure"],
      }),
    ],
  },
  {
    id: "unit-6-basic-verbs",
    title: "Basic Verbs",
    description: "Introduce simple actions and beginner conjugation.",
    lessons: [
      lessonNode({
        id: "lesson-present-polite-verbs",
        title: "Present Polite Verbs",
        description: "Use polite non-past verb forms.",
        primarySkillIds: ["verbs.present_polite"],
        supportSkillIds: ["grammar.basic_sentence_structure"],
      }),
      lessonNode({
        id: "lesson-past-polite-verbs",
        title: "Past Polite Verbs",
        description: "Convert common verbs into polite past tense.",
        primarySkillIds: ["verbs.past_polite"],
        supportSkillIds: ["verbs.present_polite"],
      }),
      lessonNode({
        id: "lesson-negative-polite-verbs",
        title: "Negative Polite Verbs",
        description: "Convert common verbs into polite negative forms.",
        primarySkillIds: ["verbs.negative_polite"],
        supportSkillIds: ["verbs.present_polite"],
      }),
      lessonNode({
        id: "lesson-te-form-requests",
        title: "Te-form and Requests",
        description: "Use te-form in simple request and connection patterns.",
        primarySkillIds: ["verbs.te_form"],
        supportSkillIds: ["verbs.present_polite"],
      }),
    ],
  },
  {
    id: "unit-7-describing-things",
    title: "Describing Things",
    description: "Describe people, objects, weather, and preferences.",
    lessons: [
      lessonNode({
        id: "lesson-core-adjectives",
        title: "Core Adjectives",
        description: "Recognize and use common i-adjectives and descriptors.",
        primarySkillIds: ["adjectives.core"],
        supportSkillIds: ["grammar.basic_sentence_structure"],
      }),
      lessonNode({
        id: "lesson-na-adjectives",
        title: "Na-Adjectives",
        description: "Recognize and use common na-adjective patterns.",
        primarySkillIds: ["adjectives.na"],
        supportSkillIds: ["grammar.basic_sentence_structure"],
      }),
      lessonNode({
        id: "lesson-weather-adjectives",
        title: "Weather Adjectives",
        description: "Describe basic weather conditions.",
        primarySkillIds: ["adjectives.weather"],
        supportSkillIds: ["adjectives.core"],
      }),
      lessonNode({
        id: "lesson-likes-dislikes",
        title: "Likes and Dislikes",
        description: "Express likes, dislikes, and preferences.",
        primarySkillIds: ["grammar.likes_dislikes"],
        supportSkillIds: ["particles.subject_ga", "adjectives.na"],
      }),
      lessonNode({
        id: "lesson-wants-desires",
        title: "Wants and Desires",
        description: "Express wanting objects or wanting to do actions.",
        primarySkillIds: ["grammar.wants_desires"],
        supportSkillIds: ["verbs.present_polite", "adjectives.core"],
      }),
    ],
  },
  {
    id: "unit-8-reading-foundation",
    title: "Reading Foundation",
    description: "Turn kana, vocabulary, and grammar into short beginner reading practice.",
    lessons: [
      lessonNode({
        id: "lesson-word-recognition",
        title: "Word Recognition",
        description: "Recognize familiar words in kana and simple kanji contexts.",
        primarySkillIds: ["reading.word_recognition"],
        supportSkillIds: ["kana.hiragana", "kana.katakana"],
      }),
      lessonNode({
        id: "lesson-sentence-reading",
        title: "Sentence Reading",
        description: "Read short N5 sentences for literal meaning.",
        primarySkillIds: ["reading.sentence_reading"],
        supportSkillIds: ["reading.word_recognition", "grammar.basic_sentence_structure"],
      }),
      lessonNode({
        id: "lesson-context-understanding",
        title: "Context Understanding",
        description: "Use context to infer meaning across short connected sentences.",
        primarySkillIds: ["reading.context_understanding"],
        supportSkillIds: ["reading.sentence_reading"],
      }),
    ],
  },
];

export const DEFAULT_ROADMAP_ID = "n5-foundation";

export const N5_FOUNDATION_ROADMAP = {
  id: DEFAULT_ROADMAP_ID,
  title: "JLPT N5 Foundation",
  shortLabel: "N5",
  description: "Build practical beginner Japanese through an adaptive N5 learning path.",
  level: "N5",
  units: ROADMAP_UNITS,
};

export const ROADMAPS = [JAPANESE_FOUNDATIONS_ROADMAP, N5_FOUNDATION_ROADMAP];

const roadmapsById = new Map(ROADMAPS.map((roadmap) => [roadmap.id, roadmap]));

export const getRoadmapById = (roadmapId = DEFAULT_ROADMAP_ID) =>
  roadmapsById.get(roadmapId) || null;

const flattenUnits = (roadmap) =>
  roadmap.units.flatMap((unit, unitIndex) =>
    unit.lessons.map((lesson, lessonIndex) => ({
      ...lesson,
      roadmapId: roadmap.id,
      roadmapTitle: roadmap.title,
      unitId: unit.id,
      unitTitle: unit.title,
      unitIndex,
      lessonIndex,
      globalIndex: roadmap.units.slice(0, unitIndex).reduce((sum, current) => sum + current.lessons.length, 0) + lessonIndex,
    }))
  );

export const flattenRoadmapLessons = (roadmapId = DEFAULT_ROADMAP_ID) => {
  const roadmap = getRoadmapById(roadmapId);
  return roadmap ? flattenUnits(roadmap) : [];
};

export const flattenAllRoadmapLessons = () => ROADMAPS.flatMap(flattenUnits);

const lessonsById = new Map(flattenAllRoadmapLessons().map((lesson) => [lesson.id, lesson]));

export const getRoadmapLessonById = (lessonId) => lessonsById.get(lessonId) || null;

export const validateRoadmap = (roadmapId) => {
  const lessons = roadmapId ? flattenRoadmapLessons(roadmapId) : flattenAllRoadmapLessons();
  const duplicateLessonIds = flattenAllRoadmapLessons()
    .filter((lesson, index, allLessons) => allLessons.findIndex((item) => item.id === lesson.id) !== index)
    .map((lesson) => ({ lessonId: lesson.id, issue: "duplicate_lesson_id" }));

  return [
    ...duplicateLessonIds,
    ...lessons.flatMap((lesson) => [
      ...lesson.skillIds
        .filter((skillId) => !getSkillById(skillId))
        .map((skillId) => ({ lessonId: lesson.id, skillId, issue: "missing_skill" })),
      ...lesson.conceptIds
        .filter((conceptId) => !getConceptById(conceptId))
        .map((conceptId) => ({ lessonId: lesson.id, conceptId, issue: "missing_concept" })),
    ]),
  ];
};

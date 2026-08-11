import kanaHiraganaQuestions from "./foundation/hiragana.js";
import kanaKatakanaQuestions from "./foundation/katakana.js";
import pronunciationBasicQuestions from "./foundation/basic.js";
import grammarBasicSentenceStructureQuestions from "./grammar/basic-sentence-structure.js";
import vocabBasicNounsQuestions from "./vocabulary/basic-nouns.js";
import vocabPeopleSchoolQuestions from "./vocabulary/people-school.js";
import vocabAnimalsQuestions from "./vocabulary/animals.js";
import vocabFamilyQuestions from "./vocabulary/family.js";
import vocabFoodDrinksQuestions from "./vocabulary/food-drinks.js";
import vocabTransportationQuestions from "./vocabulary/transportation.js";
import vocabPlacesQuestions from "./vocabulary/places.js";
import vocabDailyActivitiesQuestions from "./vocabulary/daily-activities.js";
import greetingsDailyQuestions from "./conversation/daily.js";
import numbersBasicCountingQuestions from "./vocabulary/basic-counting.js";
import timeWeekdaysQuestions from "./vocabulary/weekdays.js";
import timeAskingTimeQuestions from "./conversation/asking-time.js";
import particlesTopicWaQuestions from "./particles/topic-wa.js";
import particlesSubjectGaQuestions from "./particles/subject-ga.js";
import particlesObjectWoQuestions from "./particles/object-wo.js";
import particlesDestinationNiQuestions from "./particles/destination-ni.js";
import particlesLocationDeQuestions from "./particles/location-de.js";
import particlesNounLinksQuestions from "./particles/noun-links.js";
import particlesAdvancedQuestions from "./particles/advanced.js";
import verbsPresentPoliteQuestions from "./verbs/present-polite.js";
import verbsPastPoliteQuestions from "./verbs/past-polite.js";
import verbsNegativePoliteQuestions from "./verbs/negative-polite.js";
import verbsTeFormQuestions from "./verbs/te-form.js";
import verbsAdvancedFormsQuestions from "./verbs/advanced-forms.js";
import adjectivesCoreQuestions from "./adjectives/core.js";
import adjectivesWeatherQuestions from "./adjectives/weather.js";
import adjectivesNaQuestions from "./adjectives/na.js";
import grammarQuestionsQuestions from "./grammar/questions.js";
import grammarLikesDislikesQuestions from "./grammar/likes-dislikes.js";
import grammarWantsDesiresQuestions from "./grammar/wants-desires.js";
import grammarComparisonConditionalsQuestions from "./grammar/comparison-conditionals.js";
import grammarClausesUncertaintyQuestions from "./grammar/clauses-uncertainty.js";
import readingWordRecognitionQuestions from "./reading/word-recognition.js";
import readingSentenceReadingQuestions from "./reading/sentence-reading.js";
import readingContextUnderstandingQuestions from "./reading/context-understanding.js";

export const QUESTION_PACKS = Object.freeze([
  {
    strand: "Foundation",
    skillId: "kana.hiragana",
    questions: kanaHiraganaQuestions,
  },
  {
    strand: "Foundation",
    skillId: "kana.katakana",
    questions: kanaKatakanaQuestions,
  },
  {
    strand: "Foundation",
    skillId: "pronunciation.basic",
    questions: pronunciationBasicQuestions,
  },
  {
    strand: "Grammar",
    skillId: "grammar.basic_sentence_structure",
    questions: grammarBasicSentenceStructureQuestions,
  },
  {
    strand: "Vocabulary",
    skillId: "vocab.basic_nouns",
    questions: vocabBasicNounsQuestions,
  },
  {
    strand: "Vocabulary",
    skillId: "vocab.people_school",
    questions: vocabPeopleSchoolQuestions,
  },
  {
    strand: "Vocabulary",
    skillId: "vocab.animals",
    questions: vocabAnimalsQuestions,
  },
  {
    strand: "Vocabulary",
    skillId: "vocab.family",
    questions: vocabFamilyQuestions,
  },
  {
    strand: "Vocabulary",
    skillId: "vocab.food_drinks",
    questions: vocabFoodDrinksQuestions,
  },
  {
    strand: "Vocabulary",
    skillId: "vocab.transportation",
    questions: vocabTransportationQuestions,
  },
  {
    strand: "Vocabulary",
    skillId: "vocab.places",
    questions: vocabPlacesQuestions,
  },
  {
    strand: "Vocabulary",
    skillId: "vocab.daily_activities",
    questions: vocabDailyActivitiesQuestions,
  },
  {
    strand: "Conversation",
    skillId: "greetings.daily",
    questions: greetingsDailyQuestions,
  },
  {
    strand: "Vocabulary",
    skillId: "numbers.basic_counting",
    questions: numbersBasicCountingQuestions,
  },
  {
    strand: "Vocabulary",
    skillId: "time.weekdays",
    questions: timeWeekdaysQuestions,
  },
  {
    strand: "Conversation",
    skillId: "time.asking_time",
    questions: timeAskingTimeQuestions,
  },
  {
    strand: "Particles",
    skillId: "particles.topic_wa",
    questions: particlesTopicWaQuestions,
  },
  {
    strand: "Particles",
    skillId: "particles.subject_ga",
    questions: particlesSubjectGaQuestions,
  },
  {
    strand: "Particles",
    skillId: "particles.object_wo",
    questions: particlesObjectWoQuestions,
  },
  {
    strand: "Particles",
    skillId: "particles.destination_ni",
    questions: particlesDestinationNiQuestions,
  },
  {
    strand: "Particles",
    skillId: "particles.location_de",
    questions: particlesLocationDeQuestions,
  },
  {
    strand: "Particles",
    skillId: "particles.noun_links",
    questions: particlesNounLinksQuestions,
  },
  {
    strand: "Particles",
    skillId: "particles.advanced",
    questions: particlesAdvancedQuestions,
  },
  {
    strand: "Verbs",
    skillId: "verbs.present_polite",
    questions: verbsPresentPoliteQuestions,
  },
  {
    strand: "Verbs",
    skillId: "verbs.past_polite",
    questions: verbsPastPoliteQuestions,
  },
  {
    strand: "Verbs",
    skillId: "verbs.negative_polite",
    questions: verbsNegativePoliteQuestions,
  },
  {
    strand: "Verbs",
    skillId: "verbs.te_form",
    questions: verbsTeFormQuestions,
  },
  {
    strand: "Verbs",
    skillId: "verbs.advanced_forms",
    questions: verbsAdvancedFormsQuestions,
  },
  {
    strand: "Adjectives",
    skillId: "adjectives.core",
    questions: adjectivesCoreQuestions,
  },
  {
    strand: "Adjectives",
    skillId: "adjectives.weather",
    questions: adjectivesWeatherQuestions,
  },
  {
    strand: "Adjectives",
    skillId: "adjectives.na",
    questions: adjectivesNaQuestions,
  },
  {
    strand: "Grammar",
    skillId: "grammar.questions",
    questions: grammarQuestionsQuestions,
  },
  {
    strand: "Grammar",
    skillId: "grammar.likes_dislikes",
    questions: grammarLikesDislikesQuestions,
  },
  {
    strand: "Grammar",
    skillId: "grammar.wants_desires",
    questions: grammarWantsDesiresQuestions,
  },
  {
    strand: "Grammar",
    skillId: "grammar.comparison_conditionals",
    questions: grammarComparisonConditionalsQuestions,
  },
  {
    strand: "Grammar",
    skillId: "grammar.clauses_uncertainty",
    questions: grammarClausesUncertaintyQuestions,
  },
  {
    strand: "Reading",
    skillId: "reading.word_recognition",
    questions: readingWordRecognitionQuestions,
  },
  {
    strand: "Reading",
    skillId: "reading.sentence_reading",
    questions: readingSentenceReadingQuestions,
  },
  {
    strand: "Reading",
    skillId: "reading.context_understanding",
    questions: readingContextUnderstandingQuestions,
  },
]);

const LEGACY_QUESTION_ID = /^mock_(\d+)$/;

const compareQuestionIds = (left, right) => {
  const leftMatch = LEGACY_QUESTION_ID.exec(left._id);
  const rightMatch = LEGACY_QUESTION_ID.exec(right._id);

  if (leftMatch && rightMatch) {
    return Number(leftMatch[1]) - Number(rightMatch[1]);
  }

  return String(left._id).localeCompare(String(right._id), undefined, { numeric: true });
};

const questions = QUESTION_PACKS
  .flatMap((pack) => pack.questions)
  .sort(compareQuestionIds);

export default questions;

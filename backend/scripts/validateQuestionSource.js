import questions, { QUESTION_PACKS } from "../data/questions.js";
import { CONCEPTS } from "../data/concepts.js";
import { flattenAllRoadmapLessons } from "../data/roadmap.js";
import { SKILL_GRAPH } from "../data/skillGraph.js";
import { CHOICE_QUESTION_TYPES, inferQuestionType } from "../utils/questionType.js";

const REQUIRED_STRING_FIELDS = [
  "_id",
  "questionText",
  "correctAnswer",
  "topic",
  "subtopic",
  "skillId",
  "difficulty",
  "explanation",
  "learningObjective",
];

const REQUIRED_ARRAY_FIELDS = ["tags", "commonMistakes"];
const VALID_DIFFICULTIES = new Set(["easy", "medium", "hard"]);
const VALID_QUESTION_TYPES = new Set([
  ...CHOICE_QUESTION_TYPES,
  "fill_in_blank",
]);
const skillById = new Map(SKILL_GRAPH.map((skill) => [skill.id, skill]));
const conceptById = new Map(CONCEPTS.map((item) => [item.id, item]));
const allRoadmapLessons = flattenAllRoadmapLessons();
const lessonById = new Map(allRoadmapLessons.map((lesson) => [lesson.id, lesson]));
const primaryLessonsBySkillId = allRoadmapLessons.reduce((lookup, lesson) => {
  for (const skillId of lesson.primarySkillIds) {
    if (!lookup.has(skillId)) lookup.set(skillId, []);
    lookup.get(skillId).push(lesson.id);
  }
  return lookup;
}, new Map());
const foundationSkillIds = new Set(
  SKILL_GRAPH.filter((skill) => skill.strand === "Foundation").map((skill) => skill.id)
);
const errors = [];
const seenQuestionIds = new Map();

const addError = (message) => errors.push(message);

for (const pack of QUESTION_PACKS) {
  const skill = skillById.get(pack.skillId);

  if (!skill) {
    addError(`Pack references unknown skillId: ${pack.skillId}`);
    continue;
  }

  if (pack.strand !== skill.strand) {
    addError(
      `Pack ${pack.skillId} uses strand ${pack.strand}; skill graph expects ${skill.strand}`
    );
  }

  if (!Array.isArray(pack.questions) || pack.questions.length === 0) {
    addError(`Pack ${pack.skillId} has no questions`);
    continue;
  }

  for (const question of pack.questions) {
    const label = question._id || `${pack.skillId} question with no ID`;

    if (question.skillId !== pack.skillId) {
      addError(`${label} belongs to ${question.skillId}, but is stored in ${pack.skillId}`);
    }

    for (const field of REQUIRED_STRING_FIELDS) {
      if (typeof question[field] !== "string" || question[field].trim() === "") {
        addError(`${label} is missing required text field: ${field}`);
      }
    }

    for (const field of REQUIRED_ARRAY_FIELDS) {
      if (!Array.isArray(question[field]) || question[field].length === 0) {
        addError(`${label} is missing required list field: ${field}`);
      }
    }

    if (!VALID_DIFFICULTIES.has(question.difficulty)) {
      addError(`${label} has invalid difficulty: ${question.difficulty}`);
    }

    if (!Array.isArray(question.lessonIds)) {
      addError(`${label} must define a lessonIds array`);
    } else {
      if (new Set(question.lessonIds).size !== question.lessonIds.length) {
        addError(`${label} has duplicate lessonIds`);
      }

      for (const lessonId of question.lessonIds) {
        const lesson = lessonById.get(lessonId);
        if (!lesson) {
          addError(`${label} references unknown lessonId: ${lessonId}`);
        } else if (!lesson.primarySkillIds.includes(question.skillId)) {
          addError(`${label} references ${lessonId}, where ${question.skillId} is not a primary skill`);
        }
      }

      const expectedPrimaryLessons = primaryLessonsBySkillId.get(question.skillId) || [];
      if (expectedPrimaryLessons.length > 0 && question.lessonIds.length === 0) {
        addError(`${label} is missing its primary roadmap lesson placement`);
      }
    }

    if (!Array.isArray(question.conceptIds)) {
      addError(`${label} must define a conceptIds array`);
    } else {
      if (new Set(question.conceptIds).size !== question.conceptIds.length) {
        addError(`${label} has duplicate conceptIds`);
      }

      for (const conceptId of question.conceptIds) {
        const item = conceptById.get(conceptId);
        if (!item) {
          addError(`${label} references unknown conceptId: ${conceptId}`);
        } else if (item.skillId !== question.skillId) {
          addError(`${label} references concept ${conceptId} from skill ${item.skillId}`);
        }
      }

      if (foundationSkillIds.has(question.skillId) && question.conceptIds.length === 0) {
        addError(`${label} is a Foundation question without a conceptId`);
      }
    }

    if (!VALID_QUESTION_TYPES.has(question.questionType)) {
      addError(`${label} has invalid questionType: ${question.questionType}`);
    } else if (inferQuestionType(question) !== question.questionType) {
      addError(
        `${label} has questionType ${question.questionType}, but inference expects ${inferQuestionType(question)}`
      );
    }

    if (!Array.isArray(question.options)) {
      addError(`${label} must define an options array`);
    } else if (CHOICE_QUESTION_TYPES.has(question.questionType)) {
      const normalizedOptions = question.options.map((option) =>
        String(option?.text || "").trim().toLowerCase()
      );
      const correctOptions = question.options.filter((option) => option?.isCorrect === true);
      const answerMatches = question.options.filter(
        (option) =>
          String(option?.text || "").trim().toLowerCase() ===
          question.correctAnswer.trim().toLowerCase()
      );

      if (question.options.length !== 4) {
        addError(`${label} must define exactly four options`);
      }
      if (normalizedOptions.some((option) => option === "")) {
        addError(`${label} has an empty option`);
      }
      if (new Set(normalizedOptions).size !== normalizedOptions.length) {
        addError(`${label} has duplicate options`);
      }
      if (correctOptions.length !== 1) {
        addError(`${label} must mark exactly one option as correct`);
      }
      if (answerMatches.length !== 1 || answerMatches[0]?.isCorrect !== true) {
        addError(`${label} options do not match correctAnswer`);
      }
    } else if (question.options.length !== 0) {
      addError(`${label} is fill_in_blank and should not define choice options`);
    }

    if (seenQuestionIds.has(question._id)) {
      addError(
        `Duplicate question ID ${question._id} in ${seenQuestionIds.get(question._id)} and ${pack.skillId}`
      );
    } else {
      seenQuestionIds.set(question._id, pack.skillId);
    }
  }
}

const packedQuestionCount = QUESTION_PACKS.reduce(
  (total, pack) => total + pack.questions.length,
  0
);

if (packedQuestionCount !== questions.length) {
  addError(
    `Aggregated question count ${questions.length} does not match pack count ${packedQuestionCount}`
  );
}

if (seenQuestionIds.size !== questions.length) {
  addError(
    `Unique question count ${seenQuestionIds.size} does not match aggregate count ${questions.length}`
  );
}

const summary = QUESTION_PACKS.reduce((result, pack) => {
  result[pack.strand] = (result[pack.strand] || 0) + pack.questions.length;
  return result;
}, {});

console.log("Question source summary:");
console.log({
  questions: questions.length,
  packs: QUESTION_PACKS.length,
  strands: summary,
  lessonPlacedQuestions: questions.filter((question) => question.lessonIds.length > 0).length,
  conceptTaggedQuestions: questions.filter((question) => question.conceptIds.length > 0).length,
});

if (errors.length > 0) {
  console.error(`\nQuestion source validation failed with ${errors.length} error(s):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log("\nQuestion source validation passed");

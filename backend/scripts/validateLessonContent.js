import { CONCEPTS } from "../data/concepts.js";
import { LESSON_CONTENT } from "../data/lessonContent/index.js";
import { flattenAllRoadmapLessons } from "../data/roadmap.js";

const errors = [];
const lessons = flattenAllRoadmapLessons();
const lessonsById = new Map(lessons.map((lesson) => [lesson.id, lesson]));
const conceptsById = new Map(CONCEPTS.map((concept) => [concept.id, concept]));
const contentIds = new Set();
const allowedStepTypes = new Set([
  "introduction",
  "character_focus",
  "character_trace",
  "word_example",
  "word_context",
  "kana_group",
  "guided_choice",
  "synthesis",
  "scene",
  "moment",
  "recap",
]);

for (const content of LESSON_CONTENT) {
  const lesson = lessonsById.get(content.lessonId);
  if (!lesson) errors.push(`${content.lessonId}: lesson does not exist in a roadmap`);
  if (contentIds.has(content.lessonId)) errors.push(`${content.lessonId}: duplicate lesson content`);
  contentIds.add(content.lessonId);

  const stepIds = new Set();
  const taughtConceptIds = new Set();
  for (const step of content.steps || []) {
    if (!step.id) errors.push(`${content.lessonId}: step is missing an id`);
    if (stepIds.has(step.id)) errors.push(`${content.lessonId}: duplicate step id ${step.id}`);
    stepIds.add(step.id);
    if (!allowedStepTypes.has(step.type)) {
      errors.push(`${content.lessonId}/${step.id}: unsupported step type ${step.type}`);
    }

    if (step.conceptId) {
      taughtConceptIds.add(step.conceptId);
      const concept = conceptsById.get(step.conceptId);
      if (!concept) errors.push(`${content.lessonId}/${step.id}: unknown concept ${step.conceptId}`);
      if (concept && lesson && !lesson.conceptIds.includes(step.conceptId)) {
        errors.push(`${content.lessonId}/${step.id}: concept ${step.conceptId} is outside the lesson scope`);
      }
    }

    for (const conceptId of step.conceptIds || []) {
      taughtConceptIds.add(conceptId);
      const concept = conceptsById.get(conceptId);
      if (!concept) errors.push(`${content.lessonId}/${step.id}: unknown concept ${conceptId}`);
      if (concept && lesson && !lesson.conceptIds.includes(conceptId)) {
        errors.push(`${content.lessonId}/${step.id}: concept ${conceptId} is outside the lesson scope`);
      }
    }

    for (const item of step.items || []) {
      if (!item.conceptId) continue;
      taughtConceptIds.add(item.conceptId);
      const concept = conceptsById.get(item.conceptId);
      if (!concept) errors.push(`${content.lessonId}/${step.id}: unknown concept ${item.conceptId}`);
      if (concept && lesson && !lesson.conceptIds.includes(item.conceptId)) {
        errors.push(`${content.lessonId}/${step.id}: concept ${item.conceptId} is outside the lesson scope`);
      }
    }

    if (step.type === "guided_choice") {
      const correctChoices = (step.choices || []).filter((item) => item.isCorrect);
      if (correctChoices.length !== 1) {
        errors.push(`${content.lessonId}/${step.id}: guided choice must have exactly one correct option`);
      } else if (correctChoices[0].text !== step.correctAnswer) {
        errors.push(`${content.lessonId}/${step.id}: correctAnswer does not match the correct option`);
      }
    }

    if (step.type === "character_focus") {
      if (!step.character || !step.romanization || !step.soundCue || !step.audioText) {
        errors.push(`${content.lessonId}/${step.id}: character focus is missing required teaching content`);
      }
    }

    if (step.type === "character_trace") {
      if (!step.character || !step.romanization || !step.tracingKey) {
        errors.push(`${content.lessonId}/${step.id}: character trace is missing required tracing content`);
      }
    }

    if (step.type === "word_example") {
      const segments = step.segments || [];
      if (!step.illustrationKey || !step.illustrationAlt || !step.japanese || !step.meaning || !step.audioText) {
        errors.push(`${content.lessonId}/${step.id}: word example is missing required context content`);
      }
      if (segments.map((segment) => segment.character).join("") !== step.japanese) {
        errors.push(`${content.lessonId}/${step.id}: word segments do not match ${step.japanese}`);
      }
      if (segments.filter((segment) => segment.isTarget).length !== 1) {
        errors.push(`${content.lessonId}/${step.id}: word example must highlight exactly one target segment`);
      }
    }


    if (step.type === "synthesis") {
      const segments = step.segments || [];
      if (!step.japanese || !step.meaning || !step.audioText) {
        errors.push(`${content.lessonId}/${step.id}: synthesis is missing required word content`);
      }
      if (segments.length < 2) {
        errors.push(`${content.lessonId}/${step.id}: synthesis must combine at least two segments`);
      }
      if (segments.map((segment) => segment.character).join("") !== step.japanese) {
        errors.push(`${content.lessonId}/${step.id}: synthesis segments do not match ${step.japanese}`);
      }
      if (!step.conceptIds?.length) {
        errors.push(`${content.lessonId}/${step.id}: synthesis must reference at least one concept`);
      }
    }

    if (step.type === "scene") {
      if (!step.setting || !step.lines?.length) {
        errors.push(`${content.lessonId}/${step.id}: scene needs a setting and at least one line`);
      }
      for (const line of step.lines || []) {
        if (!line.speaker || !line.japanese || !line.meaning) {
          errors.push(`${content.lessonId}/${step.id}: scene line is missing speaker, japanese or meaning`);
        }
      }
    }

    if (step.type === "moment") {
      const lines = step.lines || [];
      const words = lines.filter((line) => line.word);
      if (!lines.length || lines.some((line) => !line.phrases?.length || line.phrases.some((phrase) => !phrase))) {
        errors.push(`${content.lessonId}/${step.id}: moment needs lines of non-empty phrases`);
      }
      // One Japanese word per moment, so the reveal has a single beat.
      if (words.length !== 1) {
        errors.push(`${content.lessonId}/${step.id}: moment needs exactly one Japanese word`);
      }
      for (const { word } of words) {
        if (!word.japanese || !word.romanization) {
          errors.push(`${content.lessonId}/${step.id}: moment word needs japanese and romanization`);
        }
      }
      if (step.tone && !["accent", "indigo"].includes(step.tone)) {
        errors.push(`${content.lessonId}/${step.id}: moment tone must be accent or indigo`);
      }
      if (!step.conceptIds?.length) {
        errors.push(`${content.lessonId}/${step.id}: moment must reference at least one concept`);
      }
    }

    if (step.type === "word_context") {
      const segments = step.segments || [];
      if (!step.illustrationKey || !step.illustrationAlt || !step.japanese || !step.meaning || !step.audioText) {
        errors.push(`${content.lessonId}/${step.id}: word context is missing required content`);
      }
      if (segments.map((segment) => segment.character).join("") !== step.japanese) {
        errors.push(`${content.lessonId}/${step.id}: word context segments do not match ${step.japanese}`);
      }
      if (!step.conceptIds?.length) {
        errors.push(`${content.lessonId}/${step.id}: word context must reference at least one concept`);
      }
    }
  }

  for (const conceptId of lesson?.conceptIds || []) {
    if (!taughtConceptIds.has(conceptId)) {
      errors.push(`${content.lessonId}: lesson concept ${conceptId} is not taught in a content step`);
    }
  }
}

if (errors.length) {
  console.error("Lesson content validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log("Lesson content validation passed");
  console.log({ contentLessons: LESSON_CONTENT.length, validatedSteps: LESSON_CONTENT.reduce((sum, item) => sum + item.steps.length, 0) });
}

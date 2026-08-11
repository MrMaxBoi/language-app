import { HIRAGANA_VOWELS_CONTENT } from "./foundations/hiraganaVowels.js";
import { HIRAGANA_K_ROW_CONTENT } from "./foundations/hiraganaKRow.js";
import { HIRAGANA_S_ROW_CONTENT } from "./foundations/hiraganaSRow.js";

export const LESSON_CONTENT = [
  HIRAGANA_VOWELS_CONTENT,
  HIRAGANA_K_ROW_CONTENT,
  HIRAGANA_S_ROW_CONTENT,
];

const lessonContentById = new Map(
  LESSON_CONTENT.map((content) => [content.lessonId, content])
);

export const getLessonContentById = (lessonId) => lessonContentById.get(lessonId) || null;

export const hasLessonContent = (lessonId) => lessonContentById.has(lessonId);

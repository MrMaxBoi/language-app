// Targeted, dependency-free unit test for the question passthrough.
//
// Run: `node backend/tests/buildQuestionFromSource.passthrough.test.js`
//
// Guards the FIRST stage of the Core passthrough: `buildQuestionFromSource`
// must carry `cognitiveType` (default recognition) and `audioText` (only when
// present) off the source object. NOTE: this is necessary but not sufficient —
// getSessionQuestions() re-shapes the selected questions through an explicit
// field whitelist before the API response, so both fields must ALSO be listed
// there. That final shape is verified against the live /api/sessions/start
// endpoint (see the Core Done-log entry), not here. No DB / network / framework.

import assert from "node:assert/strict";
import { buildQuestionFromSource } from "../services/questionSelection.service.js";

let passed = 0;
const check = (name, fn) => {
  fn();
  passed += 1;
  console.log(`  ✓ ${name}`);
};

// A production (by-ear) question: carries both cognitiveType and audioText.
const production = {
  _id: "vowels-024",
  questionId: "vowels-024",
  questionText: "Hana points at the sky and says one sound. Which kana did she say?",
  questionType: "multiple_choice",
  cognitiveType: "production",
  audioText: "あ",
  options: [
    { text: "あ", isCorrect: true },
    { text: "い", isCorrect: false },
  ],
  correctAnswer: "あ",
  topic: "kana",
  subtopic: "hiragana recognition",
  skillId: "kana.hiragana",
  lessonIds: ["foundations-hiragana-vowels"],
  difficulty: "easy",
};

// A recognition question: has a cognitiveType tag but no audio.
const recognition = {
  _id: "vowels-004",
  questionId: "vowels-004",
  questionText: "Which sound is あ?",
  questionType: "multiple_choice",
  cognitiveType: "recognition",
  options: [
    { text: "a", isCorrect: true },
    { text: "o", isCorrect: false },
  ],
  correctAnswer: "a",
  topic: "kana",
  subtopic: "hiragana recognition",
  skillId: "kana.hiragana",
  lessonIds: ["foundations-hiragana-vowels"],
  difficulty: "easy",
};

// A legacy / untagged question: neither cognitiveType nor audioText present.
const legacy = {
  _id: "legacy-001",
  questionId: "legacy-001",
  questionText: "Pick the particle.",
  questionType: "multiple_choice",
  options: [
    { text: "は", isCorrect: true },
    { text: "が", isCorrect: false },
  ],
  correctAnswer: "は",
  topic: "grammar",
  subtopic: "particles",
  skillId: "particles.topic_wa",
  lessonIds: [],
  difficulty: "easy",
};

console.log("buildQuestionFromSource passthrough:");

check("production question passes audioText through verbatim", () => {
  const built = buildQuestionFromSource(production);
  assert.equal(built.audioText, "あ");
});

check("production question keeps its cognitiveType layer", () => {
  const built = buildQuestionFromSource(production);
  assert.equal(built.cognitiveType, "production");
});

check("recognition question carries cognitiveType and NO audioText", () => {
  const built = buildQuestionFromSource(recognition);
  assert.equal(built.cognitiveType, "recognition");
  assert.ok(!("audioText" in built), "recognition question must not have audioText");
});

check("untagged legacy question defaults cognitiveType to recognition, no audioText", () => {
  const built = buildQuestionFromSource(legacy);
  assert.equal(built.cognitiveType, "recognition");
  assert.ok(!("audioText" in built), "legacy question must not have audioText");
});

check("questionId survives from the source _id", () => {
  const built = buildQuestionFromSource(production);
  assert.equal(built.questionId, "vowels-024");
});

console.log(`\n${passed} assertions passed.`);

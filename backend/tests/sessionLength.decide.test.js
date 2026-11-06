// Targeted, dependency-free unit test for the adaptive session-length decision.
//
// Run: `node backend/tests/sessionLength.decide.test.js`
//
// Guards Today item 3: the server picks a STARTING question count (3-6) from the
// learner's stage, +1 for a weak skill in scope, floored/ceiled, and never more
// than the lesson pool can supply. No DB, no network, no framework.

import assert from "node:assert/strict";
import {
  decideSessionLength,
  MIN_SESSION_QUESTIONS,
  MAX_SESSION_QUESTIONS,
} from "../services/sessionLength.service.js";

let passed = 0;
const check = (name, fn) => {
  fn();
  passed += 1;
  console.log(`  ✓ ${name}`);
};

console.log("decideSessionLength:");

check("fresh cold_start learner starts at the minimum (3)", () => {
  const { count } = decideSessionLength({ learnerStage: "cold_start" });
  assert.equal(count, 3);
  assert.equal(count, MIN_SESSION_QUESTIONS);
});

check("foundation_building also starts at 3", () => {
  assert.equal(decideSessionLength({ learnerStage: "foundation_building" }).count, 3);
});

check("core_practice starts at 4", () => {
  assert.equal(decideSessionLength({ learnerStage: "core_practice" }).count, 4);
});

check("adaptive_review starts at 5", () => {
  assert.equal(decideSessionLength({ learnerStage: "adaptive_review" }).count, 5);
});

check("a weak skill in scope adds one question", () => {
  const base = decideSessionLength({ learnerStage: "core_practice" }).count;
  const bumped = decideSessionLength({ learnerStage: "core_practice", hasWeakSkillInScope: true }).count;
  assert.equal(bumped, base + 1);
});

check("the weak-skill bump never exceeds the max (6)", () => {
  const { count } = decideSessionLength({ learnerStage: "adaptive_review", hasWeakSkillInScope: true });
  assert.equal(count, MAX_SESSION_QUESTIONS); // 5 + 1 = 6, capped at 6
});

check("never asks for more than the lesson pool can supply", () => {
  const { count } = decideSessionLength({
    learnerStage: "adaptive_review",
    hasWeakSkillInScope: true,
    availableQuestionCount: 2,
  });
  assert.equal(count, 2);
});

check("an unknown stage falls back to core_practice (4)", () => {
  assert.equal(decideSessionLength({ learnerStage: "nonsense" }).count, 4);
});

check("no args at all is safe and in range", () => {
  const { count } = decideSessionLength();
  assert.ok(count >= MIN_SESSION_QUESTIONS && count <= MAX_SESSION_QUESTIONS);
});

console.log(`\n${passed} assertions passed.`);

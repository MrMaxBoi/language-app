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
  allowedExtendCount,
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

console.log("\nallowedExtendCount (the 6-question cap):");

check("a session started at 5 may add only 1, even when 3 are requested", () => {
  assert.equal(allowedExtendCount({ currentSize: 5, requested: 3 }), 1);
});

check("the cap is on ISSUED size, not answered — 5 issued, 0 answered still caps at +1", () => {
  // Regression guard for the bug: headroom must use currentSize (5), not asked (0).
  assert.equal(allowedExtendCount({ currentSize: 5, requested: 3 }), 1);
});

check("a session already at the cap (6) adds nothing", () => {
  assert.equal(allowedExtendCount({ currentSize: 6, requested: 3 }), 0);
});

check("a session started at 3 may add up to the per-call max (3), reaching 6", () => {
  assert.equal(allowedExtendCount({ currentSize: 3, requested: 3 }), 3);
});

check("a session at 4 may add only 2 (reaching 6), not the 3 requested", () => {
  assert.equal(allowedExtendCount({ currentSize: 4, requested: 3 }), 2);
});

check("per-extend ceiling is 3 even when far below the cap", () => {
  assert.equal(allowedExtendCount({ currentSize: 0, requested: 10 }), 3);
});

check("a request below 1 is floored to 1", () => {
  assert.equal(allowedExtendCount({ currentSize: 2, requested: 0 }), 1);
});

check("never returns a negative even if currentSize somehow exceeds the cap", () => {
  assert.equal(allowedExtendCount({ currentSize: 9, requested: 3 }), 0);
});

console.log(`\n${passed} assertions passed.`);

# Current Status

## Completed

✅ Adaptive engine

✅ Dashboard analytics

✅ Skill mastery tracking

✅ Memory tracking

✅ Coverage tracking

✅ Question exposure tracking

✅ Recommendation generation

✅ Stress testing framework

✅ Skill graph foundation

✅ N5 skill graph metadata foundation

✅ Skill graph backfill completed

✅ Duplicate legacy learner-state rows merged

✅ All graph skills have starter question coverage

✅ Atlas question bank seeded and audited

✅ Learner audit script added

✅ Beginner/foundation learning path manually validated

✅ Probabilistic sampling

✅ Persona weighting

✅ Skill-first session report foundation

✅ Learner-facing dashboard foundation

---

## In Progress

- Review-vs-expansion calibration
- Skill-first analytics
- Recommendation calibration
- Learner UI polish and validation

---

## Current Bottleneck

The adaptive engine is functional.

The main bottleneck is no longer raw engine capability.

The project now needs tighter product calibration around how the engine behaves and explains itself.

The question bank has moved from category-first toward skill-first:

- vocabulary
- grammar
- particles

The platform is moving toward a skill-based structure where every question maps to a measurable skill.

Examples:

- particle_wa_topic
- particle_ni_destination
- greeting_basic
- transportation_vocab

This skill layer will become the foundation of recommendations, dashboards, and learning paths.

Recent progress:

- The graph now includes planned N5 foundation, vocabulary, particle, verb, adjective, grammar, and reading skills.
- Skill metadata includes prerequisites, JLPT level, and skill path context.
- Recommendation explanations and adaptive dashboard readiness metrics are skill-centric.
- `npm run backfill:skill-graph` can enrich existing DB rows with canonical skill metadata.
- Backfill enriched existing learner state for attempts, skills, memories, and coverage.
- Duplicate `Skill`, `Memory`, and `KnowledgeCoverage` rows were merged by `userId + skillId`.
- Current Atlas question bank covers all 39 graph skills with 361 mapped questions and no generated fallbacks.
- Fresh learner testing validated the expected path: hiragana-only cold start, then expansion into safe beginner vocabulary, katakana, particles, and foundation skills.
- Foundation-building testing confirmed weak skills and recent mistakes are detected and can be reintroduced.
- Session completion now returns a skill-first report payload with practiced skills, weak skills, strong skills, question review, difficulty mix, and next focus.
- The report page can reload the latest completed session through `/api/sessions/:id/report` instead of relying only on temporary frontend state.
- `/dashboard` now shows a learner-facing home with stage summary, next focus, weak skills, strong skills, review queue, recent sessions, and recommendation reasons.
- The previous adaptive intelligence dashboard remains available as a developer/debug view at `/engine`.

## Current Product Question

The next question is not "does the engine work?"

The next question is:

"How much should Kokoro review weak skills versus expand into new safe skills during foundation building?"

Observed behavior:

- Cold start expands correctly after the first session.
- Prerequisite gaps remain blocked during early stages.
- Weak skills are detected correctly.
- Weak review appears once the learner enters foundation building.
- In some audits, foundation building still prefers new safe coverage over immediate weak-skill review.
- Struggling cold-start learners are safe and weakness-aware, but may still receive too much new coverage relative to remediation.
- High-performing learners are safe and accurate, but can remain in foundation building longer than needed.

Recommended near-term focus:

1. Manually test the new learner dashboard after fresh, average, struggling, and high-performing sessions.
2. Decide whether learner stage should come from a dedicated backend field instead of a frontend heuristic.
3. Continue polishing the learning flow now that report and dashboard explain the engine better.

## Learner Profile Validation Log

### Struggling Learner

Scenario:

- Reset `guest`
- 3 manual sessions
- Approximate answer pattern: 2/5, 1/5, 2/5 correct

Observed audit:

- `learnerStage`: `cold_start`
- `totalAttempts`: 15
- `recentAccuracy`: 33.3%
- `coveredSkillCount`: 7
- `weakSkillCount`: 3
- `selectedWithPrerequisiteGap`: 0
- `difficultyCounts`: 3 easy, 2 medium, 0 hard
- Selected 1 weak/recent-incorrect review item

Post-calibration re-test:

- `learnerStage`: `cold_start`
- `totalAttempts`: 15
- `recentAccuracy`: 33.3%
- `weakSkillCount`: 3
- `selectedBecauseWeakSkill`: 2
- `selectedBecauseMemory`: 2
- `selectedBecauseRecentMistakes`: 1
- `selectedWithPrerequisiteGap`: 0
- `difficultyCounts`: 3 easy, 2 medium, 0 hard

Interpretation:

- Safe behavior is working.
- Weakness detection is working.
- The learner is not promoted too quickly, which is correct.
- Calibration confirmed: if `cold_start` accuracy is below 50% and weak skills are 2+, reserve 2 remediation slots instead of 1.

### Average Learner

Scenario:

- Reset `guest`
- 3 manual sessions
- Approximate answer pattern: 4/5, 3/5, 4/5 correct

Observed audit:

- `learnerStage`: `foundation_building`
- `totalAttempts`: 15
- `recentAccuracy`: 73.3%
- `coveredSkillCount`: 9
- `weakSkillCount`: 1
- `selectedWithPrerequisiteGap`: 0
- `difficultyCounts`: 3 easy, 2 medium, 0 hard
- Selected 2 weak/low-memory family vocabulary review items

Interpretation:

- Average learner behavior is well balanced.
- No additional calibration is currently needed for this profile.

### High Performer

Scenario:

- Reset `guest`
- 5 manual sessions
- Approximate answer pattern: 5/5, 5/5, 5/5, 4/5, 5/5 correct

Observed audit:

- `learnerStage`: `foundation_building`
- `totalAttempts`: 25
- `recentAccuracy`: 95%
- `coveredSkillCount`: 15
- `averageMastery`: 100%
- `weakSkillCount`: 0
- `selectedWithPrerequisiteGap`: 0
- `difficultyCounts`: 3 easy, 2 medium, 0 hard

Interpretation:

- Safe behavior is working.
- Mistake follow-up is working.
- Calibration added: high performers can move to `core_practice` once attempts, coverage, mastery, accuracy, and weak-skill conditions are met.
- Post-calibration re-test confirmed `core_practice`, 2 easy / 2 medium / 1 hard, and `selectedWithPrerequisiteGap: 0`.

### Next Learner To Test

No required learner re-test remains for the current calibration pass.

Optional final confidence pass:

- Re-run average learner after future changes to ensure the currently healthy balance remains stable.

Then run:

```bash
ALLOW_LOCAL_QUESTION_FALLBACK=false npm run audit:learner -- guest
```

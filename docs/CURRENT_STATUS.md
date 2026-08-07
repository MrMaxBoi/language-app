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

✅ Roadmap backend foundation

✅ Lesson-scoped adaptive sessions

✅ Dashboard roadmap UI foundation

✅ First question-type-aware session UI

✅ Question type audit script and report

✅ Atlas questionType migration

✅ Question option audit script and report

✅ Auto-ready option migration

✅ Curated particle option migration

✅ Full choice-option migration

✅ Backend learner-state summary endpoint

---

## In Progress

- Review-vs-expansion calibration
- Skill-first analytics
- Recommendation calibration
- Question-type metadata audit
- Learner UI polish and validation
- Learner-state dashboard validation

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
- The roadmap model now exists in backend data with 33 lessons across 8 N5 foundation units.
- `GET /api/roadmap` returns units, lessons, unlock status, progress, and validation data.
- `POST /api/sessions/start` can start a lesson-scoped session with `{ "lessonId": "..." }`.
- Roadmap lesson sessions are stored on the Session document and still use the adaptive engine inside the lesson skill scope.
- `/dashboard` now shows the roadmap path, next lesson, current unit lesson states, and lesson start/review buttons.
- `/session` shows lesson context during roadmap-scoped sessions.
- `/report` labels completed roadmap lesson sessions.
- `/session` now renders choice buttons for choice-style questions and keeps typed input for inferred fill-in-blank prompts.
- Choice options can be generated from nearby answers when legacy seed questions do not define explicit options.
- `npm run audit:question-types:write` now reports inferred question types, mismatches, missing options, and review actions.
- `npm run migrate:question-types` updated Atlas question types so inferred/runtime type and stored DB type now agree.
- Current question type split: 133 `translation_choice`, 157 `multiple_choice`, 71 `fill_in_blank`.
- `npm run audit:question-options:write` now generates draft options and quality warnings for all 290 choice-style questions.
- `npm run migrate:question-options` stored options for 200 auto-ready choice questions.
- `npm run migrate:curated-options` stored options for 53 curated particle and particle-adjacent questions.
- `npm run migrate:curated-options` was expanded to cover all remaining review/manual items.
- Current option audit: all 290 choice-style questions have stored options.
- Current question type audit: all 361 questions are OK.
- `GET /api/learner-state/:userId` now returns the product-facing learner summary: stage, stage message, metrics, weak skills, strong skills, review queue, roadmap progress, next lesson, recent sessions, and recommended action.
- `/dashboard` now uses the backend learner-state summary when available instead of relying only on a frontend learner-stage heuristic.

## Current Product Question

The next question is not "does the engine work?"

The next question is:

"Does the dashboard now explain the learner state clearly enough to become the app home?"

Observed behavior:

- Cold start expands correctly after the first session.
- Prerequisite gaps remain blocked during early stages.
- Weak skills are detected correctly.
- Weak review appears once the learner enters foundation building.
- In some audits, foundation building still prefers new safe coverage over immediate weak-skill review.
- Struggling cold-start learners are safe and weakness-aware, but may still receive too much new coverage relative to remediation.
- High-performing learners are safe and accurate, but can remain in foundation building longer than needed.

Recommended near-term focus:

1. Manually test roadmap progress after completing a dashboard-started lesson.
2. Confirm `/dashboard` stage, next lesson, weak skills, review queue, and recent sessions match the learner audit output.
3. Manually spot-check stored options during real sessions, especially grammar and reading items.
4. Decide whether the roadmap needs a dedicated `/roadmap` page after dashboard validation.
5. Decide which dashboard blocks should stay for MVP and which should move to a debug/developer view.

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

## Guided Daily Review

Kokoro now supports one guided daily review session built from active `ReviewTask` records.

- `ReviewSessionBuilder` prioritizes active tasks, merges duplicate skill targets, sizes a session from 5-30 questions, and estimates completion time.
- Daily review reuses the existing session question, attempt, memory, and skill-state pipeline.
- Session documents retain review task IDs, skill IDs, the starting review summary, estimated minutes, and the completion summary.
- Review tasks are evaluated independently by skill when the session completes. Overall session accuracy does not clear unrelated tasks.
- `ReviewPage` now leads with Today's Review and keeps topic-specific Fix this topic actions as a secondary flow.
- `ResultPage` shows tasks refreshed and tasks still practicing for daily review sessions.
- Home recommendations can now identify daily review as the primary action while preserving the next roadmap lesson.

Local verification completed:

- Backend syntax checks: passed
- Backend import checks: passed
- Frontend lint: passed
- Frontend production build: passed

Remaining validation is a live Atlas-backed mixed-answer review session confirming task counts before and after completion.

## Mobile Learner App Foundation

Kokoro now has a separate Expo/React Native learner application under `mobile/`.

- The web frontend remains intact for developer analytics and engine debugging.
- Mobile Home is now the learning Map, not an analytics dashboard.
- The map renders all eight roadmap units and 33 lessons from the existing roadmap API.
- Lesson nodes expose completed, current, unlocked, in-progress, and locked states.
- Tapping a node opens a native lesson detail sheet with description and real lesson progress.
- The compact Review of the Day strip reports ready, completed, and caught-up states.
- Tapping a ready Review of the Day opens a preview sheet before the session starts.
- The preview groups active ReviewTasks into roadmap areas and shows their task-weighted focus, learner-friendly reasons, total questions, and estimated time.
- The preview exposes every included roadmap area in a scrollable list, uses a semantic reason legend, and supports in-sheet drill-down to the underlying review skills.
- Focus proportions are runtime guidance, not guaranteed per-area question counts; the question bank and question schema are unchanged.
- Only one completed Daily Review is allowed per learner per server-local calendar day.
- Map actions start real roadmap or daily-review sessions through the existing backend.
- A first native Session and Result flow is connected end-to-end.
- Bottom navigation establishes Map, Review, Progress, and Profile as the learner-facing information architecture.

Verification completed:

- Mobile TypeScript: passed
- Mobile ESLint: passed
- Expo universal web export: passed
- Phone viewport visual QA: passed at 390 x 844
- Roadmap node to lesson-detail interaction: passed
- Real Atlas-backed roadmap lesson start: passed
- Immediate answer feedback: passed

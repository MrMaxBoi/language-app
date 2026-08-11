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

✅ Local question bank split into 39 skill-aligned source packs

✅ Local question source validation command

✅ Canonical question types and options folded into local source packs

✅ Read-only local-versus-Atlas question metadata comparison

✅ Additive lesson and Foundation concept placement on canonical questions

✅ Multi-roadmap backend registry with N5 compatibility default

✅ Dedicated Japanese Foundations roadmap model

✅ Explicit lesson-scoped question selection and content readiness guard

✅ First teaching-before-assessment lesson: Hiragana Vowels

✅ Hiragana K-row and S-row teaching lessons

✅ First three-lesson Japanese Foundations sequence

✅ Deliberate Hiragana Vowels lesson-component pilot

✅ Reusable character-focus and illustrated word-example steps

✅ Guided Hiragana vowel tracing with ordered stroke validation

✅ Simplified word-context and haptic lesson interactions

✅ Version-controlled lesson content registry and validation

✅ Mobile roadmap selector for Japanese Foundations and N5

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
- Current Atlas question bank covers all 39 graph skills with 404 mapped questions and no generated fallbacks.
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
- Current question type split: 133 `translation_choice`, 200 `multiple_choice`, 71 `fill_in_blank`.
- `npm run audit:question-options:write` now generates draft options and quality warnings for all 290 choice-style questions.
- `npm run migrate:question-options` stored options for 200 auto-ready choice questions.
- `npm run migrate:curated-options` stored options for 53 curated particle and particle-adjacent questions.
- `npm run migrate:curated-options` was expanded to cover all remaining review/manual items.
- Current option coverage: all 333 choice-style questions have stored options.
- Current question type coverage: all 404 questions have explicit types.
- The former 4,702-line `backend/data/questions.js` bank is now organized into 39 skill files under `backend/data/questions/`, grouped by the eight skill-graph strands.
- `backend/data/questions.js` remains a compatibility export, so existing services, tests, audits, and seed scripts continue to consume one stable question array.
- `npm run validate:questions` checks required content, duplicate IDs, skill-graph membership, pack placement, difficulty values, and aggregate integrity before seeding.
- The split preserves all 361 source objects and their original order exactly. Atlas data was not changed by this source-only restructuring.
- All 404 source questions include explicit `questionType`, and all 333 choice questions include stored options.
- `npm run sync:question-source:dry-run` compares IDs, base content, question types, and options against Atlas without writing either source.
- A post-sync comparison reports zero missing questions, zero base-content mismatches, and zero metadata changes.
- A reset seed can now restore question types and options directly from the source packs; the older migration scripts remain useful for historical recovery and auditing.
- Question documents now support indexed `lessonIds` and `conceptIds` without changing their stable `questionId` values.
- 360 questions are mapped to at least one roadmap lesson where their skill is primary. Support-skill lessons are not duplicated into question ownership metadata.
- 44 questions across six future/extension skills remain intentionally unplaced until those roadmap lessons are designed.
- The concept registry defines 102 planned core-kana, pattern, and pronunciation concepts. The 58 current concept-tagged questions exercise 26 concepts.
- Atlas was updated through the normal upsert seed: 361 matched, 361 updated, 0 inserted, and no reset.
- The post-seed Atlas audit reports zero invalid lesson references, zero invalid concept references, and both curriculum indexes present.
- `GET /api/roadmap` still defaults to `n5-foundation`; callers can request `roadmapId=japanese-foundations` without changing existing clients.
- Japanese Foundations contains 5 units and 23 lessons across Hiragana, Katakana, sound patterns, and pronunciation.
- Runtime roadmap responses expose available roadmaps, lesson content counts, and roadmap content readiness.
- Lessons below their minimum five explicitly assigned questions are marked `coming_soon` and rejected by session start.
- Japanese Foundations currently has 3 content-ready lessons and 58 available questions across the roadmap. Hiragana Vowels has 15 explicitly scoped questions, K-row has 16, and S-row has 15.
- Roadmap lesson selection now prefers explicit `lessonIds`; skill-scoped selection remains a compatibility fallback.
- N5 remains fully ready with all 33 lessons, and an unchanged seed now reports 0 modified Atlas questions.
- `GET /api/lessons/:lessonId/content` returns validated teaching content without exposing answer persistence or changing learner state.
- Hiragana Vowels now uses a 15-step version 3 flow: one explanation, five focused character screens, five ordered tracing screens, three quiet word contexts, and a recap before adaptive practice.
- K-row and S-row retain their validated eight-step format until the richer Vowels pacing is accepted.
- Character pronunciation, word audio, sound segments, and recap characters can trigger Japanese speech without recording teaching interactions as learner Attempts.
- Tracing uses ordered AnimCJK median paths, forgiving local validation, direct haptic feedback, and an accessibility guide-completion path.
- Tracing completion is intentionally local-only; only the final five-question session updates Attempts, SkillState, Memory, and ReviewTask.
- The latest non-reset seed inserted 30 K-row and S-row questions, matched the existing 374, and brought Atlas to 404 questions.
- The post-seed Atlas audit reports 404 database and source questions, 39 ready skills, zero invalid curriculum references, and zero duplicate question IDs.
- Live roadmap verification reports Vowels completed, K-row unlocked and content-ready, and S-row content-ready but correctly locked until K-row completion for the current guest learner.
- A live session smoke test confirmed all five selected questions came from the 15-question explicit Hiragana Vowels scope.
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

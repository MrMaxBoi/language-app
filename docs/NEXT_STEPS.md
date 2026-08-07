# Next Steps

## Phase 1 — Skill Graph Migration

1. Run learner-state backfill with canonical skillId ✅

- Skill
- Memory
- KnowledgeCoverage
- Attempt

2. Audit and merge duplicate legacy subtopics ✅

3. Standardize skill naming conventions ✅

4. Add minimum question-count targets per skill ✅

- Foundation skills: 5-10 questions each
- Core N5 skills: 10-20 questions each
- Early-intermediate bridge skills: 5-10 questions each

Current conservative target report:

- Report file: `backend/tests/SKILL_QUESTION_GAP_REPORT.md`
- Current mapped questions: 361
- Target questions: 355
- Total gap: 0
- Ready skills: 39
- Thin skills: 0

Largest strand gaps:

- Grammar: complete
- Adjectives: complete
- Conversation: complete
- Foundation: complete
- Particles: complete
- Reading: complete
- Verbs: complete
- Vocabulary: complete

Recommended content batches:

1. Foundation + Reading starter depth ✅
2. Particles ✅
3. Core verbs ✅
4. Vocabulary ✅
5. Basic grammar, adjectives, and conversation ✅

---

## Phase 2 — Analytics Upgrade

Dashboard should become skill-centric.

Current engine cleanup status:

- Question bank is DB-primary through Atlas ✅
- Runtime question identity uses stable `questionId` ✅
- Selection scoring now uses canonical `skillId` keys instead of mixing canonical and legacy keys ✅
- Legacy `topic||subtopic` keys remain compatibility-only for older learner records ✅
- Coverage percentage is based on canonical covered skills and capped at 100% ✅
- Session report endpoint returns stored completed-session reports ✅
- Session report UI is now skill-first instead of topic-first ✅
- `/dashboard` is now the learner-facing dashboard ✅
- The previous adaptive engine dashboard is preserved at `/engine` for debugging ✅

Current:

Grammar 65%

Future:

Strongest Skills
- Greetings (92%)
- Numbers (88%)
- Particle は (85%)

Weakest Skills
- Particle に (38%)
- Past Tense Verbs (41%)
- Transportation Vocabulary (45%)

---

## Phase 3 — Learning Path Engine

Add prerequisite-aware learning.

Roadmap planning:

- Roadmap model draft: `docs/ROADMAP_MODEL.md` ✅
- Recommended direction: start with the current 39-skill roadmap architecture, but keep Unit 1 replaceable with finer kana lessons later.
- Roadmap unit/lesson definition added in `backend/data/roadmap.js` ✅
- Read-only roadmap API added at `GET /api/roadmap` ✅
- Session start supports optional lesson-scoped mode through `POST /api/sessions/start` with `{ "lessonId": "..." }` ✅
- Locked lessons are protected by default, with `{ "allowLocked": true }` available for development testing ✅
- Lesson sessions are tagged on the Session document so roadmap progress can be derived from completed attempts ✅
- Question selection can now be constrained to roadmap lesson skill IDs while preserving adaptive scoring ✅
- Dashboard now shows the current roadmap path, next lesson, lesson status, and lesson start buttons ✅
- Session page now displays roadmap lesson context during lesson-scoped sessions ✅
- Report page now labels completed roadmap lesson sessions ✅
- Session UI now renders generated choice buttons for `multiple_choice`, `meaning_match`, and `translation_choice` style questions ✅
- Translation/conjugation prompts are inferred as typed `fill_in_blank` questions until the bank has explicit question-type data ✅
- Question type audit script added at `npm run audit:question-types` ✅
- Latest audit report written to `backend/tests/QUESTION_TYPE_AUDIT.md` ✅
- Question type migration script added at `npm run migrate:question-types:dry-run` and `npm run migrate:question-types` ✅
- Atlas question types migrated: 133 `translation_choice`, 157 `multiple_choice`, 71 `fill_in_blank` ✅
- Post-migration audit shows `typeMismatchCount: 0` ✅
- Question option audit script added at `npm run audit:question-options:write` ✅
- Latest option audit report written to `backend/tests/QUESTION_OPTION_AUDIT.md` ✅
- Auto-ready option migration script added at `npm run migrate:question-options:dry-run` and `npm run migrate:question-options` ✅
- Atlas options migrated for 200 auto-ready choice questions ✅
- Curated particle option batch added in `backend/data/curatedQuestionOptions.js` ✅
- Curated option migration added at `npm run migrate:curated-options:dry-run` and `npm run migrate:curated-options` ✅
- Atlas options migrated for 53 curated particle/particle-adjacent questions ✅
- Curated option batch expanded to all remaining 90 review/manual questions ✅
- Post-migration audit shows all 290 choice-style questions have stored options ✅
- Question type audit shows all 361 questions are OK ✅

Current implementation status:

- Selection scoring checks skill prerequisites ✅
- Hard and early-intermediate questions are gated when prerequisites are not ready ✅
- Softer prerequisite gaps reduce score for non-advanced skills ✅
- Debug reports include selected prerequisite-gap counts and unmet prerequisite lists ✅
- Learner-stage detection adds curriculum bias for cold start, foundation building, core practice, review, and advanced expansion ✅
- Early learner stages favor beginner-safe skills and delay hard/early-intermediate items ✅
- Cold start strictly blocks questions with unmet prerequisites, except when no gated pool can fill the session ✅
- Foundation building also blocks questions with unmet prerequisites so early progression stays prerequisite-safe ✅
- Learner audit script previews stage, skill state, prerequisite blockers, and next selection ✅
- Foundation building reserves a remediation slot when weak-skill or recent-mistake candidates are available ✅
- Roadmap lesson sessions preserve the same adaptive engine, but narrow the candidate pool to the lesson's primary/support skills ✅

Examples:

Particle に
requires:
- Basic Sentence Structure

Past Tense Verbs
requires:
- Present Tense Verbs

The engine should avoid recommending advanced skills before prerequisites are understood.

---

## Phase 4 — Recommendation Engine V2

Recommendations should become action-based.

Examples:

Current:
"Improve grammar"

Future:
"You frequently confuse に and で."

Recommended:
- Destination Particle Practice
- Movement Sentence Exercises
- Transportation Vocabulary Review

---

## Phase 5 — Curriculum Expansion

Expand the skill graph from N5 foundation skills toward:

- Full JLPT N5
- JLPT N4
- JLPT N3

while maintaining adaptive personalization.

---

## Immediate Priority

The completed milestone is:

Raise question density per skill from starter coverage to useful practice depth, validate the early adaptive loop, and expose session outcomes through a skill-first report.

Current graph coverage:

- 39 skills
- 361 mapped questions
- 0 unmapped skills
- 0 generated fallback mappings

Minimum density target:

- 39 ready skills
- 0 thin skills
- 0 remaining question gap

This is now the foundation for future recommendations, dashboards, mastery tracking, and learning paths.

Manual validation status:

- Fresh learner starts cautiously with hiragana-only content ✅
- After one session, the pool opens into safe beginner skills ✅
- Attempts, memory, mastery, coverage, and exposure update after real sessions ✅
- Weak vocabulary skills were detected and reintroduced during foundation building ✅
- A wrong `adjectives.na` answer was recorded and surfaced as a weak skill ✅
- Early-stage selections stayed prerequisite-safe with `selectedWithPrerequisiteGap: 0` ✅
- Average learner profile showed a healthy 2 review / 3 expansion balance ✅
- Struggling learner profile showed safe behavior but needed stronger remediation ✅
- High performer profile showed safe behavior but needed faster stage promotion ✅
- Report page now summarizes accuracy, practiced skills, weak skills, strong skills, difficulty mix, written feedback, and question review ✅
- Dashboard now summarizes learner stage, next focus, weak skills, strong skills, review queue, recent sessions, and recommendation reasons ✅
- Backend learner-state summary endpoint now powers the dashboard stage, metrics, weak skills, strong skills, review queue, next lesson, and recommended action ✅

The next implementation priority is:

Validate and deepen the mobile learner flow without expanding the adaptive engine.

Target behavior:

- Validate Review of the Day ready, completed, caught-up, and next-day reset states on a physical phone.
- Persist selected session question IDs and progress so an interrupted mobile session can resume exactly.
- Replace the Review tab placeholder with guided daily review and focused topic repair.
- Design the Progress skill constellation using truthful SkillState, Memory, and prerequisite data.
- Add real teaching/introduction content before the first roadmap lesson questions.
- Validate map density and scrolling with first-time, active, and advanced learner histories.
- Create several mistake and memory-due ReviewTasks.
- Confirm ReviewPage summary matches the active ReviewTask count and type breakdown.
- Start Today's Review and confirm every selected skill receives question coverage where bank content exists.
- Complete a mixed-answer session and confirm only tasks meeting their own clear condition are completed.
- Confirm remaining tasks stay active and Home/Review counts refresh on the next load.
- Confirm a refreshed Result page retains its daily-review completion summary.
- Confirm no-task state recommends the next roadmap lesson.
- Recheck focused Fix this topic and normal roadmap/adaptive sessions for regressions.

Question-type audit result:

- Total questions: 361
- Inferred `translation_choice`: 133
- Inferred `multiple_choice`: 157
- Inferred `fill_in_blank`: 71
- Explicit DB `questionType` exists on all 361 questions and now matches inference.
- Remaining type mismatches: 0
- 290 choice-style questions need explicit options if choices should be stored instead of generated at runtime.

Question-option audit result:

- Choice questions: 290
- Stored options: 290
- Missing stored options: 0
- Auto-ready option sets migrated: 200
- Curated option sets migrated: 90
- Needs review: 0
- Manual-only: 0
- Question type audit action counts: 361 OK

Next refinement target:

- QA roadmap progress after completing the first lesson session from the dashboard.
- QA `/api/learner-state/guest` against the dashboard and `npm run audit:learner -- guest`.
- Decide whether the roadmap deserves its own `/roadmap` route after dashboard validation.
- Decide whether the dashboard should become the permanent app home or remain a temporary learner intelligence panel.

Useful audit command:

```bash
npm run audit:learner -- guest
```

Question type audit command:

```bash
npm run audit:question-types:write
```

Question type migration commands:

```bash
npm run migrate:question-types:dry-run
npm run migrate:question-types
```

Question option audit command:

```bash
npm run audit:question-options:write
```

Question option migration commands:

```bash
npm run migrate:question-options:dry-run
npm run migrate:question-options
```

Curated option migration commands:

```bash
npm run migrate:curated-options:dry-run
npm run migrate:curated-options
```

Related maintenance command:

```bash
npm run backfill:attempt-user-ids:dry-run
```

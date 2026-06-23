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

The next implementation priority is:

Validate and polish the learner dashboard with real learner profiles.

Target behavior:

- Confirm `/dashboard` gives useful guidance after fresh, average, struggling, and high-performing sessions.
- Confirm `/engine` remains useful as a developer/debug view.
- Keep report and dashboard language learner-facing rather than engine-facing.
- Decide whether the frontend learner-stage heuristic should be replaced by a backend learner-state summary endpoint.

Next refinement target:

- QA dashboard empty state for a fresh learner.
- QA dashboard after one completed session.
- QA dashboard after weak-skill remediation appears.
- Add a dedicated backend learner-state summary if the frontend heuristic diverges from engine audit output.

Useful audit command:

```bash
npm run audit:learner -- guest
```

Related maintenance command:

```bash
npm run backfill:attempt-user-ids:dry-run
```

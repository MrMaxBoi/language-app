# Kokoro

Kokoro is a roadmap-first Japanese learning application that combines structured lessons with adaptive practice, persistent learner state, memory-aware review, and learner-friendly recommendations.

The project currently includes:

- An Express and MongoDB learning backend
- A React web application for learner flows, analytics, and engine debugging
- An Expo React Native application for the mobile learner experience

Kokoro is an active prototype. The current milestone proves the learning architecture and mobile flow; it is not yet a production-ready language course.

## Product Model

Kokoro separates curriculum decisions from adaptive practice:

```text
Roadmap       -> what the learner is ready to study
Lesson        -> the skill group being practised
Adaptive engine -> which questions fit the learner now
Memory        -> what may be forgotten
ReviewTask    -> what needs a concrete review action
Recommendation -> what the learner should do next and why
```

The adaptive engine remains active inside roadmap lessons and review sessions. The roadmap does not replace adaptation; it limits adaptation to a meaningful learning context.

## Current Capabilities

### Roadmap and sessions

- Eight N5 foundation units containing 33 roadmap lessons
- Separate Japanese Foundations roadmap with 5 units and 23 pre-N5 lessons
- Multiple-roadmap API selection while preserving N5 as the current default
- Completed, current, unlocked, in-progress, and locked lesson states
- Lesson-scoped adaptive question selection
- Broad adaptive practice for mixed sessions
- Immediate answer feedback and persisted session reports
- Prerequisite-aware lesson progression
- A roadmap selector for Japanese Foundations and the existing N5 path
- A teaching-before-assessment flow for Hiragana Vowels, K-row, and S-row
- Reusable character-focus, guided tracing, and quiet word-context components piloted in Hiragana Vowels
- Teaching interactions that do not write attempts or learner state before scored practice

### Learner model and review

- Attempt history linked to stable `questionId` and `skillId` values
- Persistent SkillState aggregation
- Memory strength, decay, and next-review tracking
- ReviewTasks created from mistakes and due memories
- Focused topic repair and guided Daily Review sessions
- Review clearing based on correct answers for the targeted skill
- Once-per-day completed Daily Review behavior
- Home recommendations generated from roadmap and active ReviewTasks
- Review of the Day preview grouped by roadmap area with skill-level details

### Question bank

- MongoDB Atlas is the runtime question source
- 404 questions mapped to 39 graph skills
- Explicit question types on all 404 questions
- Stored options for all 333 choice-style questions
- 200 automatically prepared, 90 manually curated, and 13 lesson-authored option sets
- 360 questions placed into at least one roadmap lesson
- 102 planned Foundation concepts, with 58 current questions exercising 26
- Audit and migration scripts for question types, options, mappings, and skill coverage
- Skill-aligned base-question packs under `backend/data/questions/`, retained as seed and fallback data rather than the intended runtime source

## Applications

### Mobile learner app

The Expo application under `mobile/` is the primary learner-facing direction.

Implemented mobile surfaces:

- Roadmap-first Map home
- Review of the Day preview and start flow
- Roadmap lesson detail sheet
- Compact roadmap chooser for Japanese Foundations and N5
- Data-driven lesson teaching screens with kana audio, haptics, ordered tracing, and word contexts
- Native question session with immediate feedback
- Native session result screen
- Bottom navigation for Map, Review, Progress, and Profile

The Review, Progress, and Profile tabs currently establish navigation and product direction; their complete learner experiences are still under development.

### React web app

The Vite application under `frontend/` remains useful for browser testing, deeper reporting, and engine inspection.

Main routes:

- `/` - learner Home
- `/roadmap` - learning roadmap
- `/session` - lesson or review session
- `/result` - session completion
- `/review` - review queue and topic repair
- `/insights` - progress and analytics
- `/report` - detailed session report
- `/engine` - developer-facing engine diagnostics

## Architecture

```text
Expo mobile app ----\
                     -> Express API -> Sessions / Roadmap / Recommendations
React web app ------/                        |
                                              v
                              Questions / Attempts / SkillState
                                     Memory / ReviewTask
                                              |
                                              v
                                       MongoDB Atlas
```

Key backend areas:

- `backend/controllers/session.controller.js` - session start, answer, completion, and reports
- `backend/services/questionSelection.service.js` - adaptive and lesson-scoped selection
- `backend/services/roadmap.service.js` - lesson progress and unlocking
- `backend/data/lessonContent/` - version-controlled teaching sequences
- `backend/controllers/lesson.controller.js` - learner-ready lesson content API
- `backend/services/skillState.service.js` - persistent skill summaries
- `backend/services/reviewTask.service.js` - review task lifecycle and clearing
- `backend/services/reviewSessionBuilder.service.js` - guided Daily Review composition
- `backend/services/recommendation.service.js` - learner-facing next actions

## Getting Started

### 1. Install dependencies

```bash
npm install
npm install --prefix frontend
npm install --prefix mobile
```

### 2. Configure the backend

Create a root `.env` file:

```env
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/kokoro-dev
PORT=5050
```

Never commit the real `.env` file or Atlas credentials.

### 3. Configure the mobile API address

`npm run mobile:start` automatically detects the Mac's current LAN address and
passes it to Expo. The phone and Mac must be on the same local network.

For a manual override, copy the mobile example:

```bash
cp mobile/.env.example mobile/.env.local
```

Then set the address explicitly:

```env
EXPO_PUBLIC_API_URL=http://<mac-lan-ip>:5050
```

The Mac and phone must be on the same network. Only public API configuration belongs in an `EXPO_PUBLIC_` variable; never put database credentials there.

### 4. Run Kokoro

Backend:

```bash
npm run dev
```

Web application:

```bash
npm run dev --prefix frontend
```

Mobile application:

```bash
npm run mobile:start
```

Scan the QR code with Expo Go, or press `w` to open the Expo web target.

## Data and Audit Commands

Question bank:

```bash
npm run validate:questions
npm run validate:lesson-content
npm run sync:question-source:dry-run
npm run seed:questions:dry-run
npm run seed:questions
npm run audit:question-bank
npm run audit:question-types
npm run audit:question-options
npm run report:skill-gaps
```

Migrations should be inspected in dry-run mode before applying them:

```bash
npm run migrate:question-options:dry-run
npm run migrate:curated-options:dry-run
npm run migrate:question-types:dry-run
```

Learner data:

```bash
npm run audit:learner -- guest
npm run backfill:attempt-user-ids:dry-run
npm run audit:skill-duplicates
npm run merge:skill-duplicates
```

## Verification

Web checks:

```bash
npm run lint --prefix frontend
npm run build --prefix frontend
```

Mobile checks:

```bash
npm run mobile:lint
npm run mobile:typecheck
cd mobile && npx expo export --platform web
```

## Current Limitations

- The prototype currently defaults to the `guest` learner rather than full authentication and profile selection.
- Teaching-before-assessment is implemented for the first three Foundations lessons; later lessons remain intentionally `coming_soon` until their content is ready.
- Interrupted mobile sessions do not yet resume at the exact saved question.
- Mobile Review, Progress, and Profile are not complete product surfaces.
- The roadmap currently covers an N5 foundation rather than a complete N5-to-N1 course.
- Recommendation and review behavior still needs broader validation with first-time, struggling, and long-term learner histories.

## Next Priorities

1. Tune Vowels tracing tolerance and lesson pacing on a physical phone.
2. Validate K-row completion and S-row unlocking before migrating the new lesson templates.
3. Persist and resume interrupted mobile sessions exactly.
4. Complete guided review and focused topic repair on mobile.
5. Build a truthful learner progress visualization from SkillState and Memory.

## Documentation

Detailed architecture and project decisions are maintained in:

- `docs/PROJECT_OVERVIEW.md`
- `docs/ENGINE_ARCHITECTURE.md`
- `docs/LEARNING_MODEL.md`
- `docs/ROADMAP_MODEL.md`
- `docs/CURRENT_STATUS.md`
- `docs/NEXT_STEPS.md`

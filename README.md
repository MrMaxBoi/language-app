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
- Completed, current, unlocked, in-progress, and locked lesson states
- Lesson-scoped adaptive question selection
- Broad adaptive practice for mixed sessions
- Immediate answer feedback and persisted session reports
- Prerequisite-aware lesson progression

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
- 361 questions mapped to 39 graph skills
- Explicit question types on all 361 questions
- Stored options for all 290 choice-style questions
- 200 automatically prepared and 90 manually curated option sets
- Audit and migration scripts for question types, options, mappings, and skill coverage
- `backend/data/questions.js` retained as seed and backup data rather than the intended runtime source

## Applications

### Mobile learner app

The Expo application under `mobile/` is the primary learner-facing direction.

Implemented mobile surfaces:

- Roadmap-first Map home
- Review of the Day preview and start flow
- Roadmap lesson detail sheet
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

Copy the mobile example:

```bash
cp mobile/.env.example mobile/.env.local
```

For a physical phone, use the Mac's LAN address:

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
- Roadmap lessons provide scoped practice, but complete teaching content before assessment is not implemented yet.
- Interrupted mobile sessions do not yet resume at the exact saved question.
- Mobile Review, Progress, and Profile are not complete product surfaces.
- The roadmap currently covers an N5 foundation rather than a complete N5-to-N1 course.
- Recommendation and review behavior still needs broader validation with first-time, struggling, and long-term learner histories.

## Next Priorities

1. Add a real teaching and introduction layer before lesson assessment.
2. Persist and resume interrupted mobile sessions exactly.
3. Complete guided review and focused topic repair on mobile.
4. Build a truthful learner progress visualization from SkillState and Memory.
5. Validate Daily Review reset, completion, and clearing behavior on physical devices.

## Documentation

Detailed architecture and project decisions are maintained in:

- `docs/PROJECT_OVERVIEW.md`
- `docs/ENGINE_ARCHITECTURE.md`
- `docs/LEARNING_MODEL.md`
- `docs/ROADMAP_MODEL.md`
- `docs/CURRENT_STATUS.md`
- `docs/NEXT_STEPS.md`

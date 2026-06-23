# Kokoro

Kokoro is an adaptive Japanese learning app in active development. It combines a structured skill graph, a MongoDB-backed question bank, spaced repetition memory, and learner-facing progress views to explore how a language app can personalize practice without losing curriculum structure.

The current version is a working prototype focused on the learning engine, question selection, reporting, and dashboard experience.

---

## What Kokoro Does

Kokoro tracks how a learner performs over time, identifies weak and strong skills, and uses that state to choose better practice questions.

The app currently supports:

- Session-based Japanese practice
- Atlas-backed question bank
- Stable `questionId` identity for questions
- Skill graph metadata for N5 foundation skills
- Skill-based attempt tracking
- Memory tracking for review and decay risk
- Adaptive question selection
- Prerequisite-aware gating
- Weak-skill and recent-mistake review
- Skill-first session reports
- Learner-facing dashboard
- Developer engine dashboard for debugging

---

## Learning Model

Kokoro is moving toward a roadmap-first product model:

- The roadmap gives learners a clear learning path.
- Each lesson focuses on one skill or a small skill group.
- The adaptive engine personalizes question choice inside that lesson.
- Review sessions use memory, weak skills, and recent mistakes.
- Free adaptive practice remains available for broader mixed practice.

In short:

```txt
Roadmap = what the learner should study
Engine = which questions fit the learner right now
Memory = what should come back later
Report = what Kokoro learned from the session
```

---

## Current Architecture

### Backend

- Node.js
- Express
- MongoDB Atlas
- Mongoose

Main backend responsibilities:

- Session lifecycle
- Question bank access
- Attempt storage
- Skill aggregation
- Memory updates
- Recommendation explanations
- Analytics and debug endpoints

### Frontend

- React
- Vite
- Chakra UI
- Zustand

Main frontend surfaces:

- `/session` - learning session flow
- `/report` - skill-first session report
- `/dashboard` - learner-facing progress dashboard
- `/engine` - developer/debug engine dashboard

---

## Question Bank Status

The project has migrated from a giant local question file as the runtime source toward a MongoDB Atlas-backed question bank.

Current question-bank state:

- 361 mapped questions
- 39 graph skills
- 0 unmapped skill gaps
- 0 generated fallback mappings
- `questions.js` is kept as seed/backup data, not the intended runtime source

Useful commands:

```bash
npm run seed:questions
npm run seed:questions:dry-run
npm run audit:question-bank
npm run report:skill-gaps
```

---

## Getting Started

Install dependencies:

```bash
npm install
npm install --prefix frontend
```

Create a `.env` file in the project root:

```bash
MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/kokoro-dev
PORT=5050
```

Seed questions:

```bash
npm run seed:questions
```

Run the backend:

```bash
npm run dev
```

Run the frontend:

```bash
npm run dev --prefix frontend
```

---

## Useful Development Commands

```bash
npm run audit:learner -- guest
npm run backfill:skill-graph
npm run backfill:attempt-user-ids:dry-run
npm run audit:skill-duplicates
npm run merge:skill-duplicates
```

Frontend checks:

```bash
npm run lint --prefix frontend
npm run build --prefix frontend
```

---

## Current Product Focus

The adaptive engine is now strong enough that the next major priority is product structure.

Near-term focus:

1. Define the roadmap and lesson model.
2. Make sessions lesson-based instead of only broad adaptive practice.
3. Keep the adaptive engine active inside each lesson.
4. Use review sessions for weak skills, memory decay, and recent mistakes.
5. Polish the learner-facing session, report, and dashboard flow.

---

## Project Status

Kokoro is not production-ready yet. It is an active prototype for validating adaptive learning systems, skill-based progression, and Japanese learning UX.

For detailed project notes, see:

- `docs/PROJECT_OVERVIEW.md`
- `docs/ENGINE_ARCHITECTURE.md`
- `docs/LEARNING_MODEL.md`
- `docs/CURRENT_STATUS.md`
- `docs/NEXT_STEPS.md`

---
inclusion: always
---

# Kokoro multi-chat workflow

This project is worked on by a set of dedicated Kiro chats that coordinate
through one shared checklist, not by talking to each other live. The current
chats:

- **Lesson Design** — lesson pacing, teaching interactions, tracing, cards,
  scenes, question experiences, and the Expo mobile look and feel. Owns the
  `UX / Frontend` lane.
- **Core Product Brainstorm** — product philosophy, pedagogy, feature ideas,
  brand. No code. Owns the `Product proposals` and `Product brief` sections.
- **Daily Planning** — daily planning, no code. Owns the `Today` section and
  the `Done log`.
- **Question Bank** — the question source packs under
  `backend/data/questions/` and the question-DB seed/reseed
  (`npm run seed:questions*`, the Atlas `questions` collection).

- **Core Features** — backend + app logic: knowledge graph, skillGraph, API,
  adaptive engine, session length, persistence, and the question
  schema/passthrough in `models/question.model.js`, `buildQuestionFromSource`,
  `questionSelection.service.js`. Owns the `Core Features` lane.

Product proposes. Planning prioritizes. Lesson Design and Question Bank
implement in their lanes.

The shared checklist is:
`/Users/ljsljs/Documents/CodeProjects/language-app/.kiro/priorities/PRIORITIES.md`

Charters for each chat live in `.kiro/priorities/CHARTER-*.md`.

Rules for every chat:
- Read `PRIORITIES.md` when you start.
- Work only items under `Today` or your own lane's backlog.
- When you finish something, move it to the `Done log` with the date and remove
  it from Today/backlog. Only edit your own lane.
- Before implementing a multi-part feature or redesign, list the open decisions
  with a recommended option each and wait for approval. Don't code first.

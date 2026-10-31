---
inclusion: always
---

# Kokoro multi-chat workflow

This project is worked on by three dedicated Kiro chats that coordinate through
one shared checklist, not by talking to each other live:

- **Kokoro · UX** — Expo mobile look and feel (lesson deck, kana hub, tracing,
  animation, reduce-motion). Owns the `UX / Frontend` lane.
- **Kokoro · Core** — backend + app logic (knowledge graph, skillGraph, API,
  adaptive engine, lesson content). Owns the `Core Features` lane.
- **Kokoro · Plan** — daily planning, no code. Owns the `Today` section and the
  `Done log`.

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

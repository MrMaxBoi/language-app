# Kokoro — Shared Priorities

The single source of truth shared by all Kokoro chats. Every chat reads this file
when it starts and updates it as work moves. Keep it short and current.

- **Kokoro · UX** owns the `UX / Frontend` lane.
- **Kokoro · Core** owns the `Core Features` lane.
- **Kokoro · Plan** owns the `Today` section and the `Done log`.

Rules:
- Add a dated entry to the Done log when you finish something; remove it from Today/backlog.
- Don't delete another lane's items — only the owning chat edits its lane.
- Use `[ ]` for open and `[x]` for done. Keep notes to one line.

North star (from `docs/NEXT_STEPS.md`): validate and deepen the mobile learner
flow — do NOT expand the adaptive engine.

---

## Today — set 2026-10-31 by Plan

- [ ] **UX** — Fix the lesson-flow UX on the first Foundation lesson
      (Hiragana Vowels) in `mobile/app/lesson/[lessonId].tsx`. Make the 15-step
      explain/focus/trace/context flow feel deliberate, not slow, before copying
      the pattern to K-row / S-row.
- [ ] **Standing risk** — Decide whether to commit or stash the uncommitted
      mobile work now sitting loose on `main` (20+ modified, 7 new files). Not a
      feature; it's protecting days of work.

---

## UX / Frontend backlog

_Owned by Kokoro · UX. Expo mobile look and feel. Source: `docs/NEXT_STEPS.md`._

- [ ] Validate the Vowels flow feels deliberate on a physical phone; tune tracing
      tolerance and stroke-guide pacing before expanding tracing past the vowels.
- [ ] Validate Review of the Day states on device (ready / completed / caught-up /
      next-day reset).
- [ ] Replace the Review tab placeholder with guided daily review + topic repair.
- [ ] Design the Progress "skill constellation" screen from real SkillState /
      Memory / prerequisite data.
- [ ] Persist session question IDs + progress so an interrupted mobile session
      resumes exactly.
- [ ] Validate map density and scrolling with first-time / active / advanced
      learner histories.

---

## Core Features backlog

_Owned by Kokoro · Core. Backend + app logic. Source: `docs/NEXT_STEPS.md`._

- [ ] QA `/api/learner-state/guest` against the dashboard + `npm run audit:learner -- guest`.
- [ ] Design a consistent background-free spot-illustration system to replace the
      temporary generated word artwork.
- [ ] Decide: does the roadmap get its own `/roadmap` route after dashboard validation.
- [ ] Decide: is `/dashboard` the permanent app home or a debug/developer panel.
- [ ] Knowledge graph / word-network feature (still unbuilt) — design the MongoDB
      `links` collection when it rises in priority.

---

## Blocked / needs a decision

- [ ] (anything waiting on the user)

---

## Done log

_Newest first. Dated one-liners._

- 2026-10-31 — Set up the three-chat workflow, checklist, and workflow steering file.

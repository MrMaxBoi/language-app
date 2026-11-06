# Kokoro — Shared Priorities

The single source of truth shared by all Kokoro chats. Every chat reads this file
when it starts and updates it as work moves. Keep it short and current.

- **Lesson Design** owns the `UX / Frontend` lane.
- **Core Product Brainstorm** owns the `Product proposals` and `Product brief`
  sections (product philosophy, pedagogy, brand — no code).
- **Daily Planning** owns the `Today` section and the `Done log`.
- **Question Bank** owns the question source packs under
  `backend/data/questions/` AND the question-DB seed/reseed
  (`npm run seed:questions*`, Atlas `questions` collection).
- **Kokoro · Core** owns the `Core Features` lane — backend/app logic
  (knowledge graph, skillGraph, API, adaptive engine, session length,
  persistence) and the question schema/passthrough (`models/question.model.js`,
  `buildQuestionFromSource`, `questionSelection.service.js`). Question Bank
  runs the seed once that passthrough is in place.

Rules:
- Add a dated entry to the Done log when you finish something; remove it from Today/backlog.
- Don't delete another lane's items — only the owning chat edits its lane.
- Use `[ ]` for open and `[x]` for done. Keep notes to one line.

North star (from `docs/NEXT_STEPS.md`): validate and deepen the mobile learner
flow — do NOT expand the adaptive engine.

---

## Today — set 2026-11-06 by Plan

**Milestone: the intelligent Vowels lesson.** Prove the first lesson teaches
something meaningful, asks better questions, adapts to the learner, and completes
correctly. Only then copy the pattern to K-row / S-row.

**Acceptance outcome (approved 2026-11-06):** after the lesson, the learner can
see or hear a tiny word such as あお or うえ in a visual situation and understand
it without relying on romaji.

**Visual structure is frozen.** No broad card, spacing or animation passes on the
Vowels lesson. Only fix device-blocking usability problems.

Order of work:

- [x] **1 · Lesson Design** — Rooftop scene rewritten (done 2026-11-06, see Done log).
- [x] **2 · Lesson Design** — Vowels pool rewritten across three layers (done
      2026-11-06). Production questions need the Core handoff under Blocked.
- [x] **3 · Core (after 2)** — Adaptive lesson length, Core half DONE
      2026-11-07 (see Done log). Server now decides the starting count (3–6) by
      learner stage + weak-skill-in-scope; hard-coded `5` replaced; `/:id/extend`
      stub added for the mobile grow-as-you-go turn. The lesson-completion
      threshold in `roadmap.service.js` was intentionally left as-is (separate
      cross-session mastery rule, not session length). **Mobile half is a new
      Blocked item below (Lesson Design).**
- [ ] **4 · Integration (after 3)** — Physical-phone test: one clean run that
      ends early, one struggling run that extends and repairs; check completion,
      result screen, and leaving mid-session.

Deferred until the milestone passes: Hakanai rebrand (own migration), K-row /
S-row upgrade, roadmap home UI, knowledge graph.

---

## UX / Frontend backlog

_Owned by Kokoro · Lesson Design. Expo mobile look and feel. Source: `docs/NEXT_STEPS.md`._

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

- [x] **For Core (blocks item 4):** DONE 2026-11-07 — `audioText` added to
      `models/question.model.js` (optional, no default) and both `audioText` +
      `cognitiveType` now pass through `buildQuestionFromSource`. See Done log.
      **Reseed still pending (Question Bank item below) — the schema fix only
      takes effect in Atlas after `npm run seed:questions:reset`.** Item 3 can
      then repair by `cognitiveType` layer.

- [ ] **For Question Bank (after the Core passthrough lands):** reseed Atlas.
      Removal is solved: `npm run seed:questions` is upsert-only and leaves
      retired IDs (001–003, 009–013, and the newly retired vowel 014–018, 021,
      022) live, so use **`npm run seed:questions:reset`** (`--reset` runs
      `deleteMany()` then re-inserts all 406 from source = replace mode, clean
      removal). Caveat: `--reset` wipes the whole `questions` collection, so any
      question authored directly in Atlas is lost — source packs are the single
      source of truth, which the README already requires. Dry-run
      (`npm run seed:questions:dry-run`, read-only) confirmed 2026-11-07: 406
      questions, no duplicate IDs, payload valid.

---

- [ ] **For Lesson Design (mobile half of item 3):** wire the "grow the session
      when the learner struggles" turn. Core added `POST /api/sessions/:id/extend`
      (body `{ count: 1-3 }`) → `{ questions, added, plannedQuestionCount, max }`;
      it returns repair questions excluding ones already asked and caps the total
      at 6. Mobile (`mobile/app/session.tsx` + session store) must decide WHEN to
      call it and append the returned questions to its queue. `/start` now also
      returns a `sessionLength` block. A full standalone handoff prompt is in the
      Core chat. **Backend side is done and verified; this is UI/store only.**

---

## Product proposals — for Plan to prioritize

_Raised by Kokoro · Product. Not yet scheduled. Plan decides when/where these land._

- [ ] **REBRAND: Kokoro → Hakanai.** Brand direction approved by Max (see brief
      below). Needs a real migration pass when a lane picks it up. Concrete scope
      found in the mobile app:
      - `mobile/app.json` — `name` "Kokoro", `slug` "kokoro-mobile",
        `scheme` "kokoro", iOS/Android id `com.kokoro.learning`.
      - Filenames — `constants/kokoro-theme.ts`, `services/kokoro-api.ts`
        (rename + update all imports across index/profile/progress/lesson/
        result/session/review-preview-sheet).
      - Visible copy — wordmark "Kokoro"/"こころ" in `(tabs)/index.tsx`, plus
        "Kokoro" in error/placeholder strings (index, profile, progress,
        review-preview-sheet, kokoro-api).
      - Do this as its own focused migration, not mixed into feature work.
      - Note: word-only wordmark (no hidden 日 / no torii in the mark).

---

## Product brief — Hakanai (brand soul)

_Owned by Kokoro · Product. The "why". Every screen checks against this._

- **Name:** Hakanai (儚い) — the *arrival*, not impermanence of the language.
- **Meaning:** the fleeting, yearned-for future moment of actually speaking and
  sharing a real moment in Japan. Origin: the golden-hour realization on the
  Kansai highway — grief for the self who *yearned*, once the place became real.
- **Promise:** we get you to the moment, we don't keep you on the app. The
  language keeps the longing renewing, one small real moment at a time.
- **Decision filter:** "Does this bring the user closer to that moment — or does
  it just keep them on the app?" Fails: streak guilt, hearts, cartoon noise.
- **No mascot, by conviction.** Calm is the flex — keep it legible, never loud.
- **What earns the story:** knowledge graph (real teaching), honest spaced
  review, adaptive engine in lesson one. The current calm lesson UI is on-brand;
  the open work is the *teaching logic underneath*, not the pixels.

### Question philosophy — "rehearse the moment, don't test the symbol"

_Product proposal raised 2026-11-06. For Plan to prioritize; Lesson Design + Core
to build against. This is the core-lesson direction, not UI details._

- **The insight:** questions feel stale because they test *"do you remember this
  symbol"* — the same shallow thing every app tests. Hakanai's questions should
  instead **rehearse being in the moment** — a tiny simulation of the real
  golden-hour: reading a real sign, catching a real spoken word, saying a
  greeting back. The daily-life context IS the lesson, not decoration after it.
- **Three layers every question maps to** (drop anything that's a 4th
  recognition question):
  1. Recognition — "which sound is あ?" Table stakes; keep few.
  2. Production — tracing / "you heard /a/, which kana?" Rarer, more honest.
  3. **Connection** — only the knowledge graph enables this: combine known kana,
     "which real word uses this sound," "this word shares a part with one you
     know." The signature layer competitors can't copy.
- **Distinctiveness comes from the REASON, not novel formats.** Ordinary formats,
  extraordinary selection. Don't invent gimmick interactions; make questions
  need something only Hakanai has (graph, tracing, adaptive history, a real
  daily-life moment).
- **Question count is adaptive, not fixed.** The engine decides per learner
  (nail it → 2 and move on; struggle → 6 + repair). A fixed "N per lesson" is
  itself a competitor-copy pattern.
- **The three-question test** for any candidate: (1) which layer does it test?
  (2) does it need something only Hakanai has? (3) does it move the learner
  toward a real-world moment? Must pass all three or it's filler.
- **OPEN — for Max:** name the smallest real-world moment a beginner should be
  ready for (read a train sign / catch one shopkeeper word / say one greeting
  back). That target is what question types serve.

---

## Done log

_Newest first. Dated one-liners._

- 2026-11-07 — [Lesson Design] Mobile half of item 3: practice grows once on the
  2nd first-try miss (`/extend` count 2, silent, inserted before pending "One
  more look" retries; finishing waits for an in-flight extend; the store drops
  anything already in the session). Practice intro now says "A few short
  questions" (lesson content v8). tsc + lint clean; start/extend checked against
  the local backend (3 → 5). Phone runs (clean + struggling) still to do.

- 2026-11-07 — [Core] Adaptive session length, Core half. New
  `services/sessionLength.service.js` (`decideSessionLength`: stage→3-6, +1 for a
  weak skill in scope, floor 3 / ceil 6, never past the lesson pool). New
  `getLearnerStageSignals` export on `questionSelection.service.js` reuses the
  engine's stage logic with no full selection. `session.controller.js` now sizes
  the session adaptively (hard-coded `5` gone) and records
  `roadmap.plannedQuestionCount` / `startingQuestionCount` (added to
  `session.model.js`); `/start` returns a `sessionLength` block. Added
  `POST /api/sessions/:id/extend` (stub for the mobile grow turn): returns 1-3
  repair questions excluding already-asked, capped at 6. Unit test
  `tests/sessionLength.decide.test.js` (9 assertions, pass); live-verified:
  `/start` returns size+basis, `/extend` added 2 and capped at 6.
  `roadmap.service.js` completion rule left unchanged by design.

- 2026-11-07 — [Question Bank] Reseeded Atlas now that Core's passthrough is in.
  Verified `cognitiveType` + `audioText` in `question.model.js` and
  `buildQuestionFromSource`, then ran `npm run seed:questions:reset` (full
  rebuild). Collection is exactly 406; all stale vowel orphans (001–003,
  009–013) and the retired 014–018/021/022 are gone; the 15 Vowels questions
  carry their layer + difficulty spread and all 5 production questions have
  `audioText`. Phone test (Today item 4) is now unblocked.

- 2026-11-07 — [Core] Question passthrough DONE + verified on the live endpoint.
  `audioText` added to `models/question.model.js` (optional, no default). Both
  `audioText` (only when present) + `cognitiveType` (default `recognition`) now
  pass through BOTH shaping stages in `services/questionSelection.service.js`:
  `buildQuestionFromSource` AND the explicit field-whitelist `.map()` that builds
  the final API response (the real response shaper — the first fix alone was not
  enough). Reseed run by Question Bank. Verified against
  `POST /api/sessions/start` (foundations-hiragana-vowels, 10 runs): production
  questions return audioText 19/19 (あ い う え お), 0 questions missing
  cognitiveType, 0 retired IDs ever selected. Unit test
  `backend/tests/buildQuestionFromSource.passthrough.test.js` passes;
  `validate:questions` 406/39. Item 4 (phone test) unblocked.

- 2026-11-07 — [Core] Took ownership of the `Core Features` lane (was
  UNASSIGNED); updated the ownership lines in `PRIORITIES.md` and the steering
  file.

- 2026-11-07 — [Question Bank] Reworked the 15 Vowels practice questions in
  `foundation/hiragana.js` to the Question-philosophy rules: recognition 004–008
  (004→medium look-alike, explanations now name the tempting miss); production
  reworked into one-line rooftop situations, no longer repeating the in-lesson
  sound check (014–018 retired → new 024–028, audio kept); connection 021/022
  retired → new 029/030 with real situations, 019/020/023 kept. Added a
  `difficulty` param to the factory; spread per layer (rec 4e/1m, prod 2e/2m/1h,
  conn 1e/3m/1h). `npm run validate:questions` passes (406, unchanged). Drafted 3
  phone-test moment checks in `VOWELS-MOMENT-CHECKS.md` (not pooled, not seeded).
  Not seeded — Core passthrough + reseed under Blocked still gate the phone test.

- 2026-11-06 — [Lesson Design] Vowels scene: golden-hour balloon, うえ / あお only
  (lesson content v7). Pool: 5 recognition, 5 production (by ear), 5 connection,
  tagged by `cognitiveType`; quiz screen plays `audioText` with a Hear button.

- 2026-11-06 — [Plan] Re-aligned priorities: the intelligent Vowels lesson is the
  milestone; visual structure frozen; acceptance outcome set (understand あお /
  うえ in context without romaji). Lesson redesign was committed 2026-10-31 as
  `1e9477b`, so the uncommitted-work risk is closed.

- 2026-11-06 — [Product] Question philosophy set: lessons should **rehearse the
  moment, not test the symbol** — daily-life context is the lesson. Three layers
  (recognition/production/connection), adaptive count, three-question test.
  Recorded in brief for Plan. Open: Max to name the first real-world moment.
- 2026-11-02 — [Product] Brand approved: Kokoro → **Hakanai** (儚い) — the arrival,
  not impermanence. Word-only mark, no mascot. Brief recorded; migration raised
  as a Product proposal for Plan.
- 2026-10-31 — Set up the three-chat workflow, checklist, and workflow steering file.

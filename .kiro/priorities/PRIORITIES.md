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

## Today — set 2026-11-09 by Plan

**Focus: close the Vowels learning outcome, then build K-row.** Mechanics are
proven (item A passed). The open question is whether a beginner understands
あお / うえ without romaji, so the scene gets reworked first and tested once, on
the version we'd ship.

**Step 1 · Small fixes, now, in parallel.** All three come before K-row because
K-row reuses each one.
- [x] **Lesson Design** — Trace card centring fixed (done 2026-11-09, see Done
      log). Not yet seen on the phone.
- [x] **Core** — Extend 6-question cap enforced (done 2026-11-09, see Done log).
      The cap now measures ISSUED size, not answered count.
- [x] **Question Bank** — Unlinked `mock_101` / `mock_115` from
      `foundations-hiragana-vowels` and reseeded (done 2026-11-09, see Done log).

**Step 2 · Scene rework + K-row pool, in parallel.**
- [x] **Lesson Design** — Two-moment scene rework built in the app within the
      two-session time box (done 2026-11-09, lesson content v9, see Done log).
      Not yet seen on the phone. Counts as the beta version of Product's
      end-of-lesson moment card.
- [x] **Question Bank** — K-row question pool built across the three layers
      (done 2026-11-09, see Done log). Scene/lesson content still Lesson Design's.

**Step 3 · Outcome check (after the rework).**
- [ ] **Max** — Quick phone pass first: check the trace centring on あ い う え お
      and watch both moments (`moment-ue`, `moment-ao`) with sound on and with
      Reduce Motion on. Fix only what blocks the beginner test.
- [ ] **Lesson Design** — Update `.kiro/priorities/VOWELS-MOMENT-CHECKS.md` for
      the new scene (it still refers to the rooftop and the sea-at-dusk image).
- [ ] **Max** — Run the moment checks with a beginner who can't read kana.
      Pass bar: 2 of 3 on the first try, no romaji spoken. A pass closes the
      Vowels milestone.

**Step 4 · K-row lesson content (after step 3).** Build K-row's lesson steps and
scene on the proven pattern. Hakanai rebrand stays a separate migration, queued
behind K-row.

---

## Milestone record — intelligent Vowels lesson (set 2026-11-06)

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
- [x] **4a · Mechanics (phone test, item A)** — CLOSED 2026-11-09. Passed
      across five runs on 2026-11-07 (see Done log).
- [ ] **4b · Learning outcome (moment checks, item B)** — OPEN. Not yet run.
      Carried to Today step 3, after the two-moment scene rework, with a
      beginner who can't read kana.

K-row question pool may start now (Today step 2). K-row lesson content and
scene wait for 4b. Still deferred: Hakanai rebrand (own migration), S-row
upgrade, roadmap home UI, knowledge graph.

---

## UX / Frontend backlog

_Owned by Kokoro · Lesson Design. Expo mobile look and feel. Source: `docs/NEXT_STEPS.md`._

- [ ] **Fix: off-centre character on the Trace card** (usability test
      2026-11-08). Device bug, allowed under the freeze. Likely the Klee One
      glyph vs the trace paths (`KANA_GLYPH_SCALE`, `kana-page-layout.tsx`).
- [ ] **Two-moment rework of the Vowels scene** (from the 2026-11-08 usability
      test: scene "feels generic"; tester lost on word romaji). Approved by Max
      2026-11-09, **needs Plan to place it** (new interaction on a frozen lesson).
      Decisions taken:
      - Split the one clumped scene into two moments, each one section after
        its word is taught: **うえ** around step 16 (after お's trace), **あお**
        at the end, replacing `scene-rooftop`. Same balloon story.
      - Diglot sentences, phrases fading in ~0.4s apart, pause before the
        Japanese word: "It drifts **うえ**, high over the rooftop." / "Grandma
        watches it fade into the evening **あお**."
      - Japanese word 1.5–2× the English size; うえ terracotta, あお indigo.
        Sound plays as the word lands; tap replays.
      - Romaji small and grey under the word, fading in last. No English
        meaning line (the sentence carries it).
      - Moment badge: ~22pt golden circle with a half-set sun drawn in code,
        top right, fades in as the Japanese word lands, before the romaji. No
        count/pop/sound; screen readers hear "A moment". Swap for the real logo
        after the rebrand; may grow into the v2 "recorded into your graph" badge.
      - Reduce motion: everything in one fade, sound still plays.
      - Plan romaji fading for later rows (full in Vowels, less in K-row on).
      - Build a replayable preview in chat before touching the app.
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

- [x] **For Question Bank:** DONE 2026-11-07 — `seed:questions:reset` run,
      Atlas holds exactly 406 with retired IDs gone (see Done log). Original note:
      reseed Atlas.
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

- [x] **For Lesson Design:** DONE 2026-11-07 — practice grows once on the 2nd
      first-try miss via `/extend` (see Done log). Original note: wire the "grow the session
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

- [ ] **End-of-lesson "moment" reflection card (beta-sized).** Raised 2026-11-07.
      After a lesson, show the learner the lesson's scene exchange COMPLETE (e.g.
      the rooftop うえ / あお moment), let them re-hear it, and let them feel "I
      just understood a whole real Japanese moment." NO tapping, NO graph, NO
      badges — it reuses the scene-card component that already exists and works.
      Gives ~80% of the "full moment" emotional payoff for ~5% of the build, and
      is indistinguishable from the Hakanai soul. The v2 tap-to-reveal immersion
      page (see Parked) is a later upgrade TO this card once the graph exists.
      Note: builder-fatigue, not a design flaw, is why the existing scene card
      feels stale — the cure is building the NEXT row, not re-feeling the first.

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
- **ANSWERED 2026-11-06:** the first real-world moment is seeing or hearing a
  tiny word such as あお or うえ in a visual situation and understanding it
  without romaji (the Vowels acceptance outcome). Later lessons build toward
  bigger moments such as a sign or a greeting.

---

## Parked — v2 ideas (NOT in the Jan beta)

_Owned by Kokoro · Product. Good ideas deliberately held back so the beta stays
small enough to ship. The test: "if this is missing, does the beta stop proving
the soul?" If no, it lives here. Do not pull these into Today without Plan + Max
re-scoping the beta first._

- **Knowledge graph — the "layered word reveal" experience (v2 centerpiece).**
  Max's vision, 2026-11-07. When you learn a new word, a small moment/animation
  marks it as newly *attained* for your graph. A word is not fully revealed at
  first contact — it *expands in layers* as you keep learning: deeper meaning,
  associated words, and callbacks to the golden-hour situations the word appeared
  in across lessons. Clicking a word opens its growing node. This is the emotional
  payoff of the whole word-network idea — build it WELL, with time, AFTER the beta
  proves people want the honest-teaching core. The MongoDB `links` collection
  (already noted in Core backlog) is its foundation. Beta ships without it and
  still fully expresses Hakanai; the graph makes it better, not valid.
- **"Full moment" immersion / reflection page (v2 — the graph's front door).**
  Max's vision, 2026-11-07. A reflective page that shows the learner a COMPLETE
  real Japanese exchange — richer than their current roadmap level — to feel a
  whole fleeting moment, not just a drilled symbol. Every word is TAPPABLE: tap
  reveals its meaning and what *unknown connections it still has left*. The page
  RECORDS what the learner saw into the knowledge graph, with a top badge
  notifying "new moment / new word recorded into your graph." This is the same v2
  knowledge-graph feature above, wearing its UI: it depends entirely on unbuilt
  infra (the `links` graph, graph-write/schema, the attainment-event/badge system,
  and above-level content authoring). Do NOT pull into the beta — it would eat it.
  The beta-sized seed of this feeling is the end-of-lesson moment card proposed
  below; this full page is the v2 upgrade TO that card once the graph exists.
- **Atmosphere / art direction (v2, raised 2026-11-07).** Per-chapter evocative
  backgrounds that make the roadmap an emotional journey (e.g. soft Sakura-pink +
  petals for the first gentle chapters, more ethereal moods later). A loading
  screen with a "sun" logo animation and short poetic lines on what *ephemeral*
  means. KEY CONSTRAINT: translate the *feeling* of inspiration art (fleeting,
  ethereal) into Hakanai's QUIETER register — golden-hour-and-mist, not
  battlefield-and-fire. Same feeling, our volume. Right time is after the brand
  + logo are locked.
- **Character hub as a knowledge-graph surface (v2).** Max's vision, 2026-11-09.
  The top character strip (あ filled, the rest dotted placeholders) grows into a
  graph entry point: showing uncovered/locked connections, what a character still
  links to, the "new attainment" moment. Depends on the same unbuilt graph infra
  as the two ideas above. IMPORTANT: the LIVE hub today is NOT this — see the
  usability note below; the live component is already ambient and fine for the
  beta. This entry is only the future upgrade, once the graph exists.

---

## Usability test — findings for Lesson Design (raised 2026-11-09)

_Raised by Kokoro · Product from Max's 2026-11-08 session with one friend. ONE
user, Duolingo-anchored, not the target persona — directional signal, not a
verdict. Observation → likely meaning → the call it raises. Max to discuss the
UI execution with Lesson Design; Product flags the brand-level calls._

- **Context flag:** the tester pulled out Duolingo and silently compared, unasked.
  His reference frame is Duolingo, so several "generic" reactions really mean
  "didn't feel different enough to escape the comparison." Weight accordingly.
- **No word-level romaji (e.g. あお = "blue").** He had per-vowel romaji but not
  on whole words and felt lost. BRAND-LEVEL CALL, not a UI nit: withholding
  word romaji may be correct ("understand あお without romaji" IS the approved
  acceptance outcome), OR we removed the crutch without a better handhold
  (audio/visual). Real question for Max: did we remove the crutch without giving
  a better one? Decide deliberately — do not reflexively add romaji.
- **Off-centre character on the Trace card.** Genuine device bug; undercuts the
  calm/precise feel. Straightforward fix. (Lesson Design.)
- **Character hub felt "useless" — never looked at it.** RESOLVED as a non-issue:
  the live hub is the ambient top strip (filled あ + dotted placeholders), not an
  interrupting screen. Ambient progress that some users ignore is working as
  intended for a calm, anti-streak-counter app — him ignoring it is NOT a failure.
  Recommendation: LEAVE AS IS for the beta; do not reinvent or build up. The
  grander graph-surface version is parked for v2 (see above).
- **Moments page "feels generic, not impactful."** The one that should carry
  weight. His prescription — "separate the experiences, give more detail, develop
  one more" — independently CONFIRMS the end-of-lesson "moment" reflection card
  proposal: two thin lines (うえ! / あお…) are too compressed to land as a
  *moment*; one developed moment with room to breathe is the fix. Treat as
  supporting evidence for that proposal, not a new problem.
- **"UI should improve" (unspecified).** Too vague to action. Do NOT let it
  trigger another polish spiral; wait until he names something specific.

---

## Done log

_Newest first. Dated one-liners._

- 2026-11-09 — [Plan] Steps 1 and 2 complete across all lanes. Ticked them in
  Today and added a phone pass before the beginner test, since neither the trace
  fix nor the moments has been seen on a device. Nothing from steps 1–2 is
  committed yet.

- 2026-11-09 — [Lesson Design] Today step 2, scene rework, built in the app
  (session 2 of 2). New `moment` step type (`components/lesson/moment-step.tsx`,
  type + validator): diglot sentence fading in by phrase, Japanese word last in
  its line, large Klee One, terracotta / new `palette.indigo`, sound as it
  lands, gold half-sun badge top right, small grey romaji last, reduce-motion =
  one fade. Lesson content v9: `moment-ue` after `trace-o`, `moment-ao` replaces
  `scene-rooftop`. tsc clean, no new lint errors, content validator passes,
  backend serves v9. Not yet seen on the phone.
- 2026-11-09 — [Lesson Design] Today step 1 done: Trace card centring. The
  stroke paths sit off-centre in their 1024 box (う −46, い −31, え −29 high);
  the view window now centres each kana's strokes, with touch and guide dot
  using the same origin (`character-trace-step.tsx`). Not yet seen on the phone.

- 2026-11-09 — [Question Bank] Built the K-row pool to the Vowels standard
  (Today step 2). Retired the 15 auto-generated character/sound/pair drills,
  unlinked `mock_116` (kept on `lesson-hiragana-recognition`), added 15 new
  layer-tagged questions via a new `createKRowQuestion` factory: 5 recognition
  (105 medium look-alike, romaji this layer only), 5 production (audioText, ear,
  110 hard ear-only), 5 connection (golden-hour station: えき/あか/こえ/かお + an
  あお Vowels callback, no romaji). Spread rec 4e/1m · prod 2e/2m/1h · conn
  1e/3m/1h. `validate:questions` 406/39, one `seed:questions:reset`. Atlas
  verified: k-row=15, old drills gone, total still 406.
  **`lesson-hiragana-recognition` = 50 questions**, unchanged by this change:
  the 15 new K-row questions dual-link to it (same pattern as the old drills),
  so removing 15 drills + unlinking mock_116 + adding 15 re-linking questions
  nets to the same 50.

- 2026-11-09 — [Core] Fixed the extend 6-question cap. `extendSession` was
  measuring headroom against answered count (`askedCount`), so a session that
  started at 5 but had few answers could extend to 8. Now it caps on ISSUED
  size (`plannedQuestionCount` → `startingQuestionCount` → askedCount fallback).
  Extracted the rule into a pure `allowedExtendCount` helper in
  `services/sessionLength.service.js`; controller uses it. Live-verified: a
  5-start session asked to extend by 3 now adds only 1 (→6); a session at 6 adds
  0. 8 new cap assertions in `tests/sessionLength.decide.test.js` (17 total,
  pass).

- 2026-11-09 — [Question Bank] Unlinked `mock_101` / `mock_115` (old-style,
  untagged recognition) from `foundations-hiragana-vowels`; both keep
  `lesson-hiragana-recognition`. `validate:questions` 406/39, then
  `seed:questions:reset`. Atlas verified: `foundations-hiragana-vowels` now maps
  to exactly the 15 designed Vowels questions, so the retired-style pair can't
  surface in the lesson or the moment checks. (Today step 1.)

- 2026-11-09 — [Plan] Split the Vowels milestone (approved by Max). Mechanics
  (4a) closed; learning outcome (4b) stays open until the moment checks run on
  the reworked scene. Placed the trace fix, extend-cap fix and mock_101/115
  unlink before K-row; two-moment scene rework time-boxed to two sessions,
  alongside the K-row question pool. The rework counts as the beta version of
  Product's moment card.

- 2026-11-09 — [Product] Logged the 2026-11-08 usability test (one friend) as an
  interpreted findings note for Lesson Design: romaji question (brand-level call),
  off-centre trace bug, hub "useless" (resolved — ambient, leave as is), moments
  page "generic" (confirms the moment-card proposal), vague "UI should improve"
  (not actioned). Character hub as a graph surface parked as a v2 idea.

- 2026-11-07 — [Lesson Design] Phone test, item A (fresh `guest`, 5 runs):
  clean run 3→3 ✅; 1 miss → 3 + 1 retry, no growth ✅; 2 misses → planned 5
  (+2 before retries) ✅ twice; audio plays, result screen opens, returns to
  Foundations ✅; result score counts first tries only, as designed ✅; leaving
  mid-session then reopening starts a fresh session without errors ✅ (resume
  is the existing UX backlog item). **Item A passed.** Backlog: `mock_101`/`mock_115` (old-style, untagged) still linked to
  `foundations-hiragana-vowels` → Question Bank; extend can pass 6 when start
  is 5 → Core. Item B (moment checks) not run yet.

- 2026-11-07 — [Lesson Design] Reset `guest` for the phone test (Max's request):
  all `guest` records in 8 collections (sessions, attempts, questionexposures,
  reviewtasks, skills, knowledgecoverages, memories, skillstates) re-labelled
  `userId: guest-archive-2026-11-07`, nothing deleted. Roadmap now shows guest
  as new (2 unlocked, 32 locked). Undo: set the userId back. **Core: note this.**

- 2026-11-07 — [Plan] Milestone items 1–3 done and committed (`435eb50`), Atlas
  reseeded. Today set to item 4, the phone test (mechanics run + moment checks).
  Housekeeping with Max's OK: ticked the two resolved Blocked items and closed
  Product's open "first real-world moment" question.

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

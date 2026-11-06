# Question Bank Audit — Phase 1 (audit only, no edits)

_Owned by Kokoro · Question Bank. Produced 2026-11-06. Read-only: no files were
edited and the database was not touched. This is the evidence for the Phase 2
plan the user must approve before any repopulation._

## What this audits

Every source question under `backend/data/questions/` (loaded through
`backend/data/questions/index.js`), tested against the **Question philosophy**
in `PRIORITIES.md` ("rehearse the moment, don't test the symbol") using the
three-question test:

1. **Which layer** — recognition / production / connection?
2. **Does it need something only Hakanai has** — graph, tracing, adaptive
   history, a real daily-life moment?
3. **Does it move the learner toward a real-world moment?**

Must pass all three or it is filler. Layer is read from `cognitiveType` where
present; otherwise inferred from the prompt (and shown as the inferred layer).

## Headline numbers (measured, not estimated)

- **406 questions** across **39 packs** (not ~446 — the earlier estimate was
  high; the real count from `index.js` is 406).
- **61 roadmap lessons** across both roadmap sources (`backend/data/roadmap.js`
  **and** `backend/data/roadmaps/japaneseFoundations.js`).
- Classification: **KEEP 15 · REWRITE 344 · RETIRE 47.**
- Inferred layer mix: **recognition 238 · production 132 · connection 36.** The
  36 "connection" are almost entirely the Reading strand (which already reads a
  real sentence) plus the 5 new Vowels connection questions. The bank is
  overwhelmingly recognition/production "test the symbol" — exactly what the
  philosophy says to move away from.

## Cross-cutting findings

- **No wrong-answer defects.** Every choice-type question
  (`multiple_choice` / `translation_choice`) has exactly one correct option and
  that option's text matches `correctAnswer`. (`fill_in_blank` questions carry
  an empty `options: []` by design — this is correct, not a defect.)
- **No broken lesson references.** Every `lessonIds` entry resolves to a real
  lesson once both roadmap sources are merged.
- **44 questions have no `lessonIds` at all** (no lesson owns them as primary).
  They are still reachable by the engine as *support-skill* questions via a
  lesson's `skillIds`, so this is a placement gap, not necessarily dead content.
  All 44 live in six packs:
  `time.weekdays` (10), `time.asking_time` (10), `particles.advanced` (5),
  `verbs.advanced_forms` (9), `grammar.comparison_conditionals` (5),
  `grammar.clauses_uncertainty` (5). **Decision for Plan/Core:** do these skills
  deserve their own lessons, or should these questions be deleted as orphaned?
- **`cognitiveType` is set on only 15 of 406 questions** (the rewritten Vowels
  pool). Every other question is untagged, so Core item 3 (adaptive repair *by
  layer*) has nothing to repair against outside Vowels. Tagging layer is a
  prerequisite for the adaptive engine, not a nicety.
- **13 duplicate pairs** (same prompt + same answer). One copy of each is marked
  RETIRE in the per-question list (the first-seen copy is kept). The notable one
  is `mock_116` ("which hiragana is 'ku'?") and
  `q_foundations_hiragana_k_row_ku_character` — the generated k-row copy is the
  one retired. The other 12 are duplicate `mock_*` vocab/particle/number pairs
  (e.g. `mock_041`/`mock_224` "book", `mock_020`/`mock_155` topic-は).
- **Empty foundations lessons.** Many roadmap lessons have **zero** questions
  regardless of any retire: every hiragana row past s-row (t/h/m/y/r/w/n,
  voiced, contracted, small-tsu), most katakana lessons, and all the unit
  wrapper lessons. This is a content gap the roadmap already exposes — flagged
  here but out of scope for a retire pass.

## Reference standard

The 15 rewritten Vowels questions in `foundation/hiragana.js`
(`..._vowels_004`–`008` recognition, `014`–`018` production, `019`–`023`
connection) are the **KEEP** benchmark: each names a layer in `cognitiveType`,
the production ones carry `audioText`, and the connection ones stage a real
rooftop moment with no romaji. Everything classified REWRITE should move toward
this shape for its own skill.

## Retire impact — lessons left thin if every RETIRE is removed

"Thin" = fewer than 3 owned questions after removal. Counts are
questions-per-lesson (a question counts for each lesson it lists).

**Already thin before any retire (content gap, not caused by retiring):**

| Lesson | before → after |
|---|---|
| `foundations-pronunciation-mora` | 2 → 0 |
| `foundations-hiragana-n-row` | 1 → 1 |
| `foundations-hiragana-m-row` | 1 → 1 |
| `foundations-katakana-m-y` | 1 → 1 |
| `foundations-pronunciation-small-tsu` | 1 → 1 |
| `foundations-pronunciation-long-vowels` | 1 → 1 |
| `foundations-pronunciation-syllabic-n` | 1 → 1 |
| `foundations-katakana-vowels-k` | 2 → 2 |
| `foundations-katakana-s-t` | 2 → 2 |

Only `foundations-pronunciation-mora` is pushed to **0** by a retire (both its
questions are mora-counting, both RETIRE). The rest were already below 3 with or
without the retire pass.

**Healthy lessons that drop but stay usable (≥7):** `lesson-basic-pronunciation`
5→3, `lesson-daily-activities` 10→7, `lesson-na-adjectives` 10→7, and a dozen
others at 8–9. No roadmap lesson in the main Japanese Foundations spine
(`lesson-*`) falls below 3 from the retire pass.

**Takeaway:** retiring all 47 does not gut any real lesson except the
pronunciation-mora lesson, which is already a 2-question stub. The thinness
problem in Foundations is pre-existing empty content, not the retire list.

---
## Summary table (per file)

| File | Strand | Total | KEEP | REWRITE | RETIRE | rec / prod / conn | No-lesson |
|---|---|---:|---:|---:|---:|---|---:|
| `foundation/hiragana.js` | Foundation | 50 | 15 | 24 | 11 | 40 / 5 / 5 | 0 |
| `foundation/katakana.js` | Foundation | 5 | 0 | 5 | 0 | 5 / 0 / 0 | 0 |
| `foundation/basic.js` | Foundation | 5 | 0 | 3 | 2 | 5 / 0 / 0 | 0 |
| `grammar/basic-sentence-structure.js` | Grammar | 10 | 0 | 8 | 2 | 7 / 3 / 0 | 0 |
| `vocabulary/basic-nouns.js` | Vocabulary | 10 | 0 | 8 | 2 | 10 / 0 / 0 | 0 |
| `vocabulary/people-school.js` | Vocabulary | 10 | 0 | 9 | 1 | 10 / 0 / 0 | 0 |
| `vocabulary/animals.js` | Vocabulary | 10 | 0 | 9 | 1 | 10 / 0 / 0 | 0 |
| `vocabulary/family.js` | Vocabulary | 10 | 0 | 10 | 0 | 10 / 0 / 0 | 0 |
| `vocabulary/food-drinks.js` | Vocabulary | 10 | 0 | 9 | 1 | 10 / 0 / 0 | 0 |
| `vocabulary/transportation.js` | Vocabulary | 10 | 0 | 9 | 1 | 10 / 0 / 0 | 0 |
| `vocabulary/places.js` | Vocabulary | 10 | 0 | 10 | 0 | 10 / 0 / 0 | 0 |
| `vocabulary/daily-activities.js` | Vocabulary | 10 | 0 | 7 | 3 | 10 / 0 / 0 | 0 |
| `conversation/daily.js` | Conversation | 10 | 0 | 10 | 0 | 4 / 6 / 0 | 0 |
| `vocabulary/basic-counting.js` | Vocabulary | 10 | 0 | 8 | 2 | 10 / 0 / 0 | 0 |
| `vocabulary/weekdays.js` | Vocabulary | 10 | 0 | 10 | 0 | 7 / 3 / 0 | 10 |
| `conversation/asking-time.js` | Conversation | 10 | 0 | 9 | 1 | 4 / 6 / 0 | 10 |
| `particles/topic-wa.js` | Particles | 10 | 0 | 8 | 2 | 2 / 8 / 0 | 0 |
| `particles/subject-ga.js` | Particles | 10 | 0 | 9 | 1 | 3 / 7 / 0 | 0 |
| `particles/object-wo.js` | Particles | 10 | 0 | 10 | 0 | 1 / 9 / 0 | 0 |
| `particles/destination-ni.js` | Particles | 10 | 0 | 8 | 2 | 1 / 9 / 0 | 0 |
| `particles/location-de.js` | Particles | 10 | 0 | 9 | 1 | 2 / 8 / 0 | 0 |
| `particles/noun-links.js` | Particles | 10 | 0 | 8 | 2 | 3 / 7 / 0 | 0 |
| `particles/advanced.js` | Particles | 5 | 0 | 4 | 1 | 4 / 1 / 0 | 5 |
| `verbs/present-polite.js` | Verbs | 10 | 0 | 10 | 0 | 3 / 7 / 0 | 0 |
| `verbs/past-polite.js` | Verbs | 10 | 0 | 10 | 0 | 2 / 8 / 0 | 0 |
| `verbs/negative-polite.js` | Verbs | 10 | 0 | 10 | 0 | 3 / 7 / 0 | 0 |
| `verbs/te-form.js` | Verbs | 10 | 0 | 10 | 0 | 2 / 8 / 0 | 0 |
| `verbs/advanced-forms.js` | Verbs | 9 | 0 | 9 | 0 | 4 / 5 / 0 | 9 |
| `adjectives/core.js` | Adjectives | 11 | 0 | 9 | 2 | 11 / 0 / 0 | 0 |
| `adjectives/weather.js` | Adjectives | 10 | 0 | 8 | 2 | 8 / 2 / 0 | 0 |
| `adjectives/na.js` | Adjectives | 10 | 0 | 7 | 3 | 9 / 1 / 0 | 0 |
| `grammar/questions.js` | Grammar | 10 | 0 | 9 | 1 | 7 / 3 / 0 | 0 |
| `grammar/likes-dislikes.js` | Grammar | 10 | 0 | 10 | 0 | 3 / 7 / 0 | 0 |
| `grammar/wants-desires.js` | Grammar | 10 | 0 | 9 | 1 | 5 / 5 / 0 | 0 |
| `grammar/comparison-conditionals.js` | Grammar | 5 | 0 | 4 | 1 | 1 / 4 / 0 | 5 |
| `grammar/clauses-uncertainty.js` | Grammar | 5 | 0 | 4 | 1 | 2 / 3 / 0 | 5 |
| `reading/word-recognition.js` | Reading | 10 | 0 | 10 | 0 | 0 / 0 / 10 | 0 |
| `reading/sentence-reading.js` | Reading | 10 | 0 | 10 | 0 | 0 / 0 / 10 | 0 |
| `reading/context-understanding.js` | Reading | 11 | 0 | 11 | 0 | 0 / 0 / 11 | 0 |
| **TOTAL** | — | **406** | **15** | **344** | **47** | **238 / 132 / 36** | **44** |

---

## Per-question list

Format: **CLASS** `id` [layer/type/flags] — reason, then the prompt.

### `foundation/hiragana.js`  (kana.hiragana, 50 questions)

- **REWRITE** `mock_101` [recognition/multiple_choice] — Legacy untagged recognition; keep one direction per kana, tag cognitiveType, trim the rest to 'keep few'.  
  _Which hiragana represents the sound 'a'?_
- **REWRITE** `mock_115` [recognition/multiple_choice] — Legacy untagged recognition; keep one direction per kana, tag cognitiveType, trim the rest to 'keep few'.  
  _Which hiragana represents the sound 'i'?_
- **REWRITE** `mock_116` [recognition/multiple_choice] — Legacy untagged recognition; keep one direction per kana, tag cognitiveType, trim the rest to 'keep few'.  
  _Which hiragana represents the sound 'ku'?_
- **REWRITE** `mock_117` [recognition/multiple_choice] — Legacy untagged recognition; keep one direction per kana, tag cognitiveType, trim the rest to 'keep few'.  
  _Which hiragana represents the sound 'ne'?_
- **REWRITE** `mock_118` [recognition/multiple_choice] — Legacy untagged recognition; keep one direction per kana, tag cognitiveType, trim the rest to 'keep few'.  
  _Which hiragana represents the sound 'mo'?_
- **KEEP** `q_foundations_hiragana_vowels_004` [recognition/multiple_choice] — Reference-standard rewritten Vowels question; rehearses a real moment, tagged by layer.  
  _What sound does あ represent?_
- **KEEP** `q_foundations_hiragana_vowels_005` [recognition/multiple_choice] — Reference-standard rewritten Vowels question; rehearses a real moment, tagged by layer.  
  _What sound does い represent?_
- **KEEP** `q_foundations_hiragana_vowels_006` [recognition/multiple_choice] — Reference-standard rewritten Vowels question; rehearses a real moment, tagged by layer.  
  _What sound does う represent?_
- **KEEP** `q_foundations_hiragana_vowels_007` [recognition/multiple_choice] — Reference-standard rewritten Vowels question; rehearses a real moment, tagged by layer.  
  _What sound does え represent?_
- **KEEP** `q_foundations_hiragana_vowels_008` [recognition/multiple_choice] — Reference-standard rewritten Vowels question; rehearses a real moment, tagged by layer.  
  _What sound does お represent?_
- **KEEP** `q_foundations_hiragana_vowels_014` [production/multiple_choice] — Reference-standard rewritten Vowels question; rehearses a real moment, tagged by layer.  
  _Which kana did you hear?_
- **KEEP** `q_foundations_hiragana_vowels_015` [production/multiple_choice] — Reference-standard rewritten Vowels question; rehearses a real moment, tagged by layer.  
  _Which kana did you hear?_
- **KEEP** `q_foundations_hiragana_vowels_016` [production/multiple_choice] — Reference-standard rewritten Vowels question; rehearses a real moment, tagged by layer.  
  _Which kana did you hear?_
- **KEEP** `q_foundations_hiragana_vowels_017` [production/multiple_choice] — Reference-standard rewritten Vowels question; rehearses a real moment, tagged by layer.  
  _Which kana did you hear?_
- **KEEP** `q_foundations_hiragana_vowels_018` [production/multiple_choice] — Reference-standard rewritten Vowels question; rehearses a real moment, tagged by layer.  
  _Which kana did you hear?_
- **KEEP** `q_foundations_hiragana_vowels_019` [connection/multiple_choice] — Reference-standard rewritten Vowels question; rehearses a real moment, tagged by layer.  
  _Grandma looks at the clear evening sky and names its colour. What does she say?_
- **KEEP** `q_foundations_hiragana_vowels_020` [connection/multiple_choice] — Reference-standard rewritten Vowels question; rehearses a real moment, tagged by layer.  
  _Hana's balloon floats high over her head. She points and calls out one word. Whi_
- **KEEP** `q_foundations_hiragana_vowels_021` [connection/multiple_choice] — Reference-standard rewritten Vowels question; rehearses a real moment, tagged by layer.  
  _Hana hears あお. What is it describing?_
- **KEEP** `q_foundations_hiragana_vowels_022` [connection/multiple_choice] — Reference-standard rewritten Vowels question; rehearses a real moment, tagged by layer.  
  _Someone says うえ and points. Where should you look?_
- **KEEP** `q_foundations_hiragana_vowels_023` [connection/multiple_choice] — Reference-standard rewritten Vowels question; rehearses a real moment, tagged by layer.  
  _Grandma signs Hana's birthday card with one word for what she feels. Which word?_
- **REWRITE** `q_foundations_hiragana_k_row_ka_character` [recognition/multiple_choice] — Legacy untagged recognition; keep one direction per kana, tag cognitiveType, trim the rest to 'keep few'.  
  _Which hiragana represents the sound 'ka'?_
- **REWRITE** `q_foundations_hiragana_k_row_ka_sound` [recognition/multiple_choice] — Legacy untagged recognition; keep one direction per kana, tag cognitiveType, trim the rest to 'keep few'.  
  _What sound does か represent?_
- **RETIRE** `q_foundations_hiragana_k_row_ka_pair` [recognition/multiple_choice] — Redundant 'character = sound pair' recognition drill; third direction on the same kana.  
  _Which Hiragana and sound pair is correct for か?_
- **REWRITE** `q_foundations_hiragana_k_row_ki_character` [recognition/multiple_choice] — Legacy untagged recognition; keep one direction per kana, tag cognitiveType, trim the rest to 'keep few'.  
  _Which hiragana represents the sound 'ki'?_
- **REWRITE** `q_foundations_hiragana_k_row_ki_sound` [recognition/multiple_choice] — Legacy untagged recognition; keep one direction per kana, tag cognitiveType, trim the rest to 'keep few'.  
  _What sound does き represent?_
- **RETIRE** `q_foundations_hiragana_k_row_ki_pair` [recognition/multiple_choice] — Redundant 'character = sound pair' recognition drill; third direction on the same kana.  
  _Which Hiragana and sound pair is correct for き?_
- **RETIRE** `q_foundations_hiragana_k_row_ku_character` [recognition/multiple_choice] — Duplicate of mock_116 (same prompt + answer).  
  _Which hiragana represents the sound 'ku'?_
- **REWRITE** `q_foundations_hiragana_k_row_ku_sound` [recognition/multiple_choice] — Legacy untagged recognition; keep one direction per kana, tag cognitiveType, trim the rest to 'keep few'.  
  _What sound does く represent?_
- **RETIRE** `q_foundations_hiragana_k_row_ku_pair` [recognition/multiple_choice] — Redundant 'character = sound pair' recognition drill; third direction on the same kana.  
  _Which Hiragana and sound pair is correct for く?_
- **REWRITE** `q_foundations_hiragana_k_row_ke_character` [recognition/multiple_choice] — Legacy untagged recognition; keep one direction per kana, tag cognitiveType, trim the rest to 'keep few'.  
  _Which hiragana represents the sound 'ke'?_
- **REWRITE** `q_foundations_hiragana_k_row_ke_sound` [recognition/multiple_choice] — Legacy untagged recognition; keep one direction per kana, tag cognitiveType, trim the rest to 'keep few'.  
  _What sound does け represent?_
- **RETIRE** `q_foundations_hiragana_k_row_ke_pair` [recognition/multiple_choice] — Redundant 'character = sound pair' recognition drill; third direction on the same kana.  
  _Which Hiragana and sound pair is correct for け?_
- **REWRITE** `q_foundations_hiragana_k_row_ko_character` [recognition/multiple_choice] — Legacy untagged recognition; keep one direction per kana, tag cognitiveType, trim the rest to 'keep few'.  
  _Which hiragana represents the sound 'ko'?_
- **REWRITE** `q_foundations_hiragana_k_row_ko_sound` [recognition/multiple_choice] — Legacy untagged recognition; keep one direction per kana, tag cognitiveType, trim the rest to 'keep few'.  
  _What sound does こ represent?_
- **RETIRE** `q_foundations_hiragana_k_row_ko_pair` [recognition/multiple_choice] — Redundant 'character = sound pair' recognition drill; third direction on the same kana.  
  _Which Hiragana and sound pair is correct for こ?_
- **REWRITE** `q_foundations_hiragana_s_row_sa_character` [recognition/multiple_choice] — Legacy untagged recognition; keep one direction per kana, tag cognitiveType, trim the rest to 'keep few'.  
  _Which hiragana represents the sound 'sa'?_
- **REWRITE** `q_foundations_hiragana_s_row_sa_sound` [recognition/multiple_choice] — Legacy untagged recognition; keep one direction per kana, tag cognitiveType, trim the rest to 'keep few'.  
  _What sound does さ represent?_
- **RETIRE** `q_foundations_hiragana_s_row_sa_pair` [recognition/multiple_choice] — Redundant 'character = sound pair' recognition drill; third direction on the same kana.  
  _Which Hiragana and sound pair is correct for さ?_
- **REWRITE** `q_foundations_hiragana_s_row_shi_character` [recognition/multiple_choice] — Legacy untagged recognition; keep one direction per kana, tag cognitiveType, trim the rest to 'keep few'.  
  _Which hiragana represents the sound 'shi'?_
- **REWRITE** `q_foundations_hiragana_s_row_shi_sound` [recognition/multiple_choice] — Legacy untagged recognition; keep one direction per kana, tag cognitiveType, trim the rest to 'keep few'.  
  _What sound does し represent?_
- **RETIRE** `q_foundations_hiragana_s_row_shi_pair` [recognition/multiple_choice] — Redundant 'character = sound pair' recognition drill; third direction on the same kana.  
  _Which Hiragana and sound pair is correct for し?_
- **REWRITE** `q_foundations_hiragana_s_row_su_character` [recognition/multiple_choice] — Legacy untagged recognition; keep one direction per kana, tag cognitiveType, trim the rest to 'keep few'.  
  _Which hiragana represents the sound 'su'?_
- **REWRITE** `q_foundations_hiragana_s_row_su_sound` [recognition/multiple_choice] — Legacy untagged recognition; keep one direction per kana, tag cognitiveType, trim the rest to 'keep few'.  
  _What sound does す represent?_
- **RETIRE** `q_foundations_hiragana_s_row_su_pair` [recognition/multiple_choice] — Redundant 'character = sound pair' recognition drill; third direction on the same kana.  
  _Which Hiragana and sound pair is correct for す?_
- **REWRITE** `q_foundations_hiragana_s_row_se_character` [recognition/multiple_choice] — Legacy untagged recognition; keep one direction per kana, tag cognitiveType, trim the rest to 'keep few'.  
  _Which hiragana represents the sound 'se'?_
- **REWRITE** `q_foundations_hiragana_s_row_se_sound` [recognition/multiple_choice] — Legacy untagged recognition; keep one direction per kana, tag cognitiveType, trim the rest to 'keep few'.  
  _What sound does せ represent?_
- **RETIRE** `q_foundations_hiragana_s_row_se_pair` [recognition/multiple_choice] — Redundant 'character = sound pair' recognition drill; third direction on the same kana.  
  _Which Hiragana and sound pair is correct for せ?_
- **REWRITE** `q_foundations_hiragana_s_row_so_character` [recognition/multiple_choice] — Legacy untagged recognition; keep one direction per kana, tag cognitiveType, trim the rest to 'keep few'.  
  _Which hiragana represents the sound 'so'?_
- **REWRITE** `q_foundations_hiragana_s_row_so_sound` [recognition/multiple_choice] — Legacy untagged recognition; keep one direction per kana, tag cognitiveType, trim the rest to 'keep few'.  
  _What sound does そ represent?_
- **RETIRE** `q_foundations_hiragana_s_row_so_pair` [recognition/multiple_choice] — Redundant 'character = sound pair' recognition drill; third direction on the same kana.  
  _Which Hiragana and sound pair is correct for そ?_

### `foundation/katakana.js`  (kana.katakana, 5 questions)

- **REWRITE** `mock_102` [recognition/multiple_choice] — Pure katakana recognition; tag as recognition, keep few, add a 'where you'd actually read it' moment.  
  _Which katakana represents the sound 'ka'?_
- **REWRITE** `mock_119` [recognition/multiple_choice] — Pure katakana recognition; tag as recognition, keep few, add a 'where you'd actually read it' moment.  
  _Which katakana represents the sound 'a'?_
- **REWRITE** `mock_120` [recognition/multiple_choice] — Pure katakana recognition; tag as recognition, keep few, add a 'where you'd actually read it' moment.  
  _Which katakana represents the sound 'su'?_
- **REWRITE** `mock_121` [recognition/multiple_choice] — Pure katakana recognition; tag as recognition, keep few, add a 'where you'd actually read it' moment.  
  _Which katakana represents the sound 'to'?_
- **REWRITE** `mock_122` [recognition/multiple_choice] — Pure katakana recognition; tag as recognition, keep few, add a 'where you'd actually read it' moment.  
  _Which katakana represents the sound 'mi'?_

### `foundation/basic.js`  (pronunciation.basic, 5 questions)

- **RETIRE** `mock_103` [recognition/multiple_choice] — Metalinguistic/theory question (tests grammar terms, not a real-world moment). Fails Q3.  
  _How many mora are in the word がっこう?_
- **RETIRE** `mock_123` [recognition/multiple_choice] — Metalinguistic/theory question (tests grammar terms, not a real-world moment). Fails Q3.  
  _How many mora are in こんにちは?_
- **REWRITE** `mock_124` [recognition/translation_choice] — Mora-counting is metalinguistic; reframe as hearing/rhythm against a real word.  
  _What does a small っ usually indicate?_
- **REWRITE** `mock_125` [recognition/multiple_choice] — Mora-counting is metalinguistic; reframe as hearing/rhythm against a real word.  
  _Which word has a long vowel sound?_
- **REWRITE** `mock_126` [recognition/multiple_choice] — Mora-counting is metalinguistic; reframe as hearing/rhythm against a real word.  
  _In せんせい, what sound does ん represent?_

### `grammar/basic-sentence-structure.js`  (grammar.basic_sentence_structure, 10 questions)

- **RETIRE** `mock_104` [recognition/multiple_choice] — Metalinguistic/theory question (tests grammar terms, not a real-world moment). Fails Q3.  
  _What is the basic word order of a simple Japanese sentence?_
- **RETIRE** `mock_326` [recognition/multiple_choice] — Metalinguistic/theory question (tests grammar terms, not a real-world moment). Fails Q3.  
  _In わたしはみずをのみます, which word is the verb?_
- **REWRITE** `mock_327` [production/fill_in_blank] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Translate: 'I drink water.'_
- **REWRITE** `mock_328` [recognition/multiple_choice] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _Where does the main verb usually appear in a simple Japanese sentence?_
- **REWRITE** `mock_329` [recognition/multiple_choice] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _Which sentence means 'The student reads a book'?_
- **REWRITE** `mock_330` [recognition/multiple_choice] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _What is the function of particles in Japanese sentences?_
- **REWRITE** `mock_331` [production/fill_in_blank] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Translate: 'This is a book.'_
- **REWRITE** `mock_332` [recognition/multiple_choice] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _Which sentence means 'I am a teacher'?_
- **REWRITE** `mock_333` [recognition/translation_choice] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _What does です do in a simple noun sentence?_
- **REWRITE** `mock_334` [production/fill_in_blank] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Translate: 'I go to school.'_

### `vocabulary/basic-nouns.js`  (vocab.basic_nouns, 10 questions)

- **REWRITE** `mock_001` [recognition/translation_choice] — Vocab recall ('word for X'/'what does X mean'); needed content but test-the-symbol. Reframe toward a daily-life moment (connection).  
  _What is the Japanese word for 'water'?_
- **REWRITE** `mock_041` [recognition/translation_choice] — Vocab recall ('word for X'/'what does X mean'); needed content but test-the-symbol. Reframe toward a daily-life moment (connection).  
  _What is the Japanese word for 'book'?_
- **REWRITE** `mock_056` [recognition/translation_choice] — Vocab recall ('word for X'/'what does X mean'); needed content but test-the-symbol. Reframe toward a daily-life moment (connection).  
  _What is the Japanese word for 'money'?_
- **RETIRE** `mock_082` [recognition/multiple_choice] — Metalinguistic/theory question (tests grammar terms, not a real-world moment). Fails Q3.  
  _What is the meaning of すこし?_
- **RETIRE** `mock_224` [recognition/translation_choice] — Duplicate of mock_041 (same prompt + answer).  
  _What is the Japanese word for 'book'?_
- **REWRITE** `mock_225` [recognition/translation_choice] — Vocab recall ('word for X'/'what does X mean'); needed content but test-the-symbol. Reframe toward a daily-life moment (connection).  
  _What does かばん mean?_
- **REWRITE** `mock_226` [recognition/translation_choice] — Vocab recall ('word for X'/'what does X mean'); needed content but test-the-symbol. Reframe toward a daily-life moment (connection).  
  _What is the Japanese word for 'chair'?_
- **REWRITE** `mock_227` [recognition/translation_choice] — Vocab recall ('word for X'/'what does X mean'); needed content but test-the-symbol. Reframe toward a daily-life moment (connection).  
  _What does つくえ mean?_
- **REWRITE** `mock_228` [recognition/translation_choice] — Vocab recall ('word for X'/'what does X mean'); needed content but test-the-symbol. Reframe toward a daily-life moment (connection).  
  _What is the Japanese word for 'umbrella'?_
- **REWRITE** `mock_229` [recognition/translation_choice] — Vocab recall ('word for X'/'what does X mean'); needed content but test-the-symbol. Reframe toward a daily-life moment (connection).  
  _What does いえ mean?_

### `vocabulary/people-school.js`  (vocab.people_school, 10 questions)

- **REWRITE** `mock_019` [recognition/translation_choice] — Vocab recall ('word for X'/'what does X mean'); needed content but test-the-symbol. Reframe toward a daily-life moment (connection).  
  _What is the Japanese word for 'teacher'?_
- **REWRITE** `mock_039` [recognition/translation_choice] — Vocab recall ('word for X'/'what does X mean'); needed content but test-the-symbol. Reframe toward a daily-life moment (connection).  
  _What is the Japanese word for 'student'?_
- **RETIRE** `mock_230` [recognition/translation_choice] — Duplicate of mock_039 (same prompt + answer).  
  _What is the Japanese word for 'student'?_
- **REWRITE** `mock_231` [recognition/translation_choice] — Vocab recall ('word for X'/'what does X mean'); needed content but test-the-symbol. Reframe toward a daily-life moment (connection).  
  _What does ともだち mean?_
- **REWRITE** `mock_232` [recognition/translation_choice] — Vocab recall ('word for X'/'what does X mean'); needed content but test-the-symbol. Reframe toward a daily-life moment (connection).  
  _What is the Japanese word for 'person'?_
- **REWRITE** `mock_233` [recognition/translation_choice] — Vocab recall ('word for X'/'what does X mean'); needed content but test-the-symbol. Reframe toward a daily-life moment (connection).  
  _What does クラス mean?_
- **REWRITE** `mock_234` [recognition/translation_choice] — Vocab recall ('word for X'/'what does X mean'); needed content but test-the-symbol. Reframe toward a daily-life moment (connection).  
  _What is the Japanese word for 'homework'?_
- **REWRITE** `mock_235` [recognition/translation_choice] — Vocab recall ('word for X'/'what does X mean'); needed content but test-the-symbol. Reframe toward a daily-life moment (connection).  
  _What does きょうしつ mean?_
- **REWRITE** `mock_236` [recognition/translation_choice] — Vocab recall ('word for X'/'what does X mean'); needed content but test-the-symbol. Reframe toward a daily-life moment (connection).  
  _What is the Japanese word for 'name'?_
- **REWRITE** `mock_237` [recognition/translation_choice] — Vocab recall ('word for X'/'what does X mean'); needed content but test-the-symbol. Reframe toward a daily-life moment (connection).  
  _What does せいと mean?_

### `vocabulary/animals.js`  (vocab.animals, 10 questions)

- **REWRITE** `mock_021` [recognition/translation_choice] — Vocab recall ('word for X'/'what does X mean'); needed content but test-the-symbol. Reframe toward a daily-life moment (connection).  
  _What is the Japanese word for 'cat'?_
- **REWRITE** `mock_053` [recognition/translation_choice] — Vocab recall ('word for X'/'what does X mean'); needed content but test-the-symbol. Reframe toward a daily-life moment (connection).  
  _What is the Japanese word for 'dog'?_
- **RETIRE** `mock_238` [recognition/translation_choice] — Duplicate of mock_053 (same prompt + answer).  
  _What is the Japanese word for 'dog'?_
- **REWRITE** `mock_239` [recognition/translation_choice] — Vocab recall ('word for X'/'what does X mean'); needed content but test-the-symbol. Reframe toward a daily-life moment (connection).  
  _What does とり mean?_
- **REWRITE** `mock_240` [recognition/translation_choice] — Vocab recall ('word for X'/'what does X mean'); needed content but test-the-symbol. Reframe toward a daily-life moment (connection).  
  _What is the Japanese word for 'fish'?_
- **REWRITE** `mock_241` [recognition/translation_choice] — Vocab recall ('word for X'/'what does X mean'); needed content but test-the-symbol. Reframe toward a daily-life moment (connection).  
  _What does うま mean?_
- **REWRITE** `mock_242` [recognition/translation_choice] — Vocab recall ('word for X'/'what does X mean'); needed content but test-the-symbol. Reframe toward a daily-life moment (connection).  
  _What is the Japanese word for 'cow'?_
- **REWRITE** `mock_243` [recognition/translation_choice] — Vocab recall ('word for X'/'what does X mean'); needed content but test-the-symbol. Reframe toward a daily-life moment (connection).  
  _What does ねずみ mean?_
- **REWRITE** `mock_244` [recognition/translation_choice] — Vocab recall ('word for X'/'what does X mean'); needed content but test-the-symbol. Reframe toward a daily-life moment (connection).  
  _What is the Japanese word for 'rabbit'?_
- **REWRITE** `mock_245` [recognition/translation_choice] — Vocab recall ('word for X'/'what does X mean'); needed content but test-the-symbol. Reframe toward a daily-life moment (connection).  
  _What does ぶた mean?_

### `vocabulary/family.js`  (vocab.family, 10 questions)

- **REWRITE** `mock_105` [recognition/translation_choice] — Vocab recall ('word for X'/'what does X mean'); needed content but test-the-symbol. Reframe toward a daily-life moment (connection).  
  _What is the Japanese word for 'mother' in a general/polite context?_
- **REWRITE** `mock_246` [recognition/translation_choice] — Vocab recall ('word for X'/'what does X mean'); needed content but test-the-symbol. Reframe toward a daily-life moment (connection).  
  _What is the Japanese word for 'father' in a general/polite context?_
- **REWRITE** `mock_247` [recognition/translation_choice] — Vocab recall ('word for X'/'what does X mean'); needed content but test-the-symbol. Reframe toward a daily-life moment (connection).  
  _What does あに mean?_
- **REWRITE** `mock_248` [recognition/translation_choice] — Vocab recall ('word for X'/'what does X mean'); needed content but test-the-symbol. Reframe toward a daily-life moment (connection).  
  _What is the Japanese word for 'older sister'?_
- **REWRITE** `mock_249` [recognition/translation_choice] — Vocab recall ('word for X'/'what does X mean'); needed content but test-the-symbol. Reframe toward a daily-life moment (connection).  
  _What does おとうと mean?_
- **REWRITE** `mock_250` [recognition/translation_choice] — Vocab recall ('word for X'/'what does X mean'); needed content but test-the-symbol. Reframe toward a daily-life moment (connection).  
  _What is the Japanese word for 'younger sister'?_
- **REWRITE** `mock_251` [recognition/translation_choice] — Vocab recall ('word for X'/'what does X mean'); needed content but test-the-symbol. Reframe toward a daily-life moment (connection).  
  _What does かぞく mean?_
- **REWRITE** `mock_252` [recognition/translation_choice] — Vocab recall ('word for X'/'what does X mean'); needed content but test-the-symbol. Reframe toward a daily-life moment (connection).  
  _What is the Japanese word for 'child'?_
- **REWRITE** `mock_253` [recognition/translation_choice] — Vocab recall ('word for X'/'what does X mean'); needed content but test-the-symbol. Reframe toward a daily-life moment (connection).  
  _What does りょうしん mean?_
- **REWRITE** `mock_254` [recognition/translation_choice] — Vocab recall ('word for X'/'what does X mean'); needed content but test-the-symbol. Reframe toward a daily-life moment (connection).  
  _What is the Japanese word for 'grandmother'?_

### `vocabulary/food-drinks.js`  (vocab.food_drinks, 10 questions)

- **REWRITE** `mock_015` [recognition/translation_choice] — Vocab recall ('word for X'/'what does X mean'); needed content but test-the-symbol. Reframe toward a daily-life moment (connection).  
  _What is the Japanese word for 'rice'?_
- **RETIRE** `mock_035` [recognition/translation_choice] — Duplicate of mock_240 (same prompt + answer).  
  _What is the Japanese word for 'fish'?_
- **REWRITE** `mock_051` [recognition/translation_choice] — Vocab recall ('word for X'/'what does X mean'); needed content but test-the-symbol. Reframe toward a daily-life moment (connection).  
  _What is the Japanese word for 'bread'?_
- **REWRITE** `mock_060` [recognition/translation_choice] — Vocab recall ('word for X'/'what does X mean'); needed content but test-the-symbol. Reframe toward a daily-life moment (connection).  
  _What is the Japanese word for 'water' (polite context)?_
- **REWRITE** `mock_255` [recognition/translation_choice] — Vocab recall ('word for X'/'what does X mean'); needed content but test-the-symbol. Reframe toward a daily-life moment (connection).  
  _What is the Japanese word for 'tea'?_
- **REWRITE** `mock_256` [recognition/translation_choice] — Vocab recall ('word for X'/'what does X mean'); needed content but test-the-symbol. Reframe toward a daily-life moment (connection).  
  _What does パン mean?_
- **REWRITE** `mock_257` [recognition/translation_choice] — Vocab recall ('word for X'/'what does X mean'); needed content but test-the-symbol. Reframe toward a daily-life moment (connection).  
  _What is the Japanese word for 'meat'?_
- **REWRITE** `mock_258` [recognition/translation_choice] — Vocab recall ('word for X'/'what does X mean'); needed content but test-the-symbol. Reframe toward a daily-life moment (connection).  
  _What does やさい mean?_
- **REWRITE** `mock_259` [recognition/translation_choice] — Vocab recall ('word for X'/'what does X mean'); needed content but test-the-symbol. Reframe toward a daily-life moment (connection).  
  _What is the Japanese word for 'fish' as food?_
- **REWRITE** `mock_260` [recognition/translation_choice] — Vocab recall ('word for X'/'what does X mean'); needed content but test-the-symbol. Reframe toward a daily-life moment (connection).  
  _What does ジュース mean?_

### `vocabulary/transportation.js`  (vocab.transportation, 10 questions)

- **REWRITE** `mock_008` [recognition/translation_choice] — Vocab recall ('word for X'/'what does X mean'); needed content but test-the-symbol. Reframe toward a daily-life moment (connection).  
  _What is the Japanese word for 'train station'?_
- **REWRITE** `mock_028` [recognition/translation_choice] — Vocab recall ('word for X'/'what does X mean'); needed content but test-the-symbol. Reframe toward a daily-life moment (connection).  
  _What is the Japanese word for 'airport'?_
- **REWRITE** `mock_048` [recognition/translation_choice] — Vocab recall ('word for X'/'what does X mean'); needed content but test-the-symbol. Reframe toward a daily-life moment (connection).  
  _What is the Japanese word for 'hotel'?_
- **REWRITE** `mock_058` [recognition/translation_choice] — Vocab recall ('word for X'/'what does X mean'); needed content but test-the-symbol. Reframe toward a daily-life moment (connection).  
  _What is the Japanese word for 'car'?_
- **RETIRE** `mock_261` [recognition/translation_choice] — Duplicate of mock_058 (same prompt + answer).  
  _What is the Japanese word for 'car'?_
- **REWRITE** `mock_262` [recognition/translation_choice] — Vocab recall ('word for X'/'what does X mean'); needed content but test-the-symbol. Reframe toward a daily-life moment (connection).  
  _What does バス mean?_
- **REWRITE** `mock_263` [recognition/translation_choice] — Vocab recall ('word for X'/'what does X mean'); needed content but test-the-symbol. Reframe toward a daily-life moment (connection).  
  _What is the Japanese word for 'bicycle'?_
- **REWRITE** `mock_264` [recognition/translation_choice] — Vocab recall ('word for X'/'what does X mean'); needed content but test-the-symbol. Reframe toward a daily-life moment (connection).  
  _What does ひこうき mean?_
- **REWRITE** `mock_265` [recognition/translation_choice] — Vocab recall ('word for X'/'what does X mean'); needed content but test-the-symbol. Reframe toward a daily-life moment (connection).  
  _What is the Japanese word for 'taxi'?_
- **REWRITE** `mock_266` [recognition/translation_choice] — Vocab recall ('word for X'/'what does X mean'); needed content but test-the-symbol. Reframe toward a daily-life moment (connection).  
  _What does ちかてつ mean?_

### `vocabulary/places.js`  (vocab.places, 10 questions)

- **REWRITE** `mock_106` [recognition/translation_choice] — Vocab recall ('word for X'/'what does X mean'); needed content but test-the-symbol. Reframe toward a daily-life moment (connection).  
  _What is the Japanese word for 'library'?_
- **REWRITE** `mock_267` [recognition/translation_choice] — Vocab recall ('word for X'/'what does X mean'); needed content but test-the-symbol. Reframe toward a daily-life moment (connection).  
  _What is the Japanese word for 'school'?_
- **REWRITE** `mock_268` [recognition/translation_choice] — Vocab recall ('word for X'/'what does X mean'); needed content but test-the-symbol. Reframe toward a daily-life moment (connection).  
  _What does びょういん mean?_
- **REWRITE** `mock_269` [recognition/translation_choice] — Vocab recall ('word for X'/'what does X mean'); needed content but test-the-symbol. Reframe toward a daily-life moment (connection).  
  _What is the Japanese word for 'store'?_
- **REWRITE** `mock_270` [recognition/translation_choice] — Vocab recall ('word for X'/'what does X mean'); needed content but test-the-symbol. Reframe toward a daily-life moment (connection).  
  _What does こうえん mean?_
- **REWRITE** `mock_271` [recognition/translation_choice] — Vocab recall ('word for X'/'what does X mean'); needed content but test-the-symbol. Reframe toward a daily-life moment (connection).  
  _What is the Japanese word for 'restaurant'?_
- **REWRITE** `mock_272` [recognition/translation_choice] — Vocab recall ('word for X'/'what does X mean'); needed content but test-the-symbol. Reframe toward a daily-life moment (connection).  
  _What does ぎんこう mean?_
- **REWRITE** `mock_273` [recognition/translation_choice] — Vocab recall ('word for X'/'what does X mean'); needed content but test-the-symbol. Reframe toward a daily-life moment (connection).  
  _What is the Japanese word for 'post office'?_
- **REWRITE** `mock_274` [recognition/translation_choice] — Vocab recall ('word for X'/'what does X mean'); needed content but test-the-symbol. Reframe toward a daily-life moment (connection).  
  _What does まち mean?_
- **REWRITE** `mock_275` [recognition/translation_choice] — Vocab recall ('word for X'/'what does X mean'); needed content but test-the-symbol. Reframe toward a daily-life moment (connection).  
  _What is the Japanese word for 'room'?_

### `vocabulary/daily-activities.js`  (vocab.daily_activities, 10 questions)

- **REWRITE** `mock_107` [recognition/translation_choice] — Vocab recall ('word for X'/'what does X mean'); needed content but test-the-symbol. Reframe toward a daily-life moment (connection).  
  _What does べんきょうします mean?_
- **REWRITE** `mock_276` [recognition/translation_choice] — Vocab recall ('word for X'/'what does X mean'); needed content but test-the-symbol. Reframe toward a daily-life moment (connection).  
  _What does ねます mean?_
- **RETIRE** `mock_277` [recognition/multiple_choice] — Metalinguistic/theory question (tests grammar terms, not a real-world moment). Fails Q3.  
  _What is the meaning of おきます?_
- **REWRITE** `mock_278` [recognition/translation_choice] — Vocab recall ('word for X'/'what does X mean'); needed content but test-the-symbol. Reframe toward a daily-life moment (connection).  
  _What does はたらきます mean?_
- **RETIRE** `mock_279` [recognition/multiple_choice] — Metalinguistic/theory question (tests grammar terms, not a real-world moment). Fails Q3.  
  _What is the meaning of かえります?_
- **REWRITE** `mock_280` [recognition/translation_choice] — Vocab recall ('word for X'/'what does X mean'); needed content but test-the-symbol. Reframe toward a daily-life moment (connection).  
  _What does みます mean?_
- **REWRITE** `mock_281` [recognition/translation_choice] — Vocab recall ('word for X'/'what does X mean'); needed content but test-the-symbol. Reframe toward a daily-life moment (connection).  
  _What does ききます mean?_
- **RETIRE** `mock_282` [recognition/multiple_choice] — Metalinguistic/theory question (tests grammar terms, not a real-world moment). Fails Q3.  
  _What is the meaning of かきます?_
- **REWRITE** `mock_283` [recognition/translation_choice] — Vocab recall ('word for X'/'what does X mean'); needed content but test-the-symbol. Reframe toward a daily-life moment (connection).  
  _What does よみます mean?_
- **REWRITE** `mock_284` [recognition/translation_choice] — Vocab recall ('word for X'/'what does X mean'); needed content but test-the-symbol. Reframe toward a daily-life moment (connection).  
  _What does あそびます mean?_

### `conversation/daily.js`  (greetings.daily, 10 questions)

- **REWRITE** `mock_002` [recognition/multiple_choice] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _Choose the correct greeting for the morning._
- **REWRITE** `mock_010` [recognition/translation_choice] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _What does こんにちは mean?_
- **REWRITE** `mock_022` [production/translation_choice] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _How do you say 'thank you' politely?_
- **REWRITE** `mock_030` [recognition/translation_choice] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _What does こんばんは mean?_
- **REWRITE** `mock_042` [production/translation_choice] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _How do you say 'good night' in Japanese?_
- **REWRITE** `mock_050` [recognition/translation_choice] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _What does さようなら mean?_
- **REWRITE** `mock_052` [production/translation_choice] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _How do you say 'good afternoon' in Japanese?_
- **REWRITE** `mock_057` [production/translation_choice] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _How do you say 'yes' in Japanese?_
- **REWRITE** `mock_324` [production/translation_choice] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _How do you say 'good evening' in Japanese?_
- **REWRITE** `mock_325` [production/translation_choice] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _How do you say 'see you tomorrow'?_

### `vocabulary/basic-counting.js`  (numbers.basic_counting, 10 questions)

- **REWRITE** `mock_004` [recognition/multiple_choice] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _What is the Japanese number for 3?_
- **REWRITE** `mock_024` [recognition/multiple_choice] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _What is the Japanese number for 8?_
- **REWRITE** `mock_044` [recognition/multiple_choice] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _What is the Japanese number for 15?_
- **REWRITE** `mock_054` [recognition/multiple_choice] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _What is the Japanese number for 10?_
- **REWRITE** `mock_285` [recognition/multiple_choice] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _What is the Japanese number for 4?_
- **REWRITE** `mock_286` [recognition/multiple_choice] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _What is the Japanese number for 5?_
- **REWRITE** `mock_287` [recognition/translation_choice] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _What does なな mean?_
- **RETIRE** `mock_288` [recognition/multiple_choice] — Duplicate of mock_024 (same prompt + answer).  
  _What is the Japanese number for 8?_
- **REWRITE** `mock_289` [recognition/translation_choice] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _What does きゅう mean?_
- **RETIRE** `mock_290` [recognition/multiple_choice] — Duplicate of mock_054 (same prompt + answer).  
  _What is the Japanese number for 10?_

### `vocabulary/weekdays.js`  (time.weekdays, 10 questions)

- **REWRITE** `mock_011` [production/translation_choice/no-lesson] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _How do you say 'Monday' in Japanese?_
- **REWRITE** `mock_031` [production/translation_choice/no-lesson] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _How do you say 'Sunday' in Japanese?_
- **REWRITE** `mock_033` [production/fill_in_blank/no-lesson] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Translate 'today' into Japanese._
- **REWRITE** `mock_291` [recognition/translation_choice/no-lesson] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _What is the Japanese word for 'Tuesday'?_
- **REWRITE** `mock_292` [recognition/translation_choice/no-lesson] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _What does すいようび mean?_
- **REWRITE** `mock_293` [recognition/translation_choice/no-lesson] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _What is the Japanese word for 'Thursday'?_
- **REWRITE** `mock_294` [recognition/translation_choice/no-lesson] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _What does きんようび mean?_
- **REWRITE** `mock_295` [recognition/translation_choice/no-lesson] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _What is the Japanese word for 'Saturday'?_
- **REWRITE** `mock_296` [recognition/translation_choice/no-lesson] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _What does にちようび mean?_
- **REWRITE** `mock_297` [recognition/translation_choice/no-lesson] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _What does あさ mean?_

### `conversation/asking-time.js`  (time.asking_time, 10 questions)

- **REWRITE** `mock_013` [production/fill_in_blank/no-lesson] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Translate 'What time is it?' into Japanese._
- **REWRITE** `mock_315` [production/multiple_choice/no-lesson] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _How do you ask 'What time is it?'_
- **REWRITE** `mock_316` [recognition/translation_choice/no-lesson] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _What does いま mean?_
- **REWRITE** `mock_317` [production/fill_in_blank/no-lesson] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Translate: 'It is three o'clock.'_
- **REWRITE** `mock_318` [recognition/translation_choice/no-lesson] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _What does はん mean in time expressions like さんじはん?_
- **REWRITE** `mock_319` [production/fill_in_blank/no-lesson] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Translate: 'It is seven thirty.'_
- **REWRITE** `mock_320` [production/multiple_choice/no-lesson] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _How do you ask 'What time do you sleep?'_
- **RETIRE** `mock_321` [recognition/multiple_choice/no-lesson] — Metalinguistic/theory question (tests grammar terms, not a real-world moment). Fails Q3.  
  _Which particle marks the time an action happens?_
- **REWRITE** `mock_322` [production/fill_in_blank/no-lesson] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Translate: 'I wake up at six o'clock.'_
- **REWRITE** `mock_323` [recognition/translation_choice/no-lesson] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _What does ごぜん mean?_

### `particles/topic-wa.js`  (particles.topic_wa, 10 questions)

- **RETIRE** `mock_003` [recognition/multiple_choice] — Metalinguistic/theory question (tests grammar terms, not a real-world moment). Fails Q3.  
  _Which particle marks the topic of a sentence?_
- **REWRITE** `mock_020` [production/multiple_choice] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Choose the correct particle: わたし___がくせいです。_
- **RETIRE** `mock_155` [production/multiple_choice] — Duplicate of mock_020 (same prompt + answer).  
  _Choose the correct particle: わたし___がくせいです。_
- **REWRITE** `mock_156` [production/multiple_choice] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Choose the correct particle: これはほんです。 What is は doing?_
- **REWRITE** `mock_157` [production/multiple_choice] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Choose the correct particle: きょう___あついです。_
- **REWRITE** `mock_158` [production/fill_in_blank] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Translate: 'As for tomorrow, I will study.'_
- **REWRITE** `mock_159` [production/multiple_choice] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Choose the correct particle: たなかさん___せんせいです。_
- **REWRITE** `mock_160` [recognition/multiple_choice] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _In わたしはすしをたべます, which word is marked as the topic?_
- **REWRITE** `mock_161` [production/multiple_choice] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Choose the correct particle: これ___なんですか。_
- **REWRITE** `mock_162` [production/multiple_choice] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Choose the correct particle: わたし___にほんごをべんきょうします。_

### `particles/subject-ga.js`  (particles.subject_ga, 10 questions)

- **RETIRE** `mock_072` [recognition/multiple_choice] — Metalinguistic/theory question (tests grammar terms, not a real-world moment). Fails Q3.  
  _What particle indicates location where something exists?_
- **REWRITE** `mock_073` [production/fill_in_blank] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Translate 'There is a book on the table.'_
- **REWRITE** `mock_092` [recognition/multiple_choice] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _What is the difference between いる and ある?_
- **REWRITE** `mock_163` [production/multiple_choice] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Choose the correct particle: ねこ___います。_
- **REWRITE** `mock_164` [production/multiple_choice] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Choose the correct particle: みず___ほしいです。_
- **REWRITE** `mock_165` [production/multiple_choice] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Choose the correct particle: ねこ___すきです。_
- **REWRITE** `mock_166` [recognition/multiple_choice] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _In だれがきますか, what does が mark?_
- **REWRITE** `mock_167` [production/multiple_choice] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Choose the correct particle: いぬ___いますか。_
- **REWRITE** `mock_168` [production/multiple_choice] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Choose the correct particle: あめ___ふります。_
- **REWRITE** `mock_169` [production/fill_in_blank] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Translate: 'There is a book.'_

### `particles/object-wo.js`  (particles.object_wo, 10 questions)

- **REWRITE** `mock_023` [production/multiple_choice] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Choose the correct particle: パン___たべます。_
- **REWRITE** `mock_068` [production/multiple_choice] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Choose correct particle: ほん___よみます。_
- **REWRITE** `mock_170` [production/multiple_choice] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Choose the correct particle: すし___たべます。_
- **REWRITE** `mock_171` [production/multiple_choice] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Choose the correct particle: みず___のみます。_
- **REWRITE** `mock_172` [production/multiple_choice] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Choose the correct particle: にほんご___べんきょうします。_
- **REWRITE** `mock_173` [recognition/multiple_choice] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _In パンをかいます, what is being bought?_
- **REWRITE** `mock_174` [production/fill_in_blank] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Translate: 'I read a book.'_
- **REWRITE** `mock_175` [production/multiple_choice] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Choose the correct particle: てがみ___かきます。_
- **REWRITE** `mock_176` [production/multiple_choice] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Choose the correct particle: おんがく___ききます。_
- **REWRITE** `mock_177` [production/multiple_choice] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Choose the correct particle: えいが___みます。_

### `particles/destination-ni.js`  (particles.destination_ni, 10 questions)

- **REWRITE** `mock_007` [production/multiple_choice] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Choose the correct particle: がっこう___いきます。_
- **REWRITE** `mock_027` [production/multiple_choice] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Choose the correct particle: うち___かえります。_
- **REWRITE** `mock_040` [production/multiple_choice] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Choose the correct particle: にほん___いきたいです。_
- **REWRITE** `mock_061` [production/multiple_choice] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Choose the correct particle: いえ___かえります。_
- **RETIRE** `mock_178` [production/multiple_choice] — Duplicate of mock_007 (same prompt + answer).  
  _Choose the correct particle: がっこう___いきます。_
- **REWRITE** `mock_179` [production/multiple_choice] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Choose the correct particle: えき___いきます。_
- **REWRITE** `mock_180` [production/fill_in_blank] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Translate: 'I go to the library.'_
- **RETIRE** `mock_181` [production/multiple_choice] — Duplicate of mock_027 (same prompt + answer).  
  _Choose the correct particle: うち___かえります。_
- **REWRITE** `mock_182` [production/multiple_choice] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Choose the correct particle: げつようび___がっこうにいきます。_
- **REWRITE** `mock_183` [recognition/multiple_choice] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _In とうきょうにいきました, what does に mark?_

### `particles/location-de.js`  (particles.location_de, 10 questions)

- **REWRITE** `mock_047` [production/multiple_choice] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Choose the correct particle: スーパー___かいものします。_
- **REWRITE** `mock_062` [production/fill_in_blank] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Translate 'I study at home.'_
- **RETIRE** `mock_064` [recognition/multiple_choice] — Metalinguistic/theory question (tests grammar terms, not a real-world moment). Fails Q3.  
  _What particle is used for means of transportation?_
- **REWRITE** `mock_184` [production/multiple_choice] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Choose the correct particle: としょかん___べんきょうします。_
- **REWRITE** `mock_185` [production/multiple_choice] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Choose the correct particle: でんしゃ___いきます。_
- **REWRITE** `mock_186` [production/fill_in_blank] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Translate: 'I eat at school.'_
- **REWRITE** `mock_187` [production/multiple_choice] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Choose the correct particle: はし___たべます。_
- **REWRITE** `mock_188` [recognition/multiple_choice] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _In へやでねます, what does で mark?_
- **REWRITE** `mock_189` [production/multiple_choice] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Choose the correct particle: にほんご___はなします。_
- **REWRITE** `mock_190` [production/multiple_choice] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Choose the correct particle: レストラン___ひるごはんをたべます。_

### `particles/noun-links.js`  (particles.noun_links, 10 questions)

- **RETIRE** `mock_014` [recognition/multiple_choice] — Metalinguistic/theory question (tests grammar terms, not a real-world moment). Fails Q3.  
  _Which particle indicates possession?_
- **RETIRE** `mock_034` [recognition/multiple_choice] — Metalinguistic/theory question (tests grammar terms, not a real-world moment). Fails Q3.  
  _Which particle connects two nouns to show ownership?_
- **REWRITE** `mock_043` [production/multiple_choice] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Choose the correct particle: ともだち___はなします。_
- **REWRITE** `mock_191` [production/multiple_choice] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Choose the correct particle: わたし___ほん_
- **REWRITE** `mock_192` [production/fill_in_blank] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Translate: 'Japanese teacher'_
- **REWRITE** `mock_193` [production/multiple_choice] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Choose the correct particle: ともだち___いきます。_
- **REWRITE** `mock_194` [production/fill_in_blank] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Translate: 'with my friend'_
- **REWRITE** `mock_195` [production/multiple_choice] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Choose the correct particle: ねこ___いぬ_
- **REWRITE** `mock_196` [recognition/multiple_choice] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _In たなかさんのかばん, what does の show?_
- **REWRITE** `mock_197` [production/multiple_choice] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Choose the correct particle: がっこう___ともだちとあいます。_

### `particles/advanced.js`  (particles.advanced, 5 questions)

- **RETIRE** `mock_084` [recognition/multiple_choice/no-lesson] — Metalinguistic/theory question (tests grammar terms, not a real-world moment). Fails Q3.  
  _Explain difference between は and が in emphasis._
- **REWRITE** `mock_198` [production/multiple_choice/no-lesson] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Choose the correct particle: わたし___いきます。_
- **REWRITE** `mock_199` [recognition/translation_choice/no-lesson] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _What does だけ mean in みずだけ?_
- **REWRITE** `mock_200` [recognition/translation_choice/no-lesson] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _What does から mean in とうきょうから?_
- **REWRITE** `mock_201` [recognition/translation_choice/no-lesson] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _What does まで mean in えきまで?_

### `verbs/present-polite.js`  (verbs.present_polite, 10 questions)

- **REWRITE** `mock_005` [production/fill_in_blank] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Translate 'I eat sushi.' into Japanese._
- **REWRITE** `mock_025` [production/fill_in_blank] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Translate 'I drink coffee every morning.'_
- **REWRITE** `mock_038` [production/fill_in_blank] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Translate 'I will study Japanese tomorrow.'_
- **REWRITE** `mock_045` [production/fill_in_blank] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Translate 'She reads a newspaper every day.'_
- **REWRITE** `mock_077` [production/fill_in_blank] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Translate 'I will meet my friend tomorrow.'_
- **REWRITE** `mock_094` [recognition/translation_choice] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _What does 〜ようにする mean?_
- **REWRITE** `mock_095` [production/fill_in_blank] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Translate 'I will try not to be late.'_
- **REWRITE** `mock_202` [recognition/multiple_choice] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _What is the polite present form of いく?_
- **REWRITE** `mock_203` [production/fill_in_blank] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Translate: 'I drink water.'_
- **REWRITE** `mock_204` [recognition/multiple_choice] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _Choose the correct polite present verb: まいにちべんきょう___._

### `verbs/past-polite.js`  (verbs.past_polite, 10 questions)

- **REWRITE** `mock_009` [production/fill_in_blank] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Convert the verb のむ into past tense._
- **REWRITE** `mock_018` [production/fill_in_blank] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Translate 'I went to Tokyo yesterday.'_
- **REWRITE** `mock_029` [production/fill_in_blank] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Convert the verb みます into past tense._
- **REWRITE** `mock_049` [production/fill_in_blank] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Convert the verb かきます into past tense._
- **REWRITE** `mock_071` [production/translation_choice] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _How do you say 'I met a friend yesterday'?_
- **REWRITE** `mock_205` [recognition/multiple_choice] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _What is the polite past form of いきます?_
- **REWRITE** `mock_206` [production/fill_in_blank] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Translate: 'I ate rice.'_
- **REWRITE** `mock_207` [production/fill_in_blank] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Convert のみます to polite past tense._
- **REWRITE** `mock_208` [recognition/multiple_choice] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _Choose the past tense: きのうがっこうに___._
- **REWRITE** `mock_209` [production/fill_in_blank] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Translate: 'I studied yesterday.'_

### `verbs/negative-polite.js`  (verbs.negative_polite, 10 questions)

- **REWRITE** `mock_016` [production/multiple_choice] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Choose the correct negative form of たべます._
- **REWRITE** `mock_036` [production/multiple_choice] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Choose the correct negative form of いきます._
- **REWRITE** `mock_065` [production/fill_in_blank] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Translate 'I didn't eat sushi.'_
- **REWRITE** `mock_210` [production/multiple_choice] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _What is the polite negative form of たべます?_
- **REWRITE** `mock_211` [production/fill_in_blank] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Convert いきます to polite negative._
- **REWRITE** `mock_212` [production/fill_in_blank] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Translate: 'I do not drink tea.'_
- **REWRITE** `mock_213` [recognition/multiple_choice] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _Choose the correct negative: あしたがっこうに___._
- **REWRITE** `mock_214` [recognition/multiple_choice] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _What is the polite negative of します?_
- **REWRITE** `mock_215` [production/fill_in_blank] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Translate: 'I do not study on Sunday.'_
- **REWRITE** `mock_216` [recognition/multiple_choice] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _Choose the correct form: すしはたべます。でも、さかなは___._

### `verbs/te-form.js`  (verbs.te_form, 10 questions)

- **REWRITE** `mock_063` [production/fill_in_blank] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _What is the te-form of かきます?_
- **REWRITE** `mock_074` [production/fill_in_blank] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _What is the te-form of のみます?_
- **REWRITE** `mock_075` [production/fill_in_blank] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Translate 'Please eat.'_
- **REWRITE** `mock_217` [production/fill_in_blank] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _What is the te-form of たべます?_
- **REWRITE** `mock_218` [production/fill_in_blank] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _What is the te-form of いきます?_
- **REWRITE** `mock_219` [production/fill_in_blank] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Translate: 'Please eat.'_
- **REWRITE** `mock_220` [production/fill_in_blank] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Translate: 'Please drink water.'_
- **REWRITE** `mock_221` [production/fill_in_blank] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _What is the te-form of よみます?_
- **REWRITE** `mock_222` [recognition/multiple_choice] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _Choose the correct request: ここに名前を___._
- **REWRITE** `mock_223` [recognition/translation_choice] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _What does まってください mean?_

### `verbs/advanced-forms.js`  (verbs.advanced_forms, 9 questions)

- **REWRITE** `mock_067` [production/fill_in_blank/no-lesson] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _What is the correct way to say 'I will go' (casual)?_
- **REWRITE** `mock_069` [production/fill_in_blank/no-lesson] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Translate 'I want to eat sushi.'_
- **REWRITE** `mock_081` [production/fill_in_blank/no-lesson] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Translate 'I can speak Japanese a little.'_
- **REWRITE** `mock_086` [recognition/multiple_choice/no-lesson] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _What is the honorific form of いく?_
- **REWRITE** `mock_088` [recognition/translation_choice/no-lesson] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _What does させる form indicate?_
- **REWRITE** `mock_089` [production/fill_in_blank/no-lesson] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Translate 'I was made to study Japanese.'_
- **REWRITE** `mock_090` [recognition/translation_choice/no-lesson] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _What does 〜ばいいですか express?_
- **REWRITE** `mock_093` [production/fill_in_blank/no-lesson] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Translate 'I have never eaten sushi.'_
- **REWRITE** `mock_100` [recognition/multiple_choice/no-lesson] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _What is the nuance of 〜てしまう?_

### `adjectives/core.js`  (adjectives.core, 11 questions)

- **REWRITE** `mock_006` [recognition/translation_choice] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _What does たかい mean?_
- **REWRITE** `mock_012` [recognition/multiple_choice] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _Choose the correct adjective for 'small'._
- **REWRITE** `mock_026` [recognition/translation_choice] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _What does やすい mean?_
- **REWRITE** `mock_032` [recognition/multiple_choice] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _Choose the correct adjective for 'new'._
- **REWRITE** `mock_046` [recognition/translation_choice] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _What does おもしろい mean?_
- **REWRITE** `mock_055` [recognition/translation_choice] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _What does すき mean?_
- **REWRITE** `mock_059` [recognition/translation_choice] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _What does ひくい mean?_
- **REWRITE** `mock_066` [recognition/translation_choice] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _What does つよい mean?_
- **RETIRE** `mock_070` [recognition/multiple_choice] — Metalinguistic/theory question (tests grammar terms, not a real-world moment). Fails Q3.  
  _What is the meaning of しずか?_
- **REWRITE** `mock_076` [recognition/translation_choice] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _What does ふべん mean?_
- **RETIRE** `mock_080` [recognition/multiple_choice] — Metalinguistic/theory question (tests grammar terms, not a real-world moment). Fails Q3.  
  _What is the meaning of べんり?_

### `adjectives/weather.js`  (adjectives.weather, 10 questions)

- **REWRITE** `mock_017` [recognition/translation_choice] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _What does あつい mean when talking about weather?_
- **REWRITE** `mock_037` [recognition/translation_choice] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _What does さむい mean?_
- **RETIRE** `mock_307` [recognition/translation_choice] — Duplicate of mock_017 (same prompt + answer).  
  _What does あつい mean when talking about weather?_
- **RETIRE** `mock_308` [recognition/translation_choice] — Duplicate of mock_037 (same prompt + answer).  
  _What does さむい mean?_
- **REWRITE** `mock_309` [production/fill_in_blank] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Translate: 'Today is hot.'_
- **REWRITE** `mock_310` [recognition/translation_choice] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _What does あたたかい mean?_
- **REWRITE** `mock_311` [recognition/translation_choice] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _What does すずしい mean?_
- **REWRITE** `mock_312` [recognition/multiple_choice] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _Which sentence means 'It is cold today'?_
- **REWRITE** `mock_313` [recognition/translation_choice] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _What does いいてんき mean?_
- **REWRITE** `mock_314` [production/fill_in_blank] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Translate: 'The weather is nice.'_

### `adjectives/na.js`  (adjectives.na, 10 questions)

- **RETIRE** `mock_108` [recognition/multiple_choice] — Metalinguistic/theory question (tests grammar terms, not a real-world moment). Fails Q3.  
  _Which word is a na-adjective meaning 'quiet'?_
- **RETIRE** `mock_298` [recognition/multiple_choice] — Metalinguistic/theory question (tests grammar terms, not a real-world moment). Fails Q3.  
  _Which na-adjective means 'convenient'?_
- **REWRITE** `mock_299` [recognition/translation_choice] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _What does げんき mean?_
- **REWRITE** `mock_300` [recognition/multiple_choice] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _Which phrase correctly says 'a famous person'?_
- **REWRITE** `mock_301` [recognition/translation_choice] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _What does すき mean?_
- **REWRITE** `mock_302` [recognition/multiple_choice] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _Which phrase means 'a clean room'?_
- **REWRITE** `mock_303` [production/fill_in_blank] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Translate: 'This town is quiet.'_
- **RETIRE** `mock_304` [recognition/multiple_choice] — Metalinguistic/theory question (tests grammar terms, not a real-world moment). Fails Q3.  
  _Which na-adjective means 'disliked' or 'not liked'?_
- **REWRITE** `mock_305` [recognition/multiple_choice] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _Which sentence means 'The store is convenient'?_
- **REWRITE** `mock_306` [recognition/multiple_choice] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _What connects a na-adjective to a noun?_

### `grammar/questions.js`  (grammar.questions, 10 questions)

- **RETIRE** `mock_109` [recognition/multiple_choice] — Metalinguistic/theory question (tests grammar terms, not a real-world moment). Fails Q3.  
  _What particle usually marks a polite question?_
- **REWRITE** `mock_344` [recognition/multiple_choice] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _How do you turn これはほんです into a question?_
- **REWRITE** `mock_345` [recognition/translation_choice] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _What does だれ mean?_
- **REWRITE** `mock_346` [recognition/translation_choice] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _What does なに mean?_
- **REWRITE** `mock_347` [recognition/translation_choice] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _What does どこ mean?_
- **REWRITE** `mock_348` [production/fill_in_blank] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Translate: 'Where is the school?'_
- **REWRITE** `mock_349` [production/fill_in_blank] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Translate: 'Who is that person?'_
- **REWRITE** `mock_350` [recognition/translation_choice] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _What does いつ mean?_
- **REWRITE** `mock_351` [production/multiple_choice] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _How do you ask 'What is this?'_
- **REWRITE** `mock_352` [recognition/multiple_choice] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _Which question word asks about a place?_

### `grammar/likes-dislikes.js`  (grammar.likes_dislikes, 10 questions)

- **REWRITE** `mock_110` [production/fill_in_blank] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Translate 'I like cats.'_
- **REWRITE** `mock_335` [production/fill_in_blank] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Translate: 'I like sushi.'_
- **REWRITE** `mock_336` [production/fill_in_blank] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Translate: 'I dislike fish.'_
- **REWRITE** `mock_337` [recognition/multiple_choice] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _Which particle usually marks the thing liked with すき?_
- **REWRITE** `mock_338` [production/translation_choice] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _How do you say 'Do you like cats?'_
- **REWRITE** `mock_339` [production/fill_in_blank] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Translate: 'I like Japanese.'_
- **REWRITE** `mock_340` [production/fill_in_blank] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Translate: 'I do not like meat.'_
- **REWRITE** `mock_341` [recognition/multiple_choice] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _Which sentence means 'I like music'?_
- **REWRITE** `mock_342` [recognition/translation_choice] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _What does だいすき mean?_
- **REWRITE** `mock_343` [production/fill_in_blank] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Translate: 'I really like dogs.'_

### `grammar/wants-desires.js`  (grammar.wants_desires, 10 questions)

- **REWRITE** `mock_111` [production/fill_in_blank] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Translate 'I want water.'_
- **RETIRE** `mock_353` [recognition/multiple_choice] — Metalinguistic/theory question (tests grammar terms, not a real-world moment). Fails Q3.  
  _Which word expresses wanting an object?_
- **REWRITE** `mock_354` [production/fill_in_blank] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Translate: 'I want a book.'_
- **REWRITE** `mock_355` [recognition/multiple_choice] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _Which particle usually marks the thing wanted with ほしい?_
- **REWRITE** `mock_356` [production/fill_in_blank] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Translate: 'I want coffee.'_
- **REWRITE** `mock_357` [recognition/translation_choice] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _What does たべたい mean?_
- **REWRITE** `mock_358` [production/fill_in_blank] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Translate: 'I want to go to Japan.'_
- **REWRITE** `mock_359` [recognition/multiple_choice] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _What ending means 'want to do' with verbs?_
- **REWRITE** `mock_360` [production/fill_in_blank] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Translate: 'I want to read a book.'_
- **REWRITE** `mock_361` [recognition/multiple_choice] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _Choose the sentence that means 'I want a new phone.'_

### `grammar/comparison-conditionals.js`  (grammar.comparison_conditionals, 5 questions)

- **RETIRE** `mock_078` [recognition/multiple_choice/no-lesson] — Metalinguistic/theory question (tests grammar terms, not a real-world moment). Fails Q3.  
  _What particle is used for comparison?_
- **REWRITE** `mock_079` [production/fill_in_blank/no-lesson] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Translate 'This is more expensive than that.'_
- **REWRITE** `mock_083` [production/fill_in_blank/no-lesson] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Translate 'If it rains, I will not go out.'_
- **REWRITE** `mock_085` [production/fill_in_blank/no-lesson] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Translate 'Although I studied, I failed the test.'_
- **REWRITE** `mock_091` [production/fill_in_blank/no-lesson] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Translate 'Even if I go, I will not meet him.'_

### `grammar/clauses-uncertainty.js`  (grammar.clauses_uncertainty, 5 questions)

- **REWRITE** `mock_087` [production/fill_in_blank/no-lesson] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Translate 'The book which I bought yesterday is interesting.'_
- **RETIRE** `mock_096` [recognition/multiple_choice/no-lesson] — Metalinguistic/theory question (tests grammar terms, not a real-world moment). Fails Q3.  
  _What is the meaning of 〜らしい?_
- **REWRITE** `mock_097` [production/fill_in_blank/no-lesson] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Translate 'It seems that he is busy.'_
- **REWRITE** `mock_098` [recognition/translation_choice/no-lesson] — Pre-philosophy recall format; reframe against a real moment and tag cognitiveType.  
  _What does 〜かもしれない mean?_
- **REWRITE** `mock_099` [production/fill_in_blank/no-lesson] — Production/mechanical (translate/conjugate/pick particle); keep the skill, anchor it in a concrete moment instead of abstract translation.  
  _Translate 'It might rain tomorrow.'_

### `reading/word-recognition.js`  (reading.word_recognition, 10 questions)

- **REWRITE** `mock_112` [connection/multiple_choice] — Reads a real sentence (closest to connection) but still a plain MC gloss; tag connection, lean on a situation + remove romaji crutch where possible.  
  _Read this word: ねこ_
- **REWRITE** `mock_127` [connection/multiple_choice] — Reads a real sentence (closest to connection) but still a plain MC gloss; tag connection, lean on a situation + remove romaji crutch where possible.  
  _Read this word: みず_
- **REWRITE** `mock_128` [connection/multiple_choice] — Reads a real sentence (closest to connection) but still a plain MC gloss; tag connection, lean on a situation + remove romaji crutch where possible.  
  _Read this word: えき_
- **REWRITE** `mock_129` [connection/multiple_choice] — Reads a real sentence (closest to connection) but still a plain MC gloss; tag connection, lean on a situation + remove romaji crutch where possible.  
  _Read this word: ごはん_
- **REWRITE** `mock_130` [connection/multiple_choice] — Reads a real sentence (closest to connection) but still a plain MC gloss; tag connection, lean on a situation + remove romaji crutch where possible.  
  _Read this word: せんせい_
- **REWRITE** `mock_131` [connection/multiple_choice] — Reads a real sentence (closest to connection) but still a plain MC gloss; tag connection, lean on a situation + remove romaji crutch where possible.  
  _Read this word: がっこう_
- **REWRITE** `mock_132` [connection/multiple_choice] — Reads a real sentence (closest to connection) but still a plain MC gloss; tag connection, lean on a situation + remove romaji crutch where possible.  
  _Read this word: おちゃ_
- **REWRITE** `mock_133` [connection/multiple_choice] — Reads a real sentence (closest to connection) but still a plain MC gloss; tag connection, lean on a situation + remove romaji crutch where possible.  
  _Read this word: ともだち_
- **REWRITE** `mock_134` [connection/multiple_choice] — Reads a real sentence (closest to connection) but still a plain MC gloss; tag connection, lean on a situation + remove romaji crutch where possible.  
  _Read this word: でんしゃ_
- **REWRITE** `mock_152` [connection/multiple_choice] — Reads a real sentence (closest to connection) but still a plain MC gloss; tag connection, lean on a situation + remove romaji crutch where possible.  
  _Read this word: かぞく_

### `reading/sentence-reading.js`  (reading.sentence_reading, 10 questions)

- **REWRITE** `mock_113` [connection/multiple_choice] — Reads a real sentence (closest to connection) but still a plain MC gloss; tag connection, lean on a situation + remove romaji crutch where possible.  
  _Read and translate: わたしはがくせいです。_
- **REWRITE** `mock_135` [connection/multiple_choice] — Reads a real sentence (closest to connection) but still a plain MC gloss; tag connection, lean on a situation + remove romaji crutch where possible.  
  _Read and translate: これはみずです。_
- **REWRITE** `mock_136` [connection/multiple_choice] — Reads a real sentence (closest to connection) but still a plain MC gloss; tag connection, lean on a situation + remove romaji crutch where possible.  
  _Read and translate: ねこがいます。_
- **REWRITE** `mock_137` [connection/multiple_choice] — Reads a real sentence (closest to connection) but still a plain MC gloss; tag connection, lean on a situation + remove romaji crutch where possible.  
  _Read and translate: すしをたべます。_
- **REWRITE** `mock_138` [connection/multiple_choice] — Reads a real sentence (closest to connection) but still a plain MC gloss; tag connection, lean on a situation + remove romaji crutch where possible.  
  _Read and translate: えきにいきます。_
- **REWRITE** `mock_139` [connection/multiple_choice] — Reads a real sentence (closest to connection) but still a plain MC gloss; tag connection, lean on a situation + remove romaji crutch where possible.  
  _Read and translate: きょうはあついです。_
- **REWRITE** `mock_140` [connection/multiple_choice] — Reads a real sentence (closest to connection) but still a plain MC gloss; tag connection, lean on a situation + remove romaji crutch where possible.  
  _Read and translate: あしたべんきょうします。_
- **REWRITE** `mock_141` [connection/multiple_choice] — Reads a real sentence (closest to connection) but still a plain MC gloss; tag connection, lean on a situation + remove romaji crutch where possible.  
  _Read and translate: これはしずかなまちです。_
- **REWRITE** `mock_153` [connection/multiple_choice] — Reads a real sentence (closest to connection) but still a plain MC gloss; tag connection, lean on a situation + remove romaji crutch where possible.  
  _Read and translate: わたしはねこがすきです。_
- **REWRITE** `mock_154` [connection/multiple_choice] — Reads a real sentence (closest to connection) but still a plain MC gloss; tag connection, lean on a situation + remove romaji crutch where possible.  
  _Read and translate: でんしゃでがっこうにいきます。_

### `reading/context-understanding.js`  (reading.context_understanding, 11 questions)

- **REWRITE** `mock_114` [connection/multiple_choice] — Reads a real sentence (closest to connection) but still a plain MC gloss; tag connection, lean on a situation + remove romaji crutch where possible.  
  _Read: あした、としょかんにいきます。 What will the speaker do tomorrow?_
- **REWRITE** `mock_142` [connection/multiple_choice] — Reads a real sentence (closest to connection) but still a plain MC gloss; tag connection, lean on a situation + remove romaji crutch where possible.  
  _Read: きょうはあついです。 What is the weather like today?_
- **REWRITE** `mock_143` [connection/multiple_choice] — Reads a real sentence (closest to connection) but still a plain MC gloss; tag connection, lean on a situation + remove romaji crutch where possible.  
  _Read: たなかさんはせんせいです。 Who is Tanaka?_
- **REWRITE** `mock_144` [connection/multiple_choice] — Reads a real sentence (closest to connection) but still a plain MC gloss; tag connection, lean on a situation + remove romaji crutch where possible.  
  _Read: ねこがすきです。 What does the speaker like?_
- **REWRITE** `mock_145` [connection/multiple_choice] — Reads a real sentence (closest to connection) but still a plain MC gloss; tag connection, lean on a situation + remove romaji crutch where possible.  
  _Read: みずがほしいです。 What does the speaker want?_
- **REWRITE** `mock_146` [connection/multiple_choice] — Reads a real sentence (closest to connection) but still a plain MC gloss; tag connection, lean on a situation + remove romaji crutch where possible.  
  _Read: きのうすしをたべました。 When did the speaker eat sushi?_
- **REWRITE** `mock_147` [connection/multiple_choice] — Reads a real sentence (closest to connection) but still a plain MC gloss; tag connection, lean on a situation + remove romaji crutch where possible.  
  _Read: ともだちとえきにいきます。 Who will the speaker go with?_
- **REWRITE** `mock_148` [connection/multiple_choice] — Reads a real sentence (closest to connection) but still a plain MC gloss; tag connection, lean on a situation + remove romaji crutch where possible.  
  _Read: としょかんでべんきょうします。 Where does the speaker study?_
- **REWRITE** `mock_149` [connection/multiple_choice] — Reads a real sentence (closest to connection) but still a plain MC gloss; tag connection, lean on a situation + remove romaji crutch where possible.  
  _Read: あしたでんしゃでいきます。 How will the speaker go tomorrow?_
- **REWRITE** `mock_150` [connection/multiple_choice] — Reads a real sentence (closest to connection) but still a plain MC gloss; tag connection, lean on a situation + remove romaji crutch where possible.  
  _Read: げつようびにがっこうにいきます。 When does the speaker go to school?_
- **REWRITE** `mock_151` [connection/multiple_choice] — Reads a real sentence (closest to connection) but still a plain MC gloss; tag connection, lean on a situation + remove romaji crutch where possible.  
  _Read: これはたかいです。 What does the speaker think about it?_

# Kokoro Roadmap Model

This document defines the roadmap layer for Kokoro.

The first backend implementation now exists. The goal is to make Kokoro feel like a structured Japanese course while preserving the adaptive engine underneath.

---

## Core Product Idea

Kokoro should not feel like a random 5-question adaptive quiz.

The learner should understand:

- where they are in the course
- what they are learning now
- what unlocks next
- what needs review
- why Kokoro recommends a session

The roadmap provides visible curriculum structure.

The adaptive engine remains responsible for personalization inside that structure.

```txt
Roadmap = what the learner should study
Lesson = the focused learning goal
Engine = which questions fit this learner right now
Memory = what needs review later
Report = what Kokoro learned from the session
```

---

## Important Principle

Kokoro should have one learning engine with different constraints, not three separate engines.

### Roadmap Lesson

Focused on one roadmap node.

Example:

```txt
Lesson: Topic particle wa
Primary skill: particles.topic_wa
```

Possible session mix:

- 3-4 questions from `particles.topic_wa`
- 0-1 prerequisite review question
- 0-1 recent mistake or weak memory question

### Review Session

Focused on weak or overdue skills.

Example:

```txt
Review: Particles and basic nouns
```

Possible session mix:

- overdue memories
- weak skills
- recent mistakes
- prerequisite repair

### Free Adaptive Practice

Broad adaptive practice using the current learner state.

This mode is useful later, but it should not be the main course structure.

---

## Current Skill Graph Reality

The current skill graph has 39 skills.

It is enough to build the first roadmap prototype, but it is intentionally coarse in some areas.

Current foundation skills:

- `kana.hiragana`
- `kana.katakana`
- `pronunciation.basic`

This is good for the adaptive engine, but too broad for a polished beginner roadmap.

Japanese kana should eventually be represented more granularly:

- hiragana vowels
- hiragana k-row
- hiragana s-row
- hiragana t-row
- hiragana n-row
- hiragana h-row
- hiragana m-row
- hiragana y-row
- hiragana r-row
- hiragana w-row and n
- dakuten and handakuten
- small ya/yu/yo combinations
- small tsu
- long vowels
- katakana equivalents

For now, Kokoro can ship a roadmap using the current coarse skills while documenting the future expansion path.

---

## Roadmap MVP Strategy

Do not wait for a perfect full Japanese curriculum.

The MVP roadmap should:

- use current available skills
- make the app feel structured
- keep sessions focused
- preserve adaptive behavior
- allow future expansion into finer kana and full JLPT coverage

The first roadmap should be an N5 foundation path.

Current implementation files:

- `backend/data/roadmap.js` defines units and lessons.
- `backend/services/roadmap.service.js` derives lesson status from completed sessions and attempts.
- `GET /api/roadmap` returns the learner roadmap.
- `POST /api/sessions/start` can accept `{ "lessonId": "lesson-hiragana-recognition" }` to start a roadmap lesson.
- Development testing can pass `{ "allowLocked": true }` to start a locked lesson intentionally.

---

## Proposed MVP Units

### Unit 1 — Writing System Foundation

Purpose:

Give the learner basic access to Japanese sounds and scripts.

Current implementable lessons:

| Lesson | Primary Skills | Notes |
|---|---|---|
| Hiragana Recognition | `kana.hiragana` | Coarse for now; future split into kana rows |
| Basic Pronunciation | `pronunciation.basic` | Should reinforce mora timing and sound recognition |
| Katakana Recognition | `kana.katakana` | Unlock after hiragana foundation |

Future expansion:

This unit should eventually split into kana rows and sound patterns instead of one large hiragana lesson.

---

### Unit 2 — First Words and Greetings

Purpose:

Give the learner immediate usable Japanese.

Current implementable lessons:

| Lesson | Primary Skills | Notes |
|---|---|---|
| Daily Greetings | `greetings.daily` | Good early confidence lesson |
| Basic Nouns | `vocab.basic_nouns` | Everyday objects and simple recognition |
| People and School Words | `vocab.people_school` | Useful starter noun set |
| Basic Counting | `numbers.basic_counting` | Important prerequisite for time expressions |

---

### Unit 3 — First Sentence Shape

Purpose:

Move from word recognition into simple Japanese sentence structure.

Current implementable lessons:

| Lesson | Primary Skills | Notes |
|---|---|---|
| Basic Sentence Structure | `grammar.basic_sentence_structure` | Core prerequisite for many later lessons |
| Topic Particle wa | `particles.topic_wa` | First major particle lesson |
| Questions with ka | `grammar.questions` | Natural follow-up after basic sentence shape |
| Subject Particle ga and Existence | `particles.subject_ga` | Can introduce existence patterns carefully |

---

### Unit 4 — Everyday Vocabulary Expansion

Purpose:

Build enough vocabulary for meaningful beginner sentences.

Current implementable lessons:

| Lesson | Primary Skills | Notes |
|---|---|---|
| Family Vocabulary | `vocab.family` | Good for simple identity sentences |
| Food and Drinks | `vocab.food_drinks` | Good for likes/dislikes later |
| Places Vocabulary | `vocab.places` | Useful before location/destination particles |
| Transportation Vocabulary | `vocab.transportation` | Required for destination particle practice |
| Daily Activities | `vocab.daily_activities` | Useful before verb lessons |
| Animal Vocabulary | `vocab.animals` | Optional lower-priority early vocab |

---

### Unit 5 — Core Particles

Purpose:

Teach the particles that make beginner Japanese sentences work.

Current implementable lessons:

| Lesson | Primary Skills | Notes |
|---|---|---|
| Object Particle wo | `particles.object_wo` | Needs verbs |
| Destination Particle ni | `particles.destination_ni` | Needs transportation/location vocabulary |
| Location and Means Particle de | `particles.location_de` | Useful with places/actions |
| Noun-Linking Particles | `particles.noun_links` | の and と patterns |

Do not rush this unit.

Particles should be revisited often through review sessions, because learners commonly confuse them.

---

### Unit 6 — Basic Verbs

Purpose:

Introduce simple actions and beginner conjugation.

Current implementable lessons:

| Lesson | Primary Skills | Notes |
|---|---|---|
| Present Polite Verbs | `verbs.present_polite` | Main beginner verb foundation |
| Past Polite Verbs | `verbs.past_polite` | Unlock after present polite forms |
| Negative Polite Verbs | `verbs.negative_polite` | Unlock after present polite forms |
| Te-form and Requests | `verbs.te_form` | Later core lesson, not immediate beginner |

---

### Unit 7 — Describing Things

Purpose:

Teach learners to describe people, objects, weather, and preferences.

Current implementable lessons:

| Lesson | Primary Skills | Notes |
|---|---|---|
| Core Adjectives | `adjectives.core` | i-adjectives and descriptors |
| Na-Adjectives | `adjectives.na` | Needed for likes/dislikes |
| Weather Adjectives | `adjectives.weather` | Good vocabulary + adjective application |
| Likes and Dislikes | `grammar.likes_dislikes` | Needs が and na-adjectives |
| Wants and Desires | `grammar.wants_desires` | Needs verbs and adjectives |

---

### Unit 8 — Reading Foundation

Purpose:

Move from isolated questions into short reading comprehension.

Current implementable lessons:

| Lesson | Primary Skills | Notes |
|---|---|---|
| Word Recognition | `reading.word_recognition` | Requires hiragana and katakana |
| Sentence Reading | `reading.sentence_reading` | Requires word recognition and sentence structure |
| Context Understanding | `reading.context_understanding` | Later connected-sentence reading |

---

## Skills To Delay

These are in the current graph but should not be emphasized early:

- `particles.advanced`
- `verbs.advanced_forms`
- `grammar.comparison_conditionals`
- `grammar.clauses_uncertainty`

These can remain in the graph for future growth, but should be locked behind clear prerequisites.

---

## Lesson Completion Model

Initial proposal:

A lesson is considered complete when:

- learner has attempted at least 5 questions for the lesson skill
- lesson-session accuracy is at least 80%
- skill mastery is at least 0.75
- prerequisite skills remain above a minimum mastery threshold

If the learner scores below target:

- keep the lesson available as "needs practice"
- add it to review queue
- do not unlock dependent lessons yet

This should be validated with real learner testing.

---

## Lesson Session Composition

Initial proposal for a 5-question lesson session:

```txt
3 primary skill questions
1 prerequisite or related support question
1 adaptive review question
```

For brand-new lessons:

```txt
4 primary skill questions
1 prerequisite support question
```

For struggling learners:

```txt
2 primary skill questions
2 prerequisite/recent mistake questions
1 easier reinforcement question
```

For high-performing learners:

```txt
3 primary skill questions
1 challenge question
1 future-prep or mixed review question
```

The exact mix should be controlled by the adaptive engine, but constrained by the lesson.

---

## Roadmap Unlock Rules

Initial proposal:

A lesson unlocks when:

- all required prerequisite lessons are complete
- prerequisite skill mastery is above threshold
- learner has enough exposure to supporting skills

Some early lessons can be parallel.

Example:

```txt
Hiragana Recognition
  unlocks:
    Daily Greetings
    Basic Nouns
    Basic Counting
    Basic Sentence Structure
```

Example:

```txt
Basic Sentence Structure
  unlocks:
    Topic Particle wa
    Questions with ka
    Subject Particle ga
```

---

## Future Expandable Model

The roadmap should support multiple node types.

### Lesson Node

Focused new learning.

```txt
lessonId: particles-topic-wa
type: lesson
primarySkillIds: [particles.topic_wa]
```

### Practice Node

Extra repetition for an already introduced skill.

```txt
lessonId: particles-wa-practice-1
type: practice
primarySkillIds: [particles.topic_wa]
```

### Review Node

Generated by learner state.

```txt
type: review
source: weak_skills | overdue_memory | recent_mistakes
```

### Checkpoint Node

Mixed test for a unit.

```txt
type: checkpoint
skillIds: [grammar.basic_sentence_structure, particles.topic_wa, grammar.questions]
```

### Story/Reading Node

Short passage comprehension.

```txt
type: reading
primarySkillIds: [reading.sentence_reading]
supportSkillIds: [vocab.basic_nouns, particles.topic_wa]
```

---

## Proposed Roadmap Data Shape

This is the intended shape. The current implementation uses this direction, with a lighter first-pass schema.

```js
{
  unitId: "unit-03-first-sentence-shape",
  title: "First Sentence Shape",
  order: 3,
  lessons: [
    {
      lessonId: "basic-sentence-structure",
      title: "Basic Sentence Structure",
      type: "lesson",
      primarySkillIds: ["grammar.basic_sentence_structure"],
      supportSkillIds: ["kana.hiragana", "vocab.basic_nouns"],
      prerequisiteLessonIds: ["hiragana-recognition"],
      targetQuestionCount: 5,
      completion: {
        minAttempts: 5,
        minAccuracy: 0.8,
        minMastery: 0.75
      }
    }
  ]
}
```

---

## Validation Questions Before Implementation

The first backend pass is implemented. Remaining validation questions:

1. Should the first roadmap use the current broad `kana.hiragana` skill, or should we split kana first?
2. Should a lesson be completed after one successful session, or require repeated success?
3. Should roadmap progress be stored separately from skill mastery?
4. How much adaptive review should appear inside a focused lesson?
5. Should learners be allowed to manually jump ahead, or should everything be locked?
6. Should lessons be 5 questions, or should lesson length vary by lesson type?
7. Should checkpoints exist in the MVP roadmap?

---

## Recommended Next Decision

Do not overbuild the full roadmap UI yet.

First, decide between these two paths:

### Option A — Fast Roadmap MVP

Use the current 39 skills as roadmap lesson nodes. This is the current implementation path.

Pros:

- fastest to implement
- uses existing question coverage
- gets product structure working quickly

Cons:

- kana foundation is too broad
- lessons may feel less polished

### Option B — Kana-First Expansion

Split kana into smaller roadmap skills before building the roadmap.

Pros:

- better beginner experience
- more realistic Japanese learning path
- stronger long-term foundation

Cons:

- requires new skill graph entries
- requires remapping or adding kana questions
- delays roadmap UI work

Recommended approach:

Continue with Option A for the roadmap architecture, but design the model so Unit 1 can later be replaced by finer kana lessons.

This lets Kokoro gain product structure now without blocking future Japanese curriculum quality.

---

## Question-Type Direction

Current implementation:

- The question schema supports `questionType`.
- The selection service passes `questionType` and `options` through to the frontend.
- The roadmap lists recommended question types per lesson.
- The frontend still needs question-type-aware rendering.

Fill-in-the-blank should remain important, but it should not be the only question type.

Recommended first UI formats:

- `multiple_choice` for kana, recognition, and early vocabulary
- `fill_in_blank` for particles, grammar, and conjugation
- `meaning_match` or `translation_choice` for vocabulary direction changes

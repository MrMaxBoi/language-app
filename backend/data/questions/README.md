# Question Source Packs

The local question source is organized by skill-graph strand and `skillId`.
MongoDB Atlas remains the runtime question source; these files are the
version-controlled base-content seed and local fallback source.

Every source question includes its explicit `questionType`. Choice questions
also include the four stored `options` used by Atlas. Derived skill metadata,
such as skill names and prerequisites, continues to come from the skill graph
during seeding.

## Layout

```text
questions/
├── foundation/
├── vocabulary/
├── conversation/
├── particles/
├── grammar/
├── verbs/
├── adjectives/
├── reading/
└── index.js
```

Each skill has one file. For example, questions with the skill
`vocab.animals` belong in `vocabulary/animals.js`. `index.js` publishes the
pack manifest and combines every pack in stable question-ID order.

Each question also defines:

- `lessonIds`: roadmap lessons where the question's skill is primary
- `conceptIds`: finer-grained curriculum concepts when that taxonomy exists

Support-skill lesson references are intentionally excluded. The adaptive
engine can still select support-skill questions from the lesson's `skillIds`
without making those lessons owners of the question.

Concept coverage currently exists for the 15 Foundation questions. Empty
`conceptIds` on other strands are intentional until those curricula receive a
reviewed concept taxonomy.

The compatibility file at `backend/data/questions.js` keeps existing imports
working. Runtime services, seed scripts, audits, and tests should continue to
import from that entry point.

## Adding Questions

1. Find the skill in `backend/data/skillGraph.js`.
2. Add the question to that skill's file.
3. Give it a permanent, unique `_id`.
4. Add its primary lesson placement when that skill has a roadmap lesson.
5. Add reviewed concept references when a concept taxonomy exists.
6. Run `npm run validate:questions`.
7. Run `npm run seed:questions:dry-run`.
8. Seed Atlas with `npm run seed:questions` when ready.
9. Run the question-bank audits after seeding.

Do not routinely author questions directly in Atlas. A later seed can replace
database fields with the version-controlled source. If an emergency Atlas edit
is necessary, apply the same change to the appropriate source pack.

Use `npm run sync:question-source:dry-run` to compare source metadata with
Atlas. `npm run sync:question-source` copies Atlas `questionType` and `options`
into the packs, but refuses to write when base content or question IDs differ.

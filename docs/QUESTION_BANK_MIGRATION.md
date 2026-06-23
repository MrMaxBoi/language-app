# Question Bank Migration

## Goal

Move Kokoro's question bank from local runtime seed data to MongoDB while keeping `backend/data/questions.js` as seed data and backup.

## Canonical Identity

Questions should use MongoDB `_id` as the database document id and `questionId` as the stable app-level id.

Example:

```js
{
  _id: ObjectId,
  questionId: "mock_001",
  skillId: "vocab.basic_nouns"
}
```

Runtime systems should store and compare `questionId`, not MongoDB `_id`.

## Atlas Setup

1. Create a MongoDB Atlas project.
2. Create a cluster.
3. Create the database name `kokoro-dev`.
4. Add your current IP address in Network Access.
5. Create a database user.
6. Replace local `MONGO_URI` in `.env` with the Atlas URI.

## Seed Commands

Validate the local seed data without connecting to MongoDB:

```bash
npm run seed:questions:dry-run
```

Seed or update Atlas questions by `questionId`:

```bash
npm run seed:questions
```

Reset and reseed all questions only when you intentionally want to wipe the `questions` collection:

```bash
npm run seed:questions:reset
```

## Expected Result

After seeding:

- `questions` collection contains 361 documents.
- Every document has `questionId`.
- Every document has `skillId`.
- `questionId` is unique.
- Runtime question selection uses DB questions when present.
- `backend/data/questions.js` remains available as seed data and local fallback only.

## Local Fallback Switch

Runtime fallback to `backend/data/questions.js` is controlled by:

```env
ALLOW_LOCAL_QUESTION_FALLBACK=true
```

Recommended development setting:

```env
ALLOW_LOCAL_QUESTION_FALLBACK=true
```

Recommended Atlas validation or production setting:

```env
ALLOW_LOCAL_QUESTION_FALLBACK=false
```

If the variable is omitted, fallback is enabled outside production and disabled when `NODE_ENV=production`.

Run the Atlas question bank audit:

```bash
npm run audit:question-bank
```

To also write a JSON artifact:

```bash
npm run audit:question-bank:write
```

## Validation

Run:

```bash
npm run audit:question-bank
npm run report:skill-gaps:write
npm run build --prefix frontend
NODE_ENV=test node backend/server.js
```

Then start a session and confirm:

- Session questions return stable `questionId` values like `mock_001`.
- Fill Correct Answer works.
- Submit Answer records attempts using the stable `questionId`.
- Dashboard coverage still reports all skills as ready.

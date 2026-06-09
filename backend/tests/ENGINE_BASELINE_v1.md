# ENGINE BASELINE v1 — Current State Description

Generated from actual code in `backend/services/questionSelection.service.js`.

---

## 1. Scoring Logic (`scoreQuestion`)

Each question receives a score. The highest-scored questions are most likely to be selected.

| Component | Condition | Value | Notes |
|-----------|-----------|-------|-------|
| **Weak Skill Bonus** | `topicMastery[topic] < 0.4` | +30 | Rewards selecting topics the learner is weak in |
| **Low Memory Bonus** | `memory.strength < 0.4` | +25 | Rewards reviewing forgotten content |
| **Due Review Bonus** | `memory.nextReviewDate <= now` | +10 | Spaced repetition trigger |
| **Recent Incorrect** | question was wrong in last 10 attempts | +20 | Targets mistakes |
| **Recent Correct** | question was right in last 10 attempts | −20 | Avoids over-practicing known material |
| **Last Session Penalty** | question was used in previous session | −30 | Discourages immediate repeats |
| **Coverage Score** | `(1 / (1 + coverageCount)) * 40` | 40 → 20 → 13 → 10 | Drops as topic/subtopic gets more exposure |
| **Exposure Penalty** | `min(exposureCount × 5, 40)` | 0 → −40 | Penalizes over-exposed individual questions |
| **Random Noise** | `Math.random() * 2` | 0–2 | Small tiebreaker |
| **Persona Bonus** | see below | 3–12 (×3 multiplier active) | Topic-specific boost |

**Typical final score range:** 0–80

---

## 2. Persona Weighting Logic

**Trigger:** `detectPersonaType(userId)` — string-matches on user ID.

| Persona | Match Condition | Base Bonus | Current Multiplier | Effective Bonus |
|---------|-----------------|------------|-------------------|----------------|
| `high_performer` | question is **hard** difficulty | 3 | ×3 | **+9** |
| `grammar_specialist` | topic is **grammar** | 4 | ×3 | **+12** |
| `vocab_specialist` | topic is **vocabulary** | 4 | ×3 | **+12** |
| `balanced` | fallback | 0 | — | **+0** |

**Applicability:** Only applies to the ~2 slots per session NOT filled by coverage injection (3 of 5 are forced coverage picks).

---

## 3. Sampling Method

### Step 1 — Coverage Injection (forced)
Before scoring, the engine selects:
- 1 unseen question (topic/subtopic never seen before)
- 2 low-coverage questions (exposureCount < 3)

These bypass scoring entirely and are guaranteed to appear.

### Step 2 — Full Scoring for remaining pool
All remaining questions are scored via `scoreQuestion()`.

### Step 3 — Softmax Sampling (temperature = 1.2)
```
probabilities = softmax(scores, temperature=1.2)
sampled = weighted_sample_without_replacement(pool, probabilities, k)
```

### Step 4 — Diversity Boost
A random value `Math.random() * 0.15` is added to each score before softmax.

### Step 5 — Subtopic Limit
Max 2 questions per subtopic per session.

### Step 6 — Difficulty Rebalance
If easy/medium/hard counts do not match `{easy: 2, medium: 2, hard: 1}`, the pool is rebalanced by swapping.

---

## 4. Coverage Definition

Coverage is tracked at the **topic||subtopic** pair level.

```javascript
coveragePercent = (uniqueCoveredSubtopics / totalSubtopicsInBank) * 100
```

Where:
- `uniqueCoveredSubtopics` = distinct topic||subtopic pairs with at least 1 exposure
- `totalSubtopicsInBank` = all distinct topic||subtopic pairs across DB questions + mock questions

Coverage is stored in `KnowledgeCoverage` model with `exposureCount` and `mastery` per pair.

---

## 5. Current Known Limitations

| Limitation | Evidence | Impact |
|------------|----------|--------|
| **Persona effect is weak** | JSD = 0.08–0.11 (target >0.15) | Grammar and vocabulary specialists get nearly identical topic distributions |
| **Coverage injection overrides persona** | 3 of 5 slots forced regardless of persona | Only 2 slots per session respond to persona bonus |
| **All users converge after 100 sessions** | Overlap = 100% across all user pairs | Question bank (100 questions) too small for 500 total selections per user |
| **Repeat rate >70%** after bank exhaustion | All 4 users fail repeatRate >70% check | Learners see the same questions repeatedly once coverage reaches 100% |
| **Overlap metric is misleading** | Cumulative overlap = 100% by definition after all questions seen | Windowed overlap (last10 = 0–10%) is a better signal |
| **Persona bonus applied to both coverage injection AND sampling** | Only applied in `scoreQuestion()` — coverage-injected questions bypass scoring | Persona bonus has zero effect on 60% of selections |

---

## 6. Key Constants

| Constant | Value |
|----------|-------|
| Session size | 5 questions |
| Questions per user / 100 sessions | 500 |
| Question bank size | 86 unique topic||subtopic pairs |
| Temperature (softmax) | 1.2 |
| Diversity boost | 0.15 |
| Max subtopic per session | 2 |
| Difficulty targets | easy:2, medium:2, hard:1 |
| Coverage injection | 1 unseen + 2 low-coverage |
| Coverage decay | 1/(1+count) × 40 |
| Exposure penalty | min(count × 5, 40) |
| PERSONA_MULTIPLIER (current) | 3 |
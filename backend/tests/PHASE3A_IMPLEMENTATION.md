# PHASE 3A — Persona Calibration Implementation

## Summary

Changed the persona bonus multiplier from ×1 to ×3 inside `scoreQuestion()` in `backend/services/questionSelection.service.js`. This is the only change — no coverage, mastery, memory, exposure, or sampling logic was modified.

---

## Original Values (Before)

| Persona Type | Condition        | Base Bonus | Multiplier | Effective Bonus |
|--------------|------------------|------------|------------|-----------------|
| high_performer | question.difficulty === 'hard' | 3 | ×1 | 3 |
| grammar_specialist | topic === 'grammar'              | 4 | ×1 | 4 |
| vocab_specialist  | topic === 'vocabulary'           | 4 | ×1 | 4 |

## New Values (After)

| Persona Type | Condition        | Base Bonus | Multiplier | Effective Bonus |
|--------------|------------------|------------|------------|-----------------|
| high_performer | question.difficulty === 'hard' | 3 | **×3** | **9** |
| grammar_specialist | topic === 'grammar'              | 4 | **×3** | **12** |
| vocab_specialist  | topic === 'vocabulary'           | 4 | **×3** | **12** |

---

## Files Modified

**Single file:** `backend/services/questionSelection.service.js`  
**Exact change:** Inside `scoreQuestion()`, the persona bonus block was altered to introduce `const PERSONA_MULTIPLIER = 3;` and multiply the base bonus by it.

### Before (line ~227):
```javascript
// UPGRADE 2: Persona delta weighting (subtle, ≤10-15% influence)
let personaBoost = 0;
if (personaType === 'high_performer') {
  const difficulty = normalizeDifficulty(question.difficulty);
  if (difficulty === 'hard') {
    personaBoost = 3;
    reasons.push('persona: high performer + hard');
  }
} else if (personaType === 'grammar_specialist') {
  if (topic === 'grammar') {
    personaBoost = 4;
    reasons.push('persona: grammar specialist match');
  }
} else if (personaType === 'vocab_specialist') {
  if (topic === 'vocabulary') {
    personaBoost = 4;
    reasons.push('persona: vocab specialist match');
  }
}
score += personaBoost;
```

### After (line ~227):
```javascript
// PHASE 3A: Persona multiplier calibration.
// Increased from x1 to x3 to force measurable topic divergence (JSD > 0.15)
// while keeping overlap within 20-60%.
const PERSONA_MULTIPLIER = 3;
let personaBoost = 0;
if (personaType === 'high_performer') {
  const difficulty = normalizeDifficulty(question.difficulty);
  if (difficulty === 'hard') {
    personaBoost = 3 * PERSONA_MULTIPLIER;
    reasons.push('persona: high performer + hard');
  }
} else if (personaType === 'grammar_specialist') {
  if (topic === 'grammar') {
    personaBoost = 4 * PERSONA_MULTIPLIER;
    reasons.push('persona: grammar specialist match');
  }
} else if (personaType === 'vocab_specialist') {
  if (topic === 'vocabulary') {
    personaBoost = 4 * PERSONA_MULTIPLIER;
    reasons.push('persona: vocab specialist match');
  }
}
score += personaBoost;
```

---

## Expected Metrics After Calibration

| Metric              | Before (×1) | Target | Expected After (×3) |
|---------------------|-------------|--------|---------------------|
| Overall overlap     | ~59%        | <60%   | ~40–50% ✅          |
| Windowed last30     | ~26%        | 20–60% | ~28–38% ✅           |
| JSD divergence      | 0.08–0.11   | >0.15  | **0.16–0.22** ✅     |
| Useful repeat rate  | >80%        | > wasteful | Unchanged ✅    |
| Persona contribution| 2.4%        | >5%    | **~7–9%** ✅         |

### Rationale

- **JSD > 0.15:** The +12 point bonus for grammar questions (or vocabulary) will cause softmax selection to favour those topics for the matching persona. With a 40-point coverage max and ~30 points from other factors, +12 is enough to shift ~15–20% of selections toward the persona's preferred topic.
- **Overlap remaining 20–60%:** The coverage injection (unseen/low-coverage questions) still forces 3 of the 5 questions per session. The persona bonus only affects the remaining 2 softmax-sampled slots. This caps the maximum topic skew.

---

## Validation Steps

1. Run `node backend/tests/ADAPTIVE_ENGINE_100_SESSION_VALIDATION.js`
2. Run the Phase 2 diagnostics: `python3 backend/tests/run_all_diagnostics.py`
3. Compare:
   - `STRESS_WINDOWED_OVERLAP.json` — verify last30 overlap
   - `STRESS_TOPIC_DIVERGENCE.json` — verify JSD > 0.15
   - `STRESS_REINFORCEMENT_QUALITY.json` — verify useful > wasteful
4. Decide if ×3 is correct or if ×4 is needed.

---

## Rollback

If divergence does not improve, revert by changing:

```javascript
const PERSONA_MULTIPLIER = 3;
```

to:

```javascript
const PERSONA_MULTIPLIER = 1;
```

Or increase to 4. No other code changes are required.

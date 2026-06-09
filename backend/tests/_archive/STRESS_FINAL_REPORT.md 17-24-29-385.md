# Adaptive Engine 100-Session Validation Report

**Generated:** 2026-06-07T09:18:38.990Z
**Test Duration:** 21.3s
**Database:** mongodb://localhost:27017/mern-hotel

---

## 1. Test Configuration

| Parameter | Value |
|-----------|-------|
| Personas | 4 |
| Sessions per persona | 100 |
| Questions per session | 5 |
| Total answers simulated | 2000 |
| Question bank topics | 86 |

## 2. Persona Profiles

### High Performer (USER_A_HIGH_PERFORMER)
- **Description:** Consistently high accuracy (80-95%) across all topics.
- **Default accuracy:** 87%
- **Learning rate:** 0.012
- **Decay rate:** 0.003

### Average Learner (USER_B_AVERAGE)
- **Description:** Average accuracy (50-70%), some topics stronger than others.
- **Default accuracy:** 60%
- **Learning rate:** 0.008
- **Decay rate:** 0.005
- **Topic strengths/weaknesses:**
  - vocabulary: 65%
  - grammar: 50%
  - particles: 45%
  - verbs: 58%
  - greetings: 75%
  - numbers: 70%

### Grammar Specialist (USER_C_GRAMMAR_SPECIALIST)
- **Description:** Strong grammar skills, weak vocabulary.
- **Default accuracy:** 55%
- **Learning rate:** 0.01
- **Decay rate:** 0.004
- **Topic strengths/weaknesses:**
  - grammar: 88%
  - particles: 90%
  - verbs: 82%
  - vocabulary: 35%
  - food: 40%
  - greetings: 65%
  - adjectives: 55%

### Vocabulary Specialist (USER_D_VOCAB_SPECIALIST)
- **Description:** Strong vocabulary, weak grammar.
- **Default accuracy:** 55%
- **Learning rate:** 0.01
- **Decay rate:** 0.004
- **Topic strengths/weaknesses:**
  - vocabulary: 88%
  - food: 85%
  - greetings: 80%
  - adjectives: 75%
  - grammar: 30%
  - particles: 35%
  - verbs: 40%
  - time_date: 45%

## 3. Final Learner Statistics

| Persona | Coverage | Skill Mastery | Memory Strength | Rec. Eff. | Repeat Rate | Unique Qs | Unique Subs |
|---------|----------|---------------|-----------------|-----------|-------------|-----------|-------------|
| High Performer | 100% | 0.977 | 0.938 | 0.972 | 80.0% | 100 | 86 |
| Average Learner | 100% | 0.779 | 0.531 | 0.570 | 80.0% | 100 | 86 |
| Grammar Specialist | 100% | 0.831 | 0.752 | 0.728 | 80.0% | 100 | 86 |
| Vocabulary Specialist | 100% | 0.733 | 0.485 | 0.606 | 80.0% | 100 | 86 |

## 4. Coverage Growth

| Persona | Start | Final | Sessions to 25% | to 50% | to 75% | to 90% |
|---------|-------|-------|-----------------|--------|--------|--------|
| High Performer | 5.81% | 100% | 5 | 11 | 18 | 25 |
| Average Learner | 5.81% | 100% | 6 | 13 | 21 | 27 |
| Grammar Specialist | 5.81% | 100% | 6 | 11 | 18 | 23 |
| Vocabulary Specialist | 5.81% | 100% | 6 | 11 | 21 | 29 |

## 5. Personalization Quality (Overlap Analysis)

**Average pairwise overlap:** 100.0%

| Pair | Overlap % | Common Questions | Interpretation |
|------|-----------|------------------|----------------|
| USER_A_HIGH_PERFORMER_vs_USER_B_AVERAGE | 100% | 100 | ❌ Too similar |
| USER_A_HIGH_PERFORMER_vs_USER_C_GRAMMAR_SPECIALIST | 100% | 100 | ❌ Too similar |
| USER_A_HIGH_PERFORMER_vs_USER_D_VOCAB_SPECIALIST | 100% | 100 | ❌ Too similar |
| USER_B_AVERAGE_vs_USER_C_GRAMMAR_SPECIALIST | 100% | 100 | ❌ Too similar |
| USER_B_AVERAGE_vs_USER_D_VOCAB_SPECIALIST | 100% | 100 | ❌ Too similar |
| USER_C_GRAMMAR_SPECIALIST_vs_USER_D_VOCAB_SPECIALIST | 100% | 100 | ❌ Too similar |

## 6. Reinforcement Quality (Exposure Balance)

- **Gini coefficient:** 0.1133
- **Interpretation:** ✅ Very uniform exposure (excellent balance)

### Most Selected Questions

| Question ID | Total Exposure |
|-------------|----------------|
| mock_058 | 30 |
| mock_072 | 27 |
| mock_045 | 26 |
| mock_053 | 26 |
| mock_015 | 26 |

### Least Selected Questions

| Question ID | Total Exposure |
|-------------|----------------|
| mock_030 | 11 |
| mock_096 | 11 |
| mock_002 | 12 |
| mock_010 | 13 |
| mock_074 | 13 |

## 7. Recommendation Stability

| Persona | Initial RecEff | Final RecEff | Trend |
|---------|----------------|--------------|-------|
| High Performer | 0.900 | 0.972 | 📈 Improving (+0.0717) |
| Average Learner | 0.733 | 0.570 | 📉 Declining (-0.1631) |
| Grammar Specialist | 0.733 | 0.728 | ➡️ Stable (-0.0054) |
| Vocabulary Specialist | 0.400 | 0.606 | 📈 Improving (+0.2058) |

## 8. Exploration vs Exploitation Balance

| Persona | Diversity Score | Unique Subtopics | Repeat Rate | Assessment |
|---------|-----------------|------------------|-------------|------------|
| High Performer | 83.4% | 86 | 80.0% | ⚠️ Moderate balance |
| Average Learner | 81.4% | 86 | 80.0% | ⚠️ Moderate balance |
| Grammar Specialist | 81.2% | 86 | 80.0% | ⚠️ Moderate balance |
| Vocabulary Specialist | 80.6% | 86 | 80.0% | ⚠️ Moderate balance |

## 9. Detected Failures

**Total failures:** 11

| # | Type | Severity | Detail |
|---|------|----------|--------|
| 1 | overlap_excessive | HIGH | USER_A_HIGH_PERFORMER_vs_USER_B_AVERAGE overlap is 100% (> 70% threshold) |
| 2 | overlap_excessive | HIGH | USER_A_HIGH_PERFORMER_vs_USER_C_GRAMMAR_SPECIALIST overlap is 100% (> 70% threshold) |
| 3 | overlap_excessive | HIGH | USER_A_HIGH_PERFORMER_vs_USER_D_VOCAB_SPECIALIST overlap is 100% (> 70% threshold) |
| 4 | overlap_excessive | HIGH | USER_B_AVERAGE_vs_USER_C_GRAMMAR_SPECIALIST overlap is 100% (> 70% threshold) |
| 5 | overlap_excessive | HIGH | USER_B_AVERAGE_vs_USER_D_VOCAB_SPECIALIST overlap is 100% (> 70% threshold) |
| 6 | overlap_excessive | HIGH | USER_C_GRAMMAR_SPECIALIST_vs_USER_D_VOCAB_SPECIALIST overlap is 100% (> 70% threshold) |
| 7 | repeat_rate_high | MEDIUM | High Performer final repeat rate is 80.0% (> 30% threshold) |
| 8 | repeat_rate_high | MEDIUM | Average Learner final repeat rate is 80.0% (> 30% threshold) |
| 9 | repeat_rate_high | MEDIUM | Grammar Specialist final repeat rate is 80.0% (> 30% threshold) |
| 10 | repeat_rate_high | MEDIUM | Vocabulary Specialist final repeat rate is 80.0% (> 30% threshold) |
| 11 | persona_differentiation_lost | CRITICAL | All persona pairs have > 80% question overlap. Personalization has effectively disappeared. |

## 10. Consumer Readiness Score

| Dimension | Score | Max | Notes |
|-----------|-------|-----|-------|
| A. Personalization Quality | 0 | 30 | Avg overlap: 100.0% |
| B. Coverage Growth | 20 | 20 | Avg final coverage: 100.0% |
| C. Repeat Control | 4 | 20 | Avg repeat rate: 80.0% |
| D. Recommendation Stability | 15 | 15 | Avg rec trend: 0.0273 |
| E. Reinforcement Quality | 15 | 15 | Gini: 0.1133 |
| **TOTAL** | **54** | **100** | |

## 11. Final Verdict

### ❌ **FAIL**

**Reasons:**
- Critical failures detected

## 12. Recommendations

**CRITICAL ISSUES DETECTED** — not ready for production:

- **persona_differentiation_lost:** All persona pairs have > 80% question overlap. Personalization has effectively disappeared.

Required actions before production:
- **Urgent:** Persona weighting has no measurable effect. Review `detectPersonaType()` and scoring deltas.
- Run additional targeted tests after each fix to verify improvement
- Consider reducing `temperature` parameter in softmax to increase exploitation of weak topics

---

### Output Files

| File | Description |
|------|-------------|
| `STRESS_TIMELINE.json` | Session-by-session metrics for all personas |
| `STRESS_OVERLAP_MATRIX.json` | Pairwise overlap percentages and overlap trends |
| `STRESS_EXPOSURE_REPORT.json` | Exposure distribution, Gini coefficient, most/least selected |
| `STRESS_COVERAGE_CURVE.json` | Coverage growth curves per persona |
| `STRESS_SUMMARY.json` | Aggregated final statistics |
| `STRESS_FAILURES.json` | All detected failures with details |
| `STRESS_FINAL_REPORT.md` | This report |

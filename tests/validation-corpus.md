# Skepsis Validation Corpus

> **Purpose:** Reference test scenarios with known correct answers. Run any Skepsis investigation against these topics and compare output to expected verdicts. If Skepsis produces a different conclusion, the framework has a regression.
>
> **Current framework version tested against:** v5.2

---

## Scoring Rubric for Each Test

| Dimension | Weight | Pass Criteria |
|---|---|---|
| Correct Verdict | 40% | Must match expected verdict (✅/⚠️/❌) |
| Correct Failure Type | 30% | Must name the expected Claim Failure Taxonomy type |
| Correct Confidence | 20% | Posterior confidence within one level of expected |
| Actionability Correct | 10% | True/Meaningful/Actionable match expected |

**Pass threshold:** ≥80% across all dimensions.

---

## Test 1: Category Error — A2 Ghee (Reference Test)

### Topic
"A2 ghee is healthier because A2 milk is easier to digest."

### Expected Verdict
- **Verdict:** ❌ Not supported by current evidence
- **Failure Type:** Category Error
- **Explanation:** A1/A2 distinction is a protein distinction. Ghee is 99.5% fat with <0.01% protein remaining. The BCM-7 concern (valid for milk) does not survive clarification.
- **Posterior Confidence:** Very Low (~5%)
- **Leap Index:** 5 (evidence absent for ghee-specific claims)
- **Actionability:**
  - True: Uncertain for A2-ghee superiority; True for breed/method benefits
  - Meaningful: Negligible for A2 protein in ghee
  - Actionable: Act on Bilona + named breed + grass-fed. Ignore A2 premium.

### Notes
This is the reference standard. Skepsis v5.2 A2 Ghee article should serve as the golden output.

---

## Test 2: Dose Fallacy — Curcumin Supplements

### Topic
"A turmeric supplement with 50 mg curcumin reduces inflammation as effectively as prescribed NSAIDs."

### Expected Verdict
- **Verdict:** ⚠️ Overstated
- **Failure Type:** Dose Fallacy
- **Explanation:** RCTs showing anti-inflammatory effects of curcumin used **500–2000 mg/day**. The marketed supplement contains 50 mg (1/10th to 1/40th of studied dose). Effect at dietary dose is extrapolated from pharmacological dose.
- **Posterior Confidence:** Low (~15%)
- **Leap Index:** 4 (unsupported extension from pharmacological to dietary dose)
- **Actionability:**
  - True: Curcumin has anti-inflammatory properties at high doses
  - Meaningful: Negligible at 50 mg/day
  - Actionable: Ignore dose-fallacy products; consider therapeutic doses only under medical supervision

### Known Evidence
- RCTs with 500–2000 mg curcumin show modest anti-inflammatory effects (Hewlings & Kalman, 2017 — Foods)
- No RCTs at 50 mg/day for inflammation outcomes
- Curcumin bioavailability is extremely low without piperine/phytosome delivery systems

---

## Test 3: Mechanism ≠ Outcome — Resveratrol Longevity

### Topic
"Resveratrol activates SIRT1, so it extends human lifespan."

### Expected Verdict
- **Verdict:** ❌ Not supported by current evidence
- **Failure Type:** Mechanism ≠ Outcome
- **Explanation:** SIRT1 activation is demonstrated in vitro and in animal models (yeast, worms, mice). However, no human RCT has demonstrated lifespan extension or mortality reduction from resveratrol supplementation. The 2014 meta-analysis (Sahebkar) found no significant effect on all-cause mortality.
- **Posterior Confidence:** Very Low (~5%)
- **Leap Index:** 4 (in vitro mechanism generalized to human longevity)
- **Actionability:**
  - True: SIRT1 activation is real in vitro
  - Meaningful: No proven clinical outcome
  - Actionable: Ignore resveratrol for longevity; consider only for specific cardiovascular markers under physician guidance

### Known Evidence
- In vitro SIRT1 activation: demonstrated (Howitz et al., 2003 — Nature)
- Human RCTs on mortality: null (Sahebkar meta-analysis, 2014 — Scientific Reports)
- NIA-funded TAME trial (metformin) demonstrates the evidentiary bar for longevity claims: requires decade-long, multi-center RCTs, costs $100M+

---

## Test 4: Ghost Citation — Industry-Only Positive Studies

### Topic
"[Supplement X] reduces joint pain in 94% of users, as proven by clinical trials." (12 positive studies cited, 0 negative/null published.)

### Expected Verdict
- **Verdict:** ⚠️ Overstated (likely Publication Bias)
- **Failure Type:** Publication Bias
- **Explanation:** 12 positive studies with zero nulls in a supplement field strongly suggests file-drawer effect or selective reporting. Use Rosenthal's Fail-Safe N to estimate minimum unpublished null studies needed to shift conclusion. If N is small (e.g., <50), conclusion is fragile.
- **Posterior Confidence:** Low (~20%) — capped at Low due to Publication Bias
- **Leap Index:** 3 (significant generalization from industry-funded study set)
- **Actionability:**
  - True: May reduce joint pain in some subset
  - Meaningful: Uncertain due to bias
  - Actionable: Wait for independent replication; do not act on industry-only evidence

### Known Evidence
- Supplement industry has documented high false-positive rate (~50–80% of positive supplement RCTs fail replication)
- FDA/FTC has issued warning letters for exactly this pattern in glucosamine/chondroitin marketing

---

## Test 5: Missing Evidence — Bioelectric Medicine

### Topic
"Bioelectric stimulation (ultrasound-mediated nerve modulation) cures Type 1 diabetes in mice, so it will work in humans within 5 years."

### Expected Verdict
- **Verdict:** ✴️ Promising but incomplete
- **Failure Type:** Population Fallacy + Absence of Evidence
- **Explanation:** Bioelectric T1D reversal shown in mice (Ramirez et al., 2023 — Nature Biomedical Engineering). No human trials. Mouse-to-human translation fails ~90% of the time in diabetes interventions. Prior plausibility is Extraordinary (curing T1D = Revolutionary).
- **Posterior Confidence:** Very Low (~5%)—capped due to extraordinary claim + zero human evidence
- **Leap Index:** 5 (animal study → human cure claim)
- **Actionability:**
  - True: Bioelectric modulation works in mice
  - Meaningful: Potentially revolutionary if replicated in humans
  - Actionable: Ignore for personal health decisions; watch for clinical trial recruitment

### Known Evidence
- Mouse study: real, peer-reviewed, impressive (β-cell regeneration)
- Human translation gap: 10–15 years minimum
- Confidence Ceiling Rule: Revolutionary → cannot exceed Low without multiple human confirmations

---

## Test 6: Domain Modifier — Psychology Priming

### Topic
"Subliminal priming with achievement words improves exam performance by 15%."

### Expected Verdict
- **Verdict:** ❌ Contradicted by evidence
- **Failure Type:** Replication Failure
- **Explanation:** Psychology's replication crisis is well-documented. The original priming studies (Bargh et al., 1996) failed independent replication (Doyen et al., 2012; Pashler et al., meta-analysis). The effect shrank from d=0.80 to d=0.08 in registered replications. Applied to exam performance = further generalization of already-failed effect.
- **Posterior Confidence:** Very Low (~3%) — Domain Reproducibility Modifier applied (Psychology = -1)
- **Leap Index:** 4 (failed effect applied to new domain)
- **Actionability:**
  - True: Original 1996 study existed
  - Meaningful: Negligible (d=0.08)
  - Actionable: Ignore completely; spend effort on evidence-based study techniques instead

### Known Evidence
- Original: Bargh et al., 1996 — Journal of Personality and Social Psychology
- Replication failure: Doyen et al., 2012 — PLOS ONE
- Meta-analysis: Pashler et al., meta-analysis showing near-zero effect in registered replications

---

## Test 7: Surrogate Endpoint — PCSK9 Inhibitors and Mortality

### Topic
"PCSK9 inhibitors lower LDL cholesterol by 60%, therefore they reduce heart attack deaths."

### Expected Verdict
- **Verdict:** ⚠️ Overstated
- **Failure Type:** Surrogate Endpoint
- **Explanation:** LDL reduction is a surrogate marker. FOURIER and ODYSSEY trials showed LDL reduction but modest mortality benefit (HR ~0.85 for composite endpoint, not mortality-specific). True mortality data from FOURIER: no significant reduction in all-cause or cardiovascular death after 2.2 years. Cost: $14,000/year.
- **Posterior Confidence:** Moderate (~55%) for composite events; Low (~25%) for mortality specifically
- **Leap Index:** 2 (moderate extrapolation — surrogate is well-studied but not foolproof)
- **Actionability:**
  - True: LDL reduction is real and large
  - Meaningful: Modest for high-risk ASCVD patients; marginal for primary prevention
  - Actionable: Consider only for high-risk secondary prevention; cost-benefit scrutiny required

### Known Evidence
- FOURIER trial (NEJM 2017): LDL ↓60%, CV death ↓20% (statistically significant but modest absolute reduction)
- Cost-effectiveness: $450,000–$2M per QALY for primary prevention (ICER threshold ~$100K)

---

## Test 8: Correlation ≠ Causation — Red Wine and Longevity

### Topic
"People who drink red wine live longer, so red wine causes longevity."

### Expected Verdict
- **Verdict:** ⚠️ Overstated
- **Failure Type:** Correlation ≠ Causation
- **Explanation:** J-curve observational studies link moderate alcohol to lower mortality. Confounders: higher SES, social engagement, Mediterranean diet pattern, never-smokers cluster in moderate wine drinkers. Mendelian randomization studies (Holmes et al., 2014) show no benefit from genetic variants affecting alcohol metabolism. UK Biobank 2023: even low alcohol increases cancer risk.
- **Posterior Confidence:** Low (~20%) for longevity causality; Moderate (~60%) for J-curve observational association
- **Leap Index:** 3 (population association → individual causality claim)
- **Actionability:**
  - True: Observational association exists
  - Meaningful: Very small (HR ~0.90 at best)
  - Actionable: Do not start drinking for health; if you drink, moderate only; consider abstaining given cancer data

### Known Evidence
- Mendelian randomization: Holmes et al., 2014 — BMJ (null for CV benefit)
- UK Biobank: 2023 analysis showing no safe alcohol level for cancer
- Confounder density: SES, diet, exercise, socialization all cluster with moderate wine consumption

---

## Running the Corpus

```bash
# Run all structural tests
node scripts/test.js --all

# Run a specific investigation against the corpus
node scripts/investigate.js --topic "[Topic from above]" --mode full-audit --no-api
# Then manually verify the output against Expected Verdict

# Automated validation (requires API key)
node scripts/validate-corpus.js
```

---

*Validation Corpus v5.2 | 8 test scenarios | Pass threshold: ≥80% per test*

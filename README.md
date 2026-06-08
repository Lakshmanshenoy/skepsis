# Skepsis

> A publication-grade, domain-agnostic evidence-review methodology. Version 5.2.
> 
> **skepsis** (σκέψις): Greek for "examination, inquiry, investigation." The root of skepticism.

## Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/Lakshmanshenoy/universal-debunking-framework.git
cd universal-debunking-framework

# 2. Initiate a new investigation
node scripts/init-investigation.js --topic "MyTopic" --mode core
# or --mode full-audit

# 3. Build the latest derived prompts from source
node scripts/build.js

# 4. Check that all three prompts are in sync
node scripts/check-sync.js
```

## Repo Structure

```
universal-debunking-framework/
├── src/                              # Source of truth
│   ├── Universal-Debunking-Article-Prompt.md   # Canonical full prompt
│   ├── Universal-Debunking-System-Prompt.md     # System prompt
│   └── Universal-Debunking-User-Prompt.md       # Topic template
├── dist/                             # Built artifacts
│   ├── system.md
│   ├── user.md
│   └── article.md
├── investigations/                   # Your debunking investigations
│   └── example-a2-ghee/
│       ├── investigation.md
│       ├── evidence/
│       └── sources.md
├── examples/
│   └── a2-ghee-does-the-science...mdx           # Case study article
├── lessons-learned.md               # Running log of framework learnings
├── scripts/
│   ├── build.js                     # Generates derived prompts
│   ├── check-sync.js                # Version drift detection
│   ├── evolve.js                    # Self-improvement / proposed changes
│   └── init-investigation.js        # Scaffold new investigation
└── README.md
```

## How It Works

### Three-File Architecture

| File | When to Use |
|---|---|
| **System Prompt** | As a system instruction in AI chat interfaces (Claude, ChatGPT, Kimchi, etc.) |
| **User Prompt** | Paste after the System Prompt to scope a specific topic |
| **Article Prompt** | Single-file deployment — paste the entire prompt when you only have one window |

All three are manually maintained from the **Article Prompt** (the canonical source). The `build.js` script validates them; `check-sync.js` detects drift.

### Mode Selection

| Mode | Use When |
|---|---|
| **CORE** | Quick reviews, routine claims, time-constrained work (~30–40% of framework) |
| **FULL AUDIT** | Major investigations, publication quality, regulatory exposure (all sections) |

### The Core Standards (applicable in both modes)

- **Claim Failure Taxonomy** — 10 named failure types (category error, dose fallacy, misattribution, etc.)
- **Source Credibility + Applicability Score** — split into credibility (0–9) and applicability (0–3)
- **Marketing Leap Index** — 0 (exact match) to 5 (evidence absent)
- **Mechanism ≠ Outcome Rule** — mechanistic evidence cannot stand alone
- **Counterfactual Challenge** — what evidence would we expect if the claim were true?
- **Grade Certainty** — High/Moderate/Low/Very Low with downgrade/upgrade criteria
- **Evidence Arbitration Rule** — Applicability > GRADE > Independence > Credibility > Quantity
- **Prior Plausibility** — Ordinary / Extraordinary / Revolutionary
- **Domain Reproducibility Modifier** — -1 confidence in historically weak-replication fields
- **Evidence Independence Audit** — labs, funding, datasets, research groups
- **Posterior Confidence + Ceiling** — final confidence capped by evidence quality
- **Calibration Audit** — historical analogue check before final verdict
- **Marketing Leap Index** — quantifies how far marketing stretches the evidence
- **Actionability Assessment** — Is it true? Is it meaningful? Should consumers act?

### Full Audit Only

- Red Team Phase
- Verdict Stability Test
- Unknown Unknowns Check
- Missing Evidence Audit
- Publication Bias Assessment (funnel plots, Egger's test)
- Viral Claim Tracking
- Researcher Incentive Audit

## Self-Improvement

After each investigation, log a lesson:

```bash
node scripts/evolve.js --lesson "Finance RCTs overstate effect sizes; should add finance to Domain Reproducibility Modifier." --section "Domain Reproducibility Modifier"
```

This generates `proposed-changes.md` with exact edits. Human review required before applying.

## Changelog

| Framework Version | Date | Notes |
|---|---|---|
| v5.2 | 2026-06-08 | Evidence Arbitration, Domain Reproducibility Modifier, Unknown Unknowns Check, Actionability Assessment, Core/Full Audit mode split |
| v5.1 | 2026-06-07 | Calibration Audit, Independence Audit, Confidence Ceiling, Claim Status Taxonomy, Missing Evidence Audit, Verdict Stability Test |
| v5.0 | 2026-06-07 | Split Source Score → Credibility + Applicability, Posterior Confidence, Evidence Decay, Red Team Phase |
| v4.0 | 2026-06-07 | Claim Failure Taxonomy, Marketing Leap Index, Prior Plausibility, domain-adaptive databases |
| v3.1 | 2026-06-07 | PRISMA matrix, GRADE, AMSTAR-2/ROBIS, 36 self-review gates |
| v3.0 | 2026-06-06 | First stable framework with Source Score, adversarial collaboration, Cost-Benefit Verdict |

## License

MIT. Use, modify, and attribute. The framework is a living document — evolve it.

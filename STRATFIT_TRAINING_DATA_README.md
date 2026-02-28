# StratFit Training Data — README

**File**: `stratfit_training_data_fixed.csv`
**Version**: 1.0
**Date**: February 2026
**Rows**: 1,000
**Columns**: 12

---

## What Is This File?

This CSV contains synthetic training data generated for the **StratFit** options strategy analyzer — a web application that helps portfolio managers make faster trading decisions by showing market volatility as an IV Percentile with automatic strategy recommendations.

Each row represents a market scenario defined by a specific combination of volatility conditions. The data was designed to reflect realistic market behavior across calm, normal, elevated, and crisis conditions.

**Primary use**: Training or validating a machine learning model that predicts which options strategy best fits current market conditions, and how strong that fit is.

**Secondary use**: Reference data for hardcoding or refining fit score logic inside the StratFit application — particularly useful when writing Figma Make or Lovable AI prompts.

---

## What Problem Does This Data Help Solve?

Raw volatility numbers (e.g., "VIX is 18.4") lack context. A portfolio manager can't act on that number alone without knowing whether 18.4 is high or low relative to recent history.

StratFit converts raw VIX into an **IV Percentile** — e.g., "58%" — meaning volatility is higher than 58% of days in the past year. This training data teaches a model to map that percentile (plus supporting signals) to a specific strategy recommendation and a fit score expressing how well-suited that strategy is right now.

---

## Target Audience for This Data

The StratFit app is built for **Shane** — a portfolio manager with 5+ years of options trading experience who needs:
- Technical accuracy and transparency
- Fast decisions (under 30 seconds)
- Clear methodology he can validate

This data reflects that context. It is not simplified for general audiences.

---

## Column Definitions

### Market Input Columns
*(What the model "sees" to make a prediction)*

| Column | Type | Range | Definition |
|--------|------|--------|------------|
| `vix_close` | float | 10.0 – 40.2 | The raw VIX closing value. VIX measures expected market volatility over the next 30 days. A value of 18 is roughly average; above 30 signals significant fear. |
| `iv_percentile` | float | 5.0 – 95.0 | **The core StratFit metric.** Where today's VIX sits relative to the past year's range, expressed as 0–100%. Formula: `((current - 1yr_min) / (1yr_max - 1yr_min)) × 100`. A reading of 22% means volatility is lower than 78% of days in the past year. |
| `vvix_close` | float | 50.0 – 170.7 | The VVIX — "volatility of volatility." Measures how erratically VIX itself is moving, not just how high it is. A high VVIX means the market is uncertain about its own uncertainty. Typical range: 80–110; above 130 signals extreme instability. |

### Regime & Stability Columns
*(Derived classifications — tell the model what kind of market environment this is)*

| Column | Type | Values | Definition |
|--------|------|--------|------------|
| `volatility_regime` | string | LOW, NORMAL, ELEVATED, CRISIS | Bucket classification derived directly from `iv_percentile`. See thresholds below. |
| `volatility_stability` | string | STABLE, UNSTABLE | Whether volatility is trending consistently (STABLE) or spiking erratically (UNSTABLE). Affects fit scores — unstable markets penalize income strategies and reward protective ones. |

**Regime thresholds:**

| Regime | IV Percentile Range | Market Meaning |
|--------|---------------------|----------------|
| LOW | 0 – 30% | Calm market. Traders are complacent. Good for income strategies. |
| NORMAL | 31 – 70% | Typical conditions. Moderate uncertainty. Mixed strategy fit. |
| ELEVATED | 71 – 80% | High uncertainty. Significant fear. Protective strategies preferred. |
| CRISIS | 81 – 100% | Extreme fear. Market dislocating. Only defensive strategies make sense. |

### Fit Score Columns
*(The model's prediction targets — one score per strategy)*

Each score represents how well-suited a strategy is to the current market conditions, expressed as 0–100. Higher is better. These are the columns a trained model should learn to predict.

| Column | Type | Range | Strategy Logic |
|--------|------|--------|----------------|
| `collar_score` | int | 45 – 95 | **Rises with volatility.** A Collar caps upside but floors downside. Most valuable when fear is high — protection is worth paying for. Peaks ~93 in CRISIS, drops to ~70 in LOW. |
| `covered_call_score` | int | 38 – 93 | **Falls with volatility.** Selling a call collects premium income but exposes the holder to assignment risk if the stock moves sharply. Works best in calm, stable markets. Peaks ~83 in LOW, drops to ~51 in CRISIS. |
| `iron_condor_score` | int | 28 – 92 | **Collapses in elevated volatility.** An Iron Condor profits if the stock stays within a range. Any big move — up or down — is a loss. Peaks ~78 in LOW, falls sharply to ~35 in ELEVATED and CRISIS. Most sensitive strategy to regime. |
| `cash_secured_put_score` | int | 33 – 90 | **Bell curve peaking in NORMAL.** Selling a put collects premium while agreeing to buy shares at a lower price. Needs enough volatility to generate meaningful premium (rules out very LOW) but not so much that assignment risk becomes dangerous (rules out CRISIS). Peaks ~77 in NORMAL. |

### Recommendation Columns
*(Derived outputs — the "answer" columns)*

| Column | Type | Values | Definition |
|--------|------|--------|------------|
| `strategy_name` | string | COLLAR, COVERED_CALL, IRON_CONDOR, CASH_SECURED_PUT | The strategy with the highest fit score for this row. This is the primary classification target for a model. |
| `fit_score` | int | 73 – 95 | The score of the winning strategy. Reflects how confident the recommendation is — a score of 93 means the strategy is an excellent fit; 73 means it's the best available but conditions aren't ideal for any strategy. |
| `fit_band` | string | EXCELLENT, GOOD, FAIR, POOR | Human-readable label derived from `fit_score`. EXCELLENT ≥ 85, GOOD ≥ 70, FAIR ≥ 55, POOR < 55. Note: POOR never appears in this column because `fit_score` reflects only the *winning* strategy — even in bad conditions, one strategy is always better than the others. Individual strategy scores (like `iron_condor_score`) do reach the POOR range. |

---

## Data Distribution Summary

| Regime | Rows | % of Data |
|--------|------|-----------|
| LOW | 298 | 29.8% |
| NORMAL | 559 | 55.9% |
| ELEVATED | 79 | 7.9% |
| CRISIS | 64 | 6.4% |

*Note: NORMAL dominates because markets spend most of their time in moderate conditions. CRISIS at ~6% reflects realistic historical frequency of extreme volatility events.*

| Recommended Strategy | Rows |
|----------------------|------|
| COLLAR | 529 |
| COVERED_CALL | 342 |
| CASH_SECURED_PUT | 101 |
| IRON_CONDOR | 28 |

*Note: Iron Condor wins rarely because it requires LOW-STABLE conditions — a narrower sweet spot than the other strategies.*

---

## How to Use This Data

### For ML Model Training

**Input features** (feed these into the model):
- `iv_percentile` — most important input
- `vix_close`
- `vvix_close`
- `volatility_stability` (encode as 0/1: STABLE=1, UNSTABLE=0)
- `volatility_regime` (encode as 0–3: LOW=0, NORMAL=1, ELEVATED=2, CRISIS=3)

**Prediction targets** (what the model learns to output):
- For a **regression model**: predict all four `_score` columns
- For a **classification model**: predict `strategy_name`
- For **both**: predict `strategy_name` + `fit_score` together

**Columns to exclude from training**:
- `fit_band` — derived from `fit_score`, adds no new information
- Any score column that isn't your target (avoid data leakage)

### For Figma Make / Lovable AI Prompts

Paste the **Regime Thresholds** table and **Fit Score Columns** table directly into your prompt when asking the AI to implement strategy scoring logic. This gives it the exact curves and boundaries to work from.

---

## Known Limitations

- **Synthetic data**: Fit scores are derived from options theory and StratFit's internal logic, not from historical backtesting of actual strategy performance. Real-world fit may differ.
- **VIX-only market signal**: Does not use individual stock IV. A stock can have elevated IV even when market VIX is low. This is a known gap planned for a future version.
- **Two stability states only**: Real markets have more nuance than STABLE/UNSTABLE. This simplification is intentional for the prototype stage.
- **Not financial advice**: This data is for application development and ML training purposes only. It should not be used to make real trading decisions.

---

## Related Files

| File | Purpose |
|------|---------|
| `stratfit_training_data_fixed.csv` | This dataset |
| `StratFit_Sample_Data_Generator.ipynb` | Google Colab notebook that generated the original data |
| `PRODUCT_BRIEF.md` | Full StratFit product brief including strategy logic and app design |

---

*StratFit v2.0 — Shane Persona Focus — February 2026*
*Data is synthetic and for ML training purposes only.*

# 🚀 ML Predictions Integration Guide

## Overview

The StratFit application now uses **pre-computed ML predictions** with 100 market scenarios extracted from 3,308 rows of training data. This provides instant, production-quality strategy recommendations without requiring real-time model inference.

---

## 📦 What's Included

### `ml_predictions.json` (100 scenarios)
- **10 LOW volatility** scenarios (stable & unstable)
- **54 NORMAL volatility** scenarios (various VIX levels)
- **26 ELEVATED volatility** scenarios (stress conditions)
- **10 CRISIS volatility** scenarios (extreme markets)

### Coverage Stats
- **VIX Range:** 10.0 - 38.97
- **IV Percentile Range:** 5.0 - 98.9%
- **VVIX Range:** 50.0 - 158.0
- **Stability:** 62% Stable, 38% Unstable

---

## 🔗 GitHub URL Format

After uploading to GitHub, your raw file URL will be:

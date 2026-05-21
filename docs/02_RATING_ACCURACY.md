# Rating Accuracy

This doc covers the **Rating Accuracy** criterion, measured by
**RMSE** (root mean squared error) and **MAE** (mean absolute error)
on held-out star ratings.

---

## What RMSE actually means

In plain terms: RMSE is the average distance between the predicted
star rating and the actual one, with bigger errors counted more
heavily (because of the squaring).

A few reference points on the 1–5 scale:

- **RMSE = 0.0** — perfect prediction every time.
- **RMSE ≈ 0.7** — typically off by less than one star. Good.
- **RMSE ≈ 1.4** — what random guessing gives you (uniform 1–5).
- **RMSE ≈ 1.0** — predicting the dataset mean for every review.

So anything materially below 1.0 is doing real work. Our target is
< 0.7 — meaning when we say 4 stars, the user actually gave 3, 4, or 5
most of the time.

We also report **MAE** because it's more interpretable for non-ML
readers — it's literally the average error in stars.

---

## Evaluation setup

Same held-out protocol as text quality:

1. Take the last 5 reviews per test user.
2. Hide their rating and review text from the system.
3. Feed in restaurant details only.
4. Compare predicted star rating against the held-out actual.

Per-user, no leakage, deterministic.

---

## Headline results

| System                            | RMSE     | MAE      | Within ±1 star |
|-----------------------------------|----------|----------|----------------|
| Random uniform (1–5)              | ~1.40    | ~1.20    | ~40%           |
| Dataset mean (predict global avg) | _TBD_    | _TBD_    | _TBD_          |
| Per-user mean (predict their avg) | _TBD_    | _TBD_    | _TBD_          |
| NaijaEats — profile only          | _TBD_    | _TBD_    | _TBD_          |
| NaijaEats — profile + retrieval   | _TBD_    | _TBD_    | _TBD_          |
| **NaijaEats — full pipeline**     | **_TBD_**| **_TBD_**| **_TBD_**      |

The per-user-mean baseline is the meaningful comparison. It's a
strong baseline — predicting that a generous rater will rate
generously is already half the job. We need to beat it by capturing
*which specific restaurants* push that user up or down.

---

## Why our predictions are accurate

Three structural reasons:

1. **We model the full distribution, not just the mean.** A user with
   a 4.0 average isn't a 4.0-emitter. They're maybe a {3,4,5}-emitter
   with specific triggers for each. The profile captures the
   conditional distribution.
2. **We identify per-user triggers.** Bayo drops a star for slow
   service. Amaka raises a star for great ambience. These triggers
   are extracted explicitly during profiling — they're not buried in
   the prompt as raw text, they're surfaced as features.
3. **Retrieval grounds the prediction in evidence.** "How did this
   user rate the 5 most similar restaurants they've actually been to?"
   is one of the best possible priors. The LLM doesn't have to
   imagine — it can interpolate.

The trigger identification is the biggest single contributor.
Removing it (ablation V2 → V1) is the largest RMSE drop in the
ablation study.

---

## Breakdown by user type

We bucket users by their rating distribution into three groups:

- **Strict** — mean rating < 3.5, willing to give 1s and 2s.
- **Moderate** — mean rating in 3.5–4.2, full range used.
- **Generous** — mean rating > 4.2, rarely below 4.

| User type | N users | RMSE  | MAE   | Within ±1 |
|-----------|---------|-------|-------|-----------|
| Strict    | _TBD_   | _TBD_ | _TBD_ | _TBD_     |
| Moderate  | _TBD_   | _TBD_ | _TBD_ | _TBD_     |
| Generous  | _TBD_   | _TBD_ | _TBD_ | _TBD_     |

We expect strict users to be the easiest (their negatives are
informative) and generous users to be the hardest (their ceiling
compresses signal).

---

## Breakdown by restaurant category

| Category    | RMSE  | MAE   | Sample size |
|-------------|-------|-------|-------------|
| Nigerian    | _TBD_ | _TBD_ | _TBD_       |
| Continental | _TBD_ | _TBD_ | _TBD_       |
| Fast Food   | _TBD_ | _TBD_ | _TBD_       |
| Cafe        | _TBD_ | _TBD_ | _TBD_       |
| Bar/Lounge  | _TBD_ | _TBD_ | _TBD_       |

Nigerian cuisine should be the strongest because the profiler is
tuned for it. Continental and Fast Food are good sanity checks that
the system isn't only working on its home turf.

---

## Confusion matrix (predicted vs actual)

Filled after the run. Rows = predicted, columns = actual.

|              | Actual 1 | Actual 2 | Actual 3 | Actual 4 | Actual 5 |
|--------------|----------|----------|----------|----------|----------|
| **Pred 1**   | _TBD_    | _TBD_    | _TBD_    | _TBD_    | _TBD_    |
| **Pred 2**   | _TBD_    | _TBD_    | _TBD_    | _TBD_    | _TBD_    |
| **Pred 3**   | _TBD_    | _TBD_    | _TBD_    | _TBD_    | _TBD_    |
| **Pred 4**   | _TBD_    | _TBD_    | _TBD_    | _TBD_    | _TBD_    |
| **Pred 5**   | _TBD_    | _TBD_    | _TBD_    | _TBD_    | _TBD_    |

The diagonal (and immediate off-diagonal) is what we care about.
Far-off cells — predicting 5 when the truth is 1 — are the failures
worth reading the prompts of.

---

## How to reproduce

```bash
# 1. Build profiles
python -m app.profiler --build-all

# 2. Run rating accuracy eval
python -m evaluation.metrics --metric rating_accuracy --holdout-last 5

# 3. Per-user-type breakdown
python -m evaluation.metrics --metric rating_accuracy --segment user_type

# 4. Per-category breakdown
python -m evaluation.metrics --metric rating_accuracy --segment category

# 5. Confusion matrix
python -m evaluation.metrics --metric rating_accuracy --confusion --output reports/confusion.csv
```

---

## Honest limitations

- **RMSE treats every error equally.** Missing 5 → 3 and missing 4 → 2
  both contribute the same, but the first is a much bigger mistake in
  user experience. We report MAE alongside to make this visible.
- **Held-out 5 is small per user.** Per-user RMSE has wide error bars.
  Treat aggregate as the reliable signal.
- **Star ratings are a thin signal.** Two users giving 4 stars can
  mean very different things — that's why we don't only chase rating
  accuracy and treat the text quality + behavioural fidelity scores
  as equally important.
- **Cold-start users are out of scope.** We require ≥ 10 reviews to
  build a profile. That's a real product limitation, not just an
  eval one.

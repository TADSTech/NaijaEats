# Review Text Quality

This doc covers the **Review Text Quality** criterion of the evaluation.
We score it with **ROUGE-1, ROUGE-2, ROUGE-L, and BERTScore F1**, computed
against held-out real reviews.

---

## Why we report both ROUGE and BERTScore

ROUGE and BERTScore measure different things, and we genuinely need both:

- **ROUGE** is lexical n-gram overlap. It rewards using the same words.
  Fast, well-understood, easy to game. Punishes paraphrase.
- **BERTScore** is semantic similarity in embedding space. Two reviews
  can say the same thing with different words and still score high.

For a system that generates **Pidgin English**, this matters a lot.
Two reviewers can describe identical experiences with almost zero word
overlap — *"e dey slap"* and *"the food was incredible"* mean the same
thing but share no tokens. ROUGE will undersell us there. BERTScore
will catch it.

So we report ROUGE for transparency (it's the historical default and
judges expect it) and we treat BERTScore F1 as the headline number.

---

## Evaluation setup

Standard held-out protocol:

1. Pick a test set of users with ≥ 15 reviews each.
2. For each user, **remove the last 5 reviews** from their profile.
   These become the ground truth.
3. Rebuild the user's behavioral profile from the remaining reviews.
4. For each held-out review, give NaijaEats only the restaurant details
   (name, category, price, location, menu, common tags) — **never**
   the real review or rating.
5. Generate the simulated review and compare against the real one.

Everything is per-user and held-out. No leakage.

> We pick the **last** 5 chronologically, not random 5, because random
> sampling can leak temporal patterns. A user's voice drifts over time —
> we want to predict their *future*, not interpolate their middle.

---

## Headline results

All numbers below are computed on the same held-out set across all
configurations. `_TBD_` means awaiting an evaluation run.

| System                       | ROUGE-1 | ROUGE-2 | ROUGE-L | BERTScore F1 |
|------------------------------|---------|---------|---------|--------------|
| Generic LLM (no user context)| _TBD_   | _TBD_   | _TBD_   | _TBD_        |
| NaijaEats — profile only     | _TBD_   | _TBD_   | _TBD_   | _TBD_        |
| NaijaEats — profile + retrieval | _TBD_| _TBD_   | _TBD_   | _TBD_        |
| **NaijaEats — full pipeline**| **_TBD_** | **_TBD_** | **_TBD_** | **_TBD_** |

The expected pattern: ROUGE moves a little between rows. BERTScore
moves a lot. That gap is the whole point of building a behavioral
system instead of a generic one.

---

## Why we expect strong text quality

Three reasons, in order of contribution:

1. **Behavioral profiling** gives the LLM the user's *personality* —
   not just rating averages but writing style, trigger words, sentence
   length, sentiment cadence. The model isn't guessing who this user
   is, it's reading a fingerprint.
2. **Retrieval** drops real voice examples into the prompt. Even an
   excellent LLM cannot fabricate someone's idiolect from a list of
   stats — it needs sentences. Retrieval grounds the generation in
   actual past reviews of similar places.
3. **Cultural adaptation** does the final pass: register, code-switching,
   and Pidgin polish. It also *restrains* itself — not every user
   speaks heavy Pidgin, and the layer respects each user's existing
   register from the profile.

Each layer earns its own metric improvement. The ablation doc shows
which one moves which.

---

## Per-user score distribution

Aggregate numbers hide variance. Here is the per-user template — we
fill it after the run to see who the system handles well and who it
struggles with.

| User ID    | Reviews held out | ROUGE-L | BERTScore F1 | Voice register     |
|------------|------------------|---------|--------------|--------------------|
| bayo_001   | 5                | _TBD_   | _TBD_        | Heavy Pidgin       |
| amaka_002  | 5                | _TBD_   | _TBD_        | Standard English   |
| tunde_003  | 5                | _TBD_   | _TBD_        | Code-switching     |
| funmi_004  | 5                | _TBD_   | _TBD_        | Light Pidgin       |
| kelechi_005| 5                | _TBD_   | _TBD_        | Naija formal       |

If the spread is small (≤ 0.05 on BERTScore), the system generalises.
If one user is dramatically worse, that's a real finding worth
explaining rather than smoothing over.

---

## Sample side-by-side comparisons

Three examples, one per voice register. Filled in after evaluation.

### Sample 1 — heavy Pidgin user (bayo_001)

> **Restaurant input**: _TBD_

**Real review:**
> _TBD_

**NaijaEats generated:**
> _TBD_

**Notes:** _TBD — what matched, what didn't_

### Sample 2 — standard English user (amaka_002)

> **Restaurant input**: _TBD_

**Real review:**
> _TBD_

**NaijaEats generated:**
> _TBD_

**Notes:** _TBD_

### Sample 3 — code-switching user (tunde_003)

> **Restaurant input**: _TBD_

**Real review:**
> _TBD_

**NaijaEats generated:**
> _TBD_

**Notes:** _TBD_

---

## How to reproduce

From the project root, in a working Docker environment with the data
pipeline already run:

```bash
# 1. Build user profiles (idempotent)
python -m app.profiler --build-all

# 2. Run the text-quality eval against the held-out set
python -m evaluation.metrics --metric text_quality --holdout-last 5

# 3. Per-user breakdown
python -m evaluation.metrics --metric text_quality --per-user --output reports/text_quality.csv

# 4. Compare against baselines (generic + profile-only)
python -m evaluation.ablation --metric text_quality
```

Reports land in `reports/text_quality.csv` and `reports/text_quality.json`.

---

## Honest limitations

A few things we want to be upfront about:

- **ROUGE penalises Pidgin.** *"E sweet die"* and *"It was delicious"*
  carry the same meaning but score near-zero on ROUGE-1. Read ROUGE as
  a floor, not a ceiling.
- **BERTScore uses English-trained embeddings.** Even multilingual
  variants have weak coverage of Naija Pidgin specifically, so the
  semantic similarity score is a slight under-estimate for our most
  authentic outputs.
- **Held-out reviews drift in time.** A user's latest 5 reviews can
  reflect mood, life changes, or a new neighbourhood. The model is
  predicting an average user, not a moment.
- **Five held-out reviews per user is small.** Confidence intervals on
  per-user numbers are wide. Aggregate numbers are the trustworthy
  ones; per-user is for spotting failure modes.

We'd rather call these out than ship a misleadingly clean table.

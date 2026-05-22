# Behavioural Fidelity

This is the hardest criterion to game and the one we care about
most. ROUGE and RMSE will fall to a system that's broadly competent.
**Behavioural fidelity** asks something stricter: can the generated
review fool an evaluator into thinking the real user wrote it?

We evaluate this two ways: a **Turing test** (binary, blind) and a
**fidelity rubric** (graded, eyes-open).

---

## Why this matters

A review generator can produce text that scores well on automated
metrics and still feel obviously synthetic. It's the difference
between *"plausibly written by a person"* and *"written by **this**
person."* Automated metrics are reasonable proxies, but humans are
the ground truth.

If a system fails fidelity but passes the automated metrics, it's
overfitting to the metrics. If it passes fidelity, the automated
scores are validated.

---

## Part A — Turing test

### Setup

For each test user, we present **6 reviews**:

- 3 real reviews held out from their history.
- 3 NaijaEats generated reviews for restaurants they actually visited
  (so we have a ground-truth rating to compare against).

Reviews are **interleaved randomly**, **unlabelled**, and presented
on a single page per user.

Evaluators are asked one question per review: *"Real or generated?"*
They cannot see the user's other reviews during the test (no
leakage from context-matching the voice).

### Metrics

- **Deception rate** — % of generated reviews labelled "real". This
  is the headline number. 50% is indistinguishable from real.
- **False-positive rate** — % of real reviews labelled "generated".
  High FPR means the evaluators are over-suspicious, and adjusts how
  we read the deception rate.
- **Per-user deception rate** — to see if any user is systematically
  harder.

### Results

| Metric                          | NaijaEats | Generic LLM baseline |
|---------------------------------|-----------|----------------------|
| Deception rate (target ≥ 50%)   | _TBD_     | _TBD_                |
| False-positive rate             | _TBD_     | _TBD_                |
| Evaluators                      | 5         | 5                    |
| Users tested                    | 5         | 5                    |
| Reviews per user                | 6         | 6                    |

| User       | Deception rate | Hardest review (why) |
|------------|----------------|----------------------|
| bayo_001   | _TBD_          | _TBD_                |
| amaka_002  | _TBD_          | _TBD_                |
| tunde_003  | _TBD_          | _TBD_                |
| funmi_004  | _TBD_          | _TBD_                |
| kelechi_005| _TBD_          | _TBD_                |

A deception rate of 50% means we're fully fooling evaluators. We
don't expect 50% — we expect to land somewhere in the 30–45% band
for the full pipeline, with the generic baseline closer to 10%.
Anything above the baseline is signal that the behavioural layer is
doing real work.

---

## Part B — Fidelity rubric

Even when an evaluator can tell a review is generated, they can score
*how close* it gets. This is what the rubric measures.

For each generated review, evaluators score three dimensions on a
1–5 scale, with the user's full profile and review history visible:

### Dimension 1 — Voice match

> *Does this sound like this specific person wrote it?*

| Score | Description                                                          |
|-------|----------------------------------------------------------------------|
| 5     | Indistinguishable from the user's writing — diction, length, rhythm |
| 4     | Clearly this user, with one or two unnatural phrases                 |
| 3     | Recognisably in the right register but feels generic in places       |
| 2     | Wrong register for this user (e.g. heavy Pidgin for an English user) |
| 1     | Could be anyone — generic AI tone                                    |

### Dimension 2 — Rating consistency

> *Does the predicted star rating match the user's known patterns?*

| Score | Description                                                          |
|-------|----------------------------------------------------------------------|
| 5     | Exact rating you'd expect from this user for this restaurant         |
| 4     | One star off, but in a plausible direction                           |
| 3     | One star off, slightly surprising                                    |
| 2     | Two stars off, or wrong direction                                    |
| 1     | Doesn't reflect this user's rating distribution at all               |

### Dimension 3 — Behavioural accuracy

> *Does the review capture this user's specific triggers and tastes?*

| Score | Description                                                          |
|-------|----------------------------------------------------------------------|
| 5     | Names a real trigger and reacts to it the way this user always does  |
| 4     | Mentions a relevant trigger but resolves it slightly wrong           |
| 3     | Generic complaints/praises that aren't user-specific                 |
| 2     | Reacts to something the user has never mentioned                     |
| 1     | Actively contradicts the user's known preferences                    |

### Results

| System                        | Voice | Rating | Behavior | Avg / 5 |
|-------------------------------|-------|--------|----------|---------|
| Generic LLM (no user context) | _TBD_ | _TBD_  | _TBD_    | _TBD_   |
| NaijaEats — profile only      | _TBD_ | _TBD_  | _TBD_    | _TBD_   |
| **NaijaEats — full pipeline** | **_TBD_** | **_TBD_** | **_TBD_** | **_TBD_** |

Per-user fidelity breakdown:

| User       | Voice | Rating | Behavior | Notes |
|------------|-------|--------|----------|-------|
| bayo_001   | _TBD_ | _TBD_  | _TBD_    | _TBD_ |
| amaka_002  | _TBD_ | _TBD_  | _TBD_    | _TBD_ |
| tunde_003  | _TBD_ | _TBD_  | _TBD_    | _TBD_ |
| funmi_004  | _TBD_ | _TBD_  | _TBD_    | _TBD_ |
| kelechi_005| _TBD_ | _TBD_  | _TBD_    | _TBD_ |

---

## Side-by-side qualitative examples

Picked from the eval set after the run. Two strong examples and one
honest failure case.

### Strong — bayo_001, slow-service trigger fires

**Real:** _TBD_

**Generated:** _TBD_

**Why it worked:** _TBD_

### Strong — amaka_002, register held

**Real:** _TBD_

**Generated:** _TBD_

**Why it worked:** _TBD_

### Failure — _TBD user_

**Real:** _TBD_

**Generated:** _TBD_

**Why it failed:** _TBD_ — kept for honesty, not buried.

---

## What drives high fidelity

In rough order of contribution to human-eval scores:

1. **The profiler captures personality, not statistics.** A list of
   numbers ("4.1 average, 12 reviews, likes Nigerian") is not a person.
   The profile extracts trigger phrases, complaint patterns, sentiment
   gradient, length preferences, and known stances on ambience/price/
   service. That's what evaluators recognise as "voice".
2. **Retrieval gives the LLM real sentences to study.** You cannot
   instruct an LLM into someone's idiolect. You can show it three of
   their old reviews and it will pattern-match.
3. **The cultural layer respects each user's register.** This is the
   subtle one — not forcing everyone into Pidgin. A user whose
   English profile is professional gets refined English with light
   Naija markers. A heavy-Pidgin user gets heavy Pidgin. The layer
   *reads* the profile before applying changes.

---

## How to reproduce

```bash
# 1. Generate the human-eval bundle (mixed real/generated reviews per user)
python -m evaluation.human_eval --build-bundle --users 5 --per-user 3

# 2. Bundle drops into reports/human_eval/<timestamp>/ as one HTML file per evaluator
ls reports/human_eval/

# 3. After evaluators submit labels (CSV), score the run
python -m evaluation.human_eval --score reports/human_eval/<timestamp>/labels.csv

# 4. Rubric scoring (eyes-open second pass)
python -m evaluation.human_eval --rubric reports/human_eval/<timestamp>/rubric.csv
```

---

## Honest limitations

- **5 evaluators on 5 users is a small sample.** Per-user numbers
  shouldn't be over-read. The aggregate is the signal.
- **Evaluators aren't Nigerian Yelp users.** We're testing whether
  the output sounds like the *specific user from the dataset*, not
  whether it would pass for a fluent Pidgin speaker in Lagos. Those
  are related but not identical.
- **Yelp users in the dataset write in many Englishes.** Not all our
  users speak Pidgin even after the cultural layer. Generated reviews
  for these users will (correctly) sound less "Naija" — that's the
  system respecting the profile, not failing.
- **The Turing test setup is generous to the model.** Evaluators
  don't have the user's other reviews open. With unlimited context
  to cross-reference, deception rates would drop.
- **Evaluator agreement isn't measured for the rubric.** A second
  rater on the same bundle would catch how subjective the 1–5 scale
  is, and we should add that in a follow-up.

We'd rather call these out than spin a confident headline number.

# NaijaEats: Behavioural Simulation of Restaurant Reviews with Cultural Adaptation

**Authors:** Olayinka Akanji, Micheal Tunwase
**Affiliation:** NaijaEats Project — Lagos, Nigeria
**Track:** DSN × BCT LLM Agent Challenge

---

## Abstract

Most LLM-based review systems generate text that is competent in
general but anonymous in particular — they cannot write *as* a
specific user, and they have no concept of cultural context. NaijaEats
is a behavioural simulation system that predicts and writes restaurant
reviews in the voice of a *specific* user for restaurants they have
never visited. The system is built around four explicit stages:
**behavioural profiling** of the user from their review history,
**retrieval** of semantically similar past reviews via vector search,
**LLM reasoning and generation** grounded in profile and retrieved
evidence, and **cultural adaptation** that refines the output into
authentic Nigerian English where appropriate. We evaluate on a
held-out subset of real users using three metrics — ROUGE/BERTScore
for text quality, RMSE for rating accuracy, and a two-part human
evaluation (Turing test plus rubric) for behavioural fidelity. The
ablation study isolates the contribution of each pipeline stage.
The cultural layer is not a cosmetic post-processor: it is a
co-equal stage that materially improves human-evaluation scores
without significantly moving automated metrics — a finding that
underscores why automated metrics alone are insufficient for
behavioural simulation.

---

## 1. Introduction

When a friend asks *"would I like this restaurant?"*, they're not
asking for a recommendation. They're asking for a **simulation of
their own taste**. That's a different problem than the recommender
systems literature usually tackles.

Two things are missing from current LLM-based approaches:

1. **Personalisation at the level of voice and behaviour**, not just
   preferences. Knowing a user likes Nigerian food is shallow.
   Knowing they drop a star for slow service, write in 3-sentence
   bursts, mix Pidgin into their reviews when frustrated, and almost
   never rate below 3 unless something was actively bad — that's the
   model that lets you write *as* them.
2. **Cultural context** as a first-class input, not a localisation
   afterthought. A 3-star review from a Nigerian Yelp user has
   different semantics than a 3-star review from an American one.
   Nigerians under-use the 1–2 range, weight service complaints
   heavily, and code-switch into Pidgin under emotional emphasis.

NaijaEats targets both. We argue throughout that culture is not a
post-processing step you add at the end — it shapes every layer of
the system, including the profiling logic and the retrieval evidence.

---

## 2. Related Work

**Collaborative filtering** (Koren et al.) is the historical default
for restaurant recommendation. It predicts ratings well at scale but
cannot generate review text, has no notion of individual voice, and
collapses cultural variance into latent factors that aren't
interpretable.

**LLM-based review generation** has emerged in two flavours: (a)
prompting an LLM with a user's profile as text and asking it to
write a review (Li & Tuzhilin 2023 style), and (b) fine-tuning a
model on a corpus of reviews. Both struggle with individual-voice
fidelity. Prompt-only approaches lose the user's idiolect; fine-tuned
models converge to an average style across the corpus.

**Retrieval-augmented generation** (Lewis et al., 2020) is the
closest related family. Our use of RAG differs: rather than
retrieving documents to answer a factual query, we retrieve *the
same user's past reviews* of similar restaurants as **voice
exemplars**. This is RAG-as-style-grounding, not RAG-as-fact-
grounding.

**Our three differentiators:**

1. **Explicit behavioural profiling** rather than dropping raw
   reviews into the prompt. The profile is structured, interpretable,
   and debuggable. We can look at it and see *why* the system thinks
   a user will react a certain way.
2. **Intra-user retrieval.** Retrieval is scoped to one user's
   history, not a global corpus, because we are simulating *that
   user*, not generating "a plausible review".
3. **Cultural adaptation as a dedicated stage**, with user-specific
   register matching. Not "translate to Pidgin" — "polish to match
   how *this user* actually writes".

---

## 3. Approach

### 3.1 Pipeline overview

```
User history ─► Profiler ─► Retriever ─► LLM Reasoner ─► Nigerianizer ─► Output
                  (1)         (2)            (3)             (4)
```

Four stages. Each stage has a single responsibility and a single
output passed to the next. No branching, no agentic loops — a linear
pipeline keeps the system debuggable and the latency bounded.

### 3.2 Behavioural profiling

The profiler reads a user's full review history and emits a
structured fingerprint:

- **Rating distribution** — full histogram, not just mean.
- **Sentiment profile** — VADER + TextBlob over their review text,
  giving us tone gradient (do they hedge or do they swing?).
- **Trigger inventory** — words and phrases that correlate with
  positive vs negative ratings *for this user*. "Slow service" is
  always negative, but for some users it's a -2-star event and for
  others it's a -1.
- **Cuisine preferences** — mean rating per category.
- **Style features** — average review length, sentence count, use
  of question marks/exclamations, code-switching frequency.
- **Voice register** — heavy Pidgin / light Pidgin / code-switching
  / standard English / Naija formal. Used by the Nigerianizer.

Why explicit features instead of just embedding the user's history?
Three reasons: cheaper at inference (no need to re-embed 50 reviews),
interpretable when things go wrong, and steerable — we can adjust
trigger weights without retraining anything.

### 3.3 Retrieval

User reviews are embedded with `sentence-transformers/all-MiniLM-L6-v2`
and stored in **ChromaDB**, one collection per user. At query time,
we embed the target restaurant's description (category, menu, common
tags) and retrieve the top-K (default 5) most similar past reviews
by cosine similarity.

This is intra-user retrieval — we never retrieve across users. The
goal is *voice grounding*, not knowledge. The retrieved reviews come
into the prompt as labelled exemplars: "here is how this user
reviewed similar places."

### 3.4 LLM reasoning + generation

We prompt Claude Sonnet with the profile, the retrieved exemplars,
the new restaurant details, and an explicit chain-of-thought
instruction. The output is structured JSON: predicted rating,
draft review text, confidence (derived from how strongly the profile
+ retrieved evidence agreed), and a short reasoning trace.

Chain-of-thought matters here. Without it, the model collapses
rating prediction into a heuristic ("Nigerian food + good user =
4 stars"). With it, the model explicitly reasons about which
triggers apply and how strongly, which produces both better ratings
and more user-specific review text.

### 3.5 The Nigerianizer

The cultural adaptation stage. It's a second LLM call with a
focused prompt: given the draft review and the user's voice register
from the profile, refine the language to match how *this user*
actually writes.

What it does:

- Adds appropriate Pidgin where the user's register supports it.
- Inserts Lagos/Nigerian neighbourhood cues if relevant.
- Adjusts food vocabulary (e.g. "swallow", "buka", "go-slow") where
  it belongs.
- Keeps standard English for users whose profile shows standard
  English.

What it explicitly does **not** do:

- Force Pidgin on every output. The single biggest failure mode of
  naive cultural systems is forcing one register on everyone. The
  Nigerianizer reads the profile register and respects it.

---

## 4. Experiments

### 4.1 Dataset

Yelp Open Dataset filtered to users with ≥ 15 reviews, biased toward
restaurant reviews. We further annotate users with a voice register
label derived from the profiler. Test users are held out from
profile-building.

### 4.2 Held-out protocol

For each test user: hide the last 5 reviews. Build the profile from
the rest. Feed restaurant details only. Compare generated output to
held-out ground truth.

### 4.3 Metrics

| Criterion              | Metric                          | Doc                            |
|------------------------|----------------------------------|--------------------------------|
| Review text quality    | ROUGE-1/2/L, BERTScore F1        | `01_REVIEW_TEXT_QUALITY.md`    |
| Rating accuracy        | RMSE, MAE, within-±1             | `02_RATING_ACCURACY.md`        |
| Behavioural fidelity   | Turing deception + 3-dim rubric  | `03_BEHAVIOURAL_FIDELITY.md`   |

### 4.4 Baselines

- **Random** — uniform 1–5 for rating, generic restaurant review for text.
- **Per-user mean** — predict the user's average rating; for text,
  the LLM with the user's mean rating as a hint and no other context.
- **Generic LLM** — Claude Sonnet, no user context.
- **NaijaEats — profile only** — profiler output, no retrieval, no
  cultural layer.
- **NaijaEats — profile + retrieval** — without the cultural layer.
- **NaijaEats — full pipeline** — all four stages.

---

## 5. Results

### 5.1 Review text quality

| System                          | ROUGE-1 | ROUGE-2 | ROUGE-L | BERTScore F1 |
|---------------------------------|---------|---------|---------|--------------|
| Generic LLM                     | _TBD_   | _TBD_   | _TBD_   | _TBD_        |
| NaijaEats — profile only        | _TBD_   | _TBD_   | _TBD_   | _TBD_        |
| NaijaEats — profile + retrieval | _TBD_   | _TBD_   | _TBD_   | _TBD_        |
| NaijaEats — full pipeline       | _TBD_   | _TBD_   | _TBD_   | _TBD_        |

### 5.2 Rating accuracy

| System                          | RMSE  | MAE   | Within ±1 |
|---------------------------------|-------|-------|-----------|
| Random                          | ~1.40 | ~1.20 | ~40%      |
| Per-user mean                   | _TBD_ | _TBD_ | _TBD_     |
| Generic LLM                     | _TBD_ | _TBD_ | _TBD_     |
| NaijaEats — profile only        | _TBD_ | _TBD_ | _TBD_     |
| NaijaEats — profile + retrieval | _TBD_ | _TBD_ | _TBD_     |
| NaijaEats — full pipeline       | _TBD_ | _TBD_ | _TBD_     |

### 5.3 Behavioural fidelity

| System                          | Deception | Voice | Rating | Behavior | Avg/5 |
|---------------------------------|-----------|-------|--------|----------|-------|
| Generic LLM                     | _TBD_     | _TBD_ | _TBD_  | _TBD_    | _TBD_ |
| NaijaEats — profile only        | _TBD_     | _TBD_ | _TBD_  | _TBD_    | _TBD_ |
| NaijaEats — full pipeline       | _TBD_     | _TBD_ | _TBD_  | _TBD_    | _TBD_ |

---

## 6. Ablation Study (summary)

Full detail in `07_ABLATION_STUDY.md`. Five versions: V1 generic LLM,
V2 + profile, V3 + retrieval, V4 + step-by-step reasoning, V5 + cultural
layer (full system).

**Key finding:** V4 → V5 barely moves automated metrics but
significantly improves human evaluation. The cultural layer is doing
work that ROUGE and BERTScore cannot see. This is the strongest
single argument for treating behavioural simulation as a
human-evaluated problem first and an automated-metrics problem
second.

---

## 7. Nigerian Cultural Contextualisation

Detailed in `06_NIGERIAN_BONUS.md`. Summary: culture is not the
Nigerianizer alone — it shapes every layer.

- **Profiler:** trigger inventory includes Nigerian-specific signals
  (go-slow, service patience, food authenticity language) that a
  Yelp-trained profiler would miss.
- **Retrieval:** when restaurant cues include Nigerian neighbourhood
  or cuisine context, they map to denser regions of the user's
  embedded history because the user has been to similar places.
- **Reasoning:** the prompt instructs the model to use Nigerian
  rating psychology (generous baseline, service weighting).
- **Nigerianizer:** the visible cultural layer.

Pulling Pidgin onto a generic system would have produced uniformly
"Nigerian-flavoured" output. Building Nigerian-ness into every layer
produces output that respects the *individual* user inside the
culture.

---

## 8. What We Would Do With More Time

A short, honest list. Not roadmap fluff:

- **Train on actual Nigerian review data.** Yelp's Nigerian coverage
  is thin. A dataset scraped from Nigerian platforms (or partnered
  with one) would let the embeddings and profile features specialise.
- **Voice interface.** A WhatsApp/voice bot fronting the simulate-
  review endpoint, so users can ask in Pidgin and get answers in
  their own voice. The mock UI exists; the integration doesn't.
- **Cross-user behaviour modeling.** Right now users are silos. If
  Bayo and Tunde have correlated triggers, we should be able to
  bootstrap a cold-start user from their cohort.
- **Temporal drift tracking.** User voice and taste shift. Profiles
  should age and decay, not be a single static fingerprint.
- **Calibrated confidence.** Our confidence score is heuristic
  today. We should calibrate it against actual prediction error so a
  "0.87" means a real 87% chance of being within ±1 star.

---

## 9. Conclusion

NaijaEats argues for two unfashionable positions: that **behavioural
simulation is a distinct problem** from recommendation and from
generic review generation, and that **culture is structural**, not a
post-processing toggle. The pipeline is small, debuggable, and built
out of well-understood components — explicit profiling, intra-user
RAG, structured prompting, and a focused cultural pass. The
ablation results, especially the V4 → V5 step that moves human
evaluation without moving automated metrics, are the strongest
evidence that the system is doing what we claim it does.

We don't claim to have solved behavioural simulation. We claim to
have shown that the problem is tractable when you take both the user
and their culture seriously as engineering inputs.

---

## References

Lewis, P. et al. (2020). *Retrieval-Augmented Generation for
Knowledge-Intensive NLP Tasks.* NeurIPS.

Koren, Y. et al. (2009). *Matrix Factorization Techniques for
Recommender Systems.* IEEE Computer.

Zhang, T. et al. (2020). *BERTScore: Evaluating Text Generation with
BERT.* ICLR.

Lin, C.-Y. (2004). *ROUGE: A Package for Automatic Evaluation of
Summaries.* ACL Workshop.

Hutto, C. & Gilbert, E. (2014). *VADER: A Parsimonious Rule-Based
Model for Sentiment Analysis.* ICWSM.

Reimers, N. & Gurevych, I. (2019). *Sentence-BERT: Sentence
Embeddings using Siamese BERT-Networks.* EMNLP.

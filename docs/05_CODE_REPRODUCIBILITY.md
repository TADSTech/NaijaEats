# Code Reproducibility

This doc is written for one specific person: a judge who wants to go
from a fresh clone to a working `simulate-review` call in **under 5
minutes**, without reading the code first.

If anything below is more than one command away from working, that's
a bug — file an issue and we'll fix it.

---

## Prerequisites

You need three things on your machine:

- **Docker** + **Docker Compose** (Docker Desktop covers both).
- **Git**.
- An **Anthropic API key** (`sk-ant-...`). The simulator won't run
  without one — there's no offline fallback for the LLM.

That's it. No Python, no Node, no separate vector DB install.
Everything else is in the container.

---

## 5-minute start

```bash
# 1. Clone
git clone https://github.com/akanjiolayinka/naijaeats.git
cd naijaeats

# 2. Set up your env
cp .env.example .env
# Open .env and paste your ANTHROPIC_API_KEY

# 3. Bring up the stack
docker-compose up --build -d

# 4. Pull and process the dataset (one-time, ~2 min)
docker-compose exec api python -m data.pipeline --download --process

# 5. Build user profiles + embed reviews into ChromaDB (~1 min)
docker-compose exec api python -m app.profiler --build-all

# 6. Confirm it's alive
curl http://localhost:8000/health
# expected: {"status":"ok","profiles":N,"chroma":"connected"}

# 7. Run a simulation
curl -X POST http://localhost:8000/simulate-review \
  -H "Content-Type: application/json" \
  -d @test_request.json
```

Expected response shape:

```json
{
  "user_id": "bayo_001",
  "predicted_rating": 3,
  "review_text": "Mama Titi's amala? E dey slap die. ...",
  "confidence": 0.87,
  "reasoning": "User has high tolerance for authentic local food (...)"
}
```

If you got that JSON back, the system is reproducible and you can
move on to the eval suite.

---

## What each step produces

| Step                       | Output                                                |
|----------------------------|-------------------------------------------------------|
| `docker-compose up`        | API on `:8000`, Swagger docs at `/docs`               |
| `data.pipeline --process`  | `data/processed/*.parquet` — filtered Yelp reviews    |
| `profiler --build-all`     | `data/profiles/*.json` + ChromaDB collections per user|
| `GET /health`              | Liveness, profile count, vector store status          |
| `POST /simulate-review`    | Predicted rating + review + confidence + reasoning    |

If any of those don't appear, read the **known issues** section
below before debugging.

---

## Running the test suite

```bash
docker-compose exec api pytest tests/ -v --cov=app
```

Tests mock the Anthropic client, so they run offline and finish in
seconds. CI should run these on every push.

For a single module:

```bash
docker-compose exec api pytest tests/test_profiler.py -v
docker-compose exec api pytest tests/test_retriever.py -v
docker-compose exec api pytest tests/test_api.py -v
```

---

## Running the evaluation suite

```bash
# Full evaluation — all three criteria
docker-compose exec api python -m evaluation.metrics --run-all

# Individual criteria
docker-compose exec api python -m evaluation.metrics --metric text_quality
docker-compose exec api python -m evaluation.metrics --metric rating_accuracy
docker-compose exec api python -m evaluation.metrics --metric behavioural_fidelity

# Ablation
docker-compose exec api python -m evaluation.ablation

# Build a human-eval bundle (HTML pages for evaluators)
docker-compose exec api python -m evaluation.human_eval --build-bundle --users 5
```

Reports land in `reports/` on the host (mounted volume).

---

## Known issues and fixes

Real things we hit during development. If you hit one of these,
this section is the fix — please don't waste 20 minutes on Stack
Overflow first.

| Problem                                                  | Cause                                              | Fix                                                            |
|----------------------------------------------------------|----------------------------------------------------|----------------------------------------------------------------|
| `huggingface_hub.errors.HfHubHTTPError` on first run     | HF blocked / rate-limited                          | `export HF_HUB_OFFLINE=0` and retry, or pre-pull the model     |
| First `/simulate-review` call takes 20–30s               | Sentence-transformer model loading lazily          | This is expected once per container; subsequent calls are fast |
| `chromadb` permission errors on Linux                    | Bind-mounted volume owned by root                  | `sudo chown -R $USER:$USER data/chroma` and restart            |
| `KeyError: 'ANTHROPIC_API_KEY'`                          | `.env` not loaded or key missing                   | Confirm `.env` exists at project root, key starts with `sk-ant-` |
| `simulate-review` returns `404 user_id not found`        | Profiles not built yet                             | Run `python -m app.profiler --build-all`                       |
| Container OOMs during `--build-all`                      | Embedding 1000s of reviews in memory               | `--batch-size 100` flag on the profiler                        |
| Tests fail with `Could not connect to Anthropic`         | Tests not picking up the mock                      | Run via `pytest`, not the module directly — fixtures don't load otherwise |

---

## Why this is reproducible

A short checklist of what we did so a clean machine doesn't surprise
anyone:

- **Docker handles every system dependency.** No Python version
  drift. No "works on my machine" CUDA debugging.
- **Pinned dependencies** in `requirements.txt`. No floating
  versions, no `>=` on anything critical.
- **Deterministic data pipeline.** Same Yelp slice every time —
  filtering is sorted and seeded.
- **Migrations / setup are idempotent.** Re-running `--build-all`
  does not duplicate data.
- **Tests mock all externals.** The test suite passes with no
  network and no API key. Useful for sanity-checking a clone.
- **No hidden state in `~/`.** All persistent state lives in
  `data/` and `reports/`, both inside the repo.

---

## Repository tour for judges

If you have 10 minutes and want to read the most important files in
order:

1. `app/main.py` — FastAPI entrypoint, route definitions. Start here.
2. `app/profiler.py` — Behavioural fingerprint extraction. This is
   the algorithmic heart of the system.
3. `app/retriever.py` — ChromaDB intra-user retrieval. Small file,
   shows the embedding + query flow.
4. `models/prompts/review_generation.txt` — The main LLM prompt.
   Reading this tells you almost everything about how the reasoning
   works.
5. `app/nigerianizer.py` + `models/prompts/cultural_adaptation.txt`
   — The cultural layer.
6. `evaluation/metrics.py` — How we score ourselves.
7. `evaluation/ablation.py` — How we prove each layer matters.
8. `tests/test_api.py` — End-to-end test that exercises the full
   pipeline with mocks.

The Swagger UI at `http://localhost:8000/docs` is also a great way
to poke at endpoints without writing curl.

---

## If something is still broken

Open an issue with:

- The exact command you ran.
- The first 30 lines of `docker-compose logs api`.
- Your OS + Docker version.

We treat repro bugs as P0 during the evaluation window.

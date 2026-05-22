# Architecture Decisions

Eight technical decisions, written as decision records. Each one:
**situation**, **options**, **what we picked**, **why**, and the
**honest tradeoff** we accepted.

These aren't rationalised after the fact. They're the actual
arguments we had while building.

---

## ADR-1: ChromaDB over pgvector

**Situation.** We need vector similarity search over each user's
review history to retrieve voice exemplars at generation time.

**Options considered:**

- **ChromaDB** — in-process, lightweight, file-backed, runs in the
  same container as the API.
- **pgvector** — Postgres extension, requires a separate database
  process, full SQL.
- **Pinecone / Weaviate** — managed cloud vector DBs.
- **FAISS** — raw library, no persistence layer.

**Picked:** ChromaDB.

**Why.** This is the call that's most often gotten wrong by
defaulting to "the serious choice". We are not running similarity
search over millions of documents — we're searching inside an
individual user's history of 30–50 reviews. The scale assumption
that motivates pgvector or Pinecone simply doesn't apply.

ChromaDB gives us per-user collections, persistence to disk, and
zero operational overhead. The API container starts and Chroma is
just there.

**Tradeoff.** We don't get SQL joins between vectors and metadata,
and we don't get the ops story of a real database (replication,
backups, RBAC). For the scale we're at, that's fine. If we ever
needed cross-user retrieval at scale, pgvector would be the next
move.

---

## ADR-2: Explicit behavioural profiling vs raw history in the prompt

**Situation.** The LLM needs to know things about the user. Two ways
to give it that knowledge: stuff their entire review history into
the prompt, or pre-extract a structured profile.

**Options considered:**

- **Raw history in prompt** — every generation includes 30–50
  reviews verbatim. Simple. Lets the LLM extract whatever features
  it wants.
- **Explicit structured profile** — run extraction logic once,
  store a small JSON profile, inject the profile + a few retrieved
  exemplars at generation time.

**Picked:** explicit structured profile + retrieval.

**Why.** Three reasons:

1. **Cost.** Raw history is 5–10× the tokens of a structured
   profile. Per request, every request. Indefinitely.
2. **Interpretability.** When the system gets a prediction wrong,
   we can read the profile and see why. We can read the trigger
   inventory and tell whether the issue was "slow service
   under-weighted" vs "ambience trigger missing".
3. **Steerability.** We can adjust trigger weights, prune false
   positives, and version profiles. None of that is possible if
   the LLM is doing implicit extraction every call.

**Tradeoff.** Our extraction logic can miss things the LLM would
catch. We mitigate by including a few raw exemplars (the retrieval
output) alongside the structured profile — best of both worlds.

---

## ADR-3: RAG over fine-tuning or pure prompting

**Situation.** We want output that sounds like a specific user.
Three families of approach: fine-tune per user, prompt with user
context, or retrieve real user reviews and condition on them.

**Options considered:**

- **Fine-tune per user** — highest possible voice fidelity. But:
  one model per user, retrain on every new review, no shared
  understanding.
- **Pure prompting** — describe the user in features and hope.
  Cheap, but loses voice nuance badly.
- **RAG** — retrieve real user reviews as exemplars at generation.

**Picked:** RAG.

**Why.** RAG gives us roughly 80% of fine-tuning's voice quality at
about 1% of the cost. Per-user fine-tuning at our scale of users
would be operationally unworkable, and we'd need 1000+ reviews per
user to make it stick — we have 30–50.

RAG also keeps the system stateless beyond the vector store: a new
review goes in via re-embedding, no retraining.

**Tradeoff.** RAG quality is bounded by retrieval quality. If we
retrieve the wrong 5 exemplars (e.g. the user's only Continental
review when they're being asked about a Nigerian restaurant), the
output suffers. We mitigate with category-aware retrieval and
fall back to recency when no semantic neighbours exist.

---

## ADR-4: Claude Sonnet over GPT-4 / open-source models

**Situation.** We need an LLM for both the main reasoning + generation
step and the cultural adaptation pass.

**Options considered:**

- **Claude Sonnet** — Anthropic.
- **GPT-4 / GPT-4o** — OpenAI.
- **Open-source models** (Llama 3, Mistral) — self-hosted.

**Picked:** Claude Sonnet.

**Why.** Two specific reasons that mattered for us:

1. **Structured output compliance.** Our pipeline depends on the
   model returning clean JSON for `predicted_rating`,
   `review_text`, `confidence`, and `reasoning`. Sonnet held the
   schema across edge cases (low-confidence outputs, refusal-
   adjacent prompts) more reliably than alternatives in our
   internal tests.
2. **Natural Pidgin.** This is more anecdotal but consistent across
   our prompt tests: Sonnet produced Pidgin that read more
   naturally and code-switched more believably than equivalent
   prompts on the alternatives. Open-source models in particular
   produced "Pidgin-flavoured English" rather than actual Pidgin.

**Tradeoff.** Vendor lock-in on the LLM. Mitigated by isolating LLM
calls behind `app/generator.py` and `app/nigerianizer.py` — swapping
providers is a one-file change. We don't lean on Anthropic-specific
features.

---

## ADR-5: Separate cultural adaptation stage vs single prompt

**Situation.** We could ask the LLM to do everything — reason about
the user, predict a rating, and produce Pidgin output — in a single
prompt. Or we could split reasoning/generation from cultural
adaptation into two LLM calls.

**Options considered:**

- **Single prompt** — one call, faster, cheaper.
- **Two-stage** — generator first, Nigerianizer second.

**Picked:** two-stage.

**Why.** Each LLM call does its job better when it has one job.
When we tested the single-prompt version, two failure modes
emerged:

1. **Voice contamination of reasoning.** The model would start
   reasoning about the user *in* Pidgin and lose precision.
   "Slow service na big issue for am" is harder to reason from
   than "slow service is a strong negative trigger for this user".
2. **Pidgin over- or under-shoot.** Without a dedicated pass, the
   model would either commit too early to a register (often the
   wrong one) or hedge between registers within the same review.

Two-stage fixes both. The generator works in clear, structured
language; the Nigerianizer applies texture with the profile's
register tag as an explicit input.

**Tradeoff.** Two LLM calls instead of one — roughly 2× latency and
2× cost per request. We think the quality improvement is worth it;
both metrics agree.

---

## ADR-6: sentence-transformers MiniLM over mpnet

**Situation.** We need an embedding model for the retrieval step.

**Options considered:**

- **all-MiniLM-L6-v2** — 22M params, fast, broadly good.
- **all-mpnet-base-v2** — 110M params, slightly higher MTEB scores.
- **OpenAI embeddings** — managed, external.
- **Multilingual / Naija-specific models** — limited availability.

**Picked:** MiniLM.

**Why.** Our retrieval problem is **intra-user, ≤ 50 documents,
per-query top-K=5**. At that scale the quality gap between MiniLM
and mpnet collapses — both find the right neighbours. But MiniLM
is roughly 4× faster on CPU and uses a quarter of the memory.

Since the embedding step runs on every profile rebuild *and* every
incoming restaurant query, those constants compound quickly.

**Tradeoff.** mpnet would probably catch edge cases on long,
nuanced reviews. We didn't see this in our test set, but it's a
known limitation of the smaller model. If we ever pushed to
longer review content or multilingual queries, mpnet would be the
upgrade path.

---

## ADR-7: FastAPI + Docker for the service layer

**Situation.** We need to expose `simulate-review` and a couple of
other endpoints to evaluators in a way that "just works" on any
machine.

**Options considered:**

- **FastAPI + Docker** — Python service, automatic OpenAPI/Swagger
  at `/docs`.
- **Flask** — simpler but lacks auto-docs and Pydantic validation.
- **Local Python script** — easiest to write, hardest to evaluate
  reproducibly.

**Picked:** FastAPI + Docker.

**Why.** Two reasons specific to a hackathon:

1. **Auto-generated Swagger UI at `/docs`** is the cheapest way to
   give a judge an interactive demo. They can poke at the endpoint
   without writing curl, see the schema, and call it directly from
   the browser.
2. **Docker means one command from clone to working service.**
   `docker-compose up --build` is the entire setup. No Python
   version drift, no `pip install` debugging.

**Tradeoff.** Docker adds startup overhead and disk usage, which is
real but worth it for reproducibility. We pinned the base image to
avoid surprise behaviour on rebuild.

---

## ADR-8: LangChain over LangGraph or plain Python

**Situation.** We need to orchestrate the four-stage pipeline —
profiler → retriever → LLM → Nigerianizer.

**Options considered:**

- **LangChain** — battle-tested chain abstractions, retrievers,
  prompt templates. Heavy framework, but our use of it is light.
- **LangGraph** — graph-based, supports branching, loops, and
  agentic flows.
- **Plain Python** — write the orchestration ourselves.

**Picked:** LangChain (basic chains and retrievers only).

**Why.** Our pipeline is **linear**. There's no branching, no
conditional looping, no agentic decision-making about which tool to
call next. Profile → retrieve → generate → adapt. Always. In that
exact order. Every request.

LangGraph is designed for the case where the system might decide
to skip or revisit a step. That's not our system, and pretending
otherwise would add complexity without buying us anything.

Plain Python would also work — and we considered it. We chose
LangChain because the retriever/prompt-template abstractions saved
us boilerplate, and the testability of `Chain` objects is good.

**Tradeoff.** LangChain is famously over-abstracted, and version
churn is real. We use a small, stable subset — basic chains,
retrievers, prompt templates — and avoid the agentic surface area
entirely. If LangChain became a maintenance burden, swapping to
plain Python is a half-day refactor because we kept the dependency
shallow.

---

## Common thread

If there's a single principle behind these eight decisions:

> **Pick the simplest tool that solves the problem we actually have,
> not the impressive tool that solves a problem we don't.**

ChromaDB over pgvector. MiniLM over mpnet. LangChain over LangGraph.
RAG over fine-tuning. Two focused LLM calls over one over-stuffed one.

Each of these would look "wrong" if you optimised the writeup for
sounding sophisticated. They're right because they match the actual
shape of the problem.

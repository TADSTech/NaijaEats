"""
FastAPI application entrypoint for Naija Eats.

Registers all API routes and initialises application-level middleware.
"""

from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from app.schemas import (
    SimulateReviewRequest,
    SimulateReviewResponse,
    UserProfileResponse,
    HealthResponse,
)
from app.profiler import BehavioralProfiler
from app.retriever import ReviewRetriever
from app.generator import ReviewGenerator
from app.nigerianizer import Nigerianizer

app = FastAPI(
    title="Naija Eats",
    description=(
        "AI-powered behavioral simulation system that learns how individual users "
        "review restaurants — then predicts and writes reviews in their unique voice "
        "for places they have never visited."
    ),
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialise components
profiler = BehavioralProfiler()
retriever = ReviewRetriever()
generator = ReviewGenerator()
nigerianizer = Nigerianizer()
frontend_index = Path(__file__).resolve().parent.parent / "frontend" / "index.html"


@app.get("/", include_in_schema=False)
async def frontend_home() -> FileResponse:
    """Serve the judge-facing frontend demo."""
    return FileResponse(frontend_index)


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------


@app.get("/health", response_model=HealthResponse, tags=["health"])
async def health_check() -> dict:
    """Return service liveness status."""
    return {"status": "ok"}


# ---------------------------------------------------------------------------
# Review Simulation
# ---------------------------------------------------------------------------


@app.post("/simulate-review", response_model=SimulateReviewResponse, tags=["reviews"])
async def simulate_review(request: SimulateReviewRequest) -> dict:
    """
    Generate a simulated review and rating for a given user and restaurant.
    """
    try:
        # 1. Load user profile
        fingerprint = profiler.load_profile(request.user_id)
        
        # 2. Retrieve similar reviews
        query = f"{request.restaurant.name} {request.restaurant.category} {request.restaurant.location}"
        similar_reviews = retriever.retrieve_similar(request.user_id, query)
        
        # 3. Generate review
        gen_result = generator.generate(
            fingerprint=fingerprint,
            retrieved_reviews=similar_reviews,
            restaurant=request.restaurant.model_dump()
        )
        
        # 4. Cultural adaptation
        final_text = nigerianizer.adapt(
            gen_result["review_text"],
            uses_pidgin=fingerprint.uses_pidgin
        )
        
        return {
            "user_id": request.user_id,
            "predicted_rating": gen_result["predicted_rating"],
            "review_text": final_text,
            "confidence": gen_result["confidence"],
            "reasoning": gen_result["reasoning"],
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------------------------
# User Profiles
# ---------------------------------------------------------------------------


@app.get("/users/{user_id}/profile", response_model=UserProfileResponse, tags=["users"])
async def get_user_profile(user_id: str) -> dict:
    """
    Return the behavioral fingerprint for a user.
    """
    try:
        fingerprint = profiler.load_profile(user_id)
        return {
            "user_id": user_id,
            "profile": {
                "avg_rating": fingerprint.avg_rating,
                "preferred_cuisines": fingerprint.preferred_cuisines,
                "uses_pidgin": fingerprint.uses_pidgin,
                "avg_review_length": fingerprint.avg_review_length
            },
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

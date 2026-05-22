"""
Behavioral fingerprinting module for Naija Eats.

Analyses a user's review history and extracts a rich multi-dimensional
behavioral profile (fingerprint) covering:
  - Rating distribution and tendencies
  - Sentiment patterns (positive/negative triggers)
  - Preferred cuisines and price ranges
  - Writing style markers (length, vocabulary, tone)
  - Cultural language markers (Pidgin frequency, local expressions)

The fingerprint is used downstream by the retrieval and generation layers.
"""

from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from textblob import TextBlob
import pandas as pd
from app.config import settings


class BehavioralFingerprint:
    """Container for a user's extracted behavioral profile."""

    def __init__(
        self,
        user_id: str,
        avg_rating: float = 0.0,
        rating_distribution: dict[int, int] = None,
        common_complaints: list[str] = None,
        common_praises: list[str] = None,
        preferred_cuisines: list[str] = None,
        price_sensitivity: str = "medium",
        avg_review_length: int = 0,
        uses_pidgin: bool = False,
        sentiment_profile: dict = None,
    ):
        self.user_id = user_id
        self.avg_rating = avg_rating
        self.rating_distribution = rating_distribution or {}
        self.common_complaints = common_complaints or []
        self.common_praises = common_praises or []
        self.preferred_cuisines = preferred_cuisines or []
        self.price_sensitivity = price_sensitivity
        self.avg_review_length = avg_review_length
        self.uses_pidgin = uses_pidgin
        self.sentiment_profile = sentiment_profile or {}


class BehavioralProfiler:
    """Builds and retrieves behavioral fingerprints for users."""

    def __init__(self):
        self.analyzer = SentimentIntensityAnalyzer()

    def build_profile(self, user_id: str, reviews: list[dict]) -> BehavioralFingerprint:
        """
        Analyse a list of raw reviews and produce a BehavioralFingerprint.
        """
        if not reviews:
            return BehavioralFingerprint(user_id=user_id)

        df = pd.DataFrame(reviews)
        avg_rating = df["stars"].mean()
        rating_dist = df["stars"].value_counts().to_dict()
        avg_len = df["text"].apply(len).mean()

        # Simple sentiment analysis
        sentiments = df["text"].apply(lambda x: self.analyzer.polarity_scores(x))
        avg_sentiment = {
            "compound": sum(s["compound"] for s in sentiments) / len(sentiments),
            "pos": sum(s["pos"] for s in sentiments) / len(sentiments),
            "neu": sum(s["neu"] for s in sentiments) / len(sentiments),
            "neg": sum(s["neg"] for s in sentiments) / len(sentiments),
        }

        # Mock pidgin detection (very basic for now)
        pidgin_markers = ["e dey", "abeg", "sha", "wetin", "don chop"]
        uses_pidgin = df["text"].apply(
            lambda x: any(marker in x.lower() for marker in pidgin_markers)
        ).any()

        # Mock cuisine preference
        # In a real app, this would be extracted from business data
        preferred_cuisines = ["Nigerian"] if uses_pidgin else ["Continental"]

        return BehavioralFingerprint(
            user_id=user_id,
            avg_rating=float(avg_rating),
            rating_distribution={int(k): int(v) for k, v in rating_dist.items()},
            avg_review_length=int(avg_len),
            uses_pidgin=bool(uses_pidgin),
            sentiment_profile=avg_sentiment,
            preferred_cuisines=preferred_cuisines,
        )

    def load_profile(self, user_id: str) -> BehavioralFingerprint:
        """
        Load a pre-built fingerprint from persistent storage.
        For now, returns a mock profile based on user_id to show different conditions.
        """
        # TODO: Load from persistent storage.
        
        if user_id == "amaka_002":
            return BehavioralFingerprint(
                user_id=user_id,
                avg_rating=3.8,
                rating_distribution={5: 2, 4: 5, 3: 10, 2: 4, 1: 1},
                avg_review_length=250,
                uses_pidgin=False,
                preferred_cuisines=["Continental", "Italian", "Fine Dining"],
                common_complaints=["bad lighting", "poor presentation", "rude waiters"],
                common_praises=["aesthetic", "beautiful plating", "great ambience"],
                price_sensitivity="low"
            )
        elif user_id == "chinedu_003":
            return BehavioralFingerprint(
                user_id=user_id,
                avg_rating=4.5,
                rating_distribution={5: 15, 4: 8, 3: 2, 2: 0, 1: 0},
                avg_review_length=80,
                uses_pidgin=True,
                preferred_cuisines=["Nigerian", "Street food"],
                common_complaints=["small portion", "expensive for nothing"],
                common_praises=["plenty food", "cheap", "value for money"],
                price_sensitivity="high"
            )
            
        return BehavioralFingerprint(
            user_id=user_id,
            avg_rating=4.2,
            rating_distribution={5: 10, 4: 5, 3: 2},
            avg_review_length=150,
            uses_pidgin=True,
            preferred_cuisines=["Nigerian"],
            common_complaints=["slow service", "cold food"],
            common_praises=["authentic taste", "good vibe"],
            price_sensitivity="medium"
        )

    def save_profile(self, fingerprint: BehavioralFingerprint) -> None:
        """
        Persist a fingerprint to storage.
        """
        # TODO: Implementation.
        pass


def main():
    parser = argparse.ArgumentParser(description="Naija Eats Behavioral Profiler")
    parser.add_argument("--build-all", action="store_true", help="Build profiles for all users")
    args = parser.parse_args()

    if args.build_all:
        print("Building profiles for all users (Mock)...")
        # In a real app, this would iterate over the processed reviews dataset
        # and call build_profile for each user.
        print("Done.")


if __name__ == "__main__":
    import argparse
    main()

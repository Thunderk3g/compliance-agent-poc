from typing import List, Dict
import logging

logger = logging.getLogger(__name__)


class ScoringService:
    """Calculate compliance scores based on violations."""

    # Severity weights (points deducted)
    WEIGHTS = {
        "critical": 20,  # Regulatory/safety critical
        "high": 10,      # Product accuracy
        "medium": 3,     # Style/branding (reduced from 5 to 3)
        "low": 2         # Minor issues
    }

    # Category weights for overall score
    CATEGORY_WEIGHTS = {
        "irdai": 0.50,   # 50% - Most important
        "brand": 0.30,   # 30%
        "seo": 0.20      # 20%
    }

    @staticmethod
    def calculate_scores(violations: List[Dict]) -> Dict[str, float]:
        """
        Calculate compliance scores.

        Returns:
            {
                "overall": 85.5,
                "irdai": 90.0,
                "brand": 85.0,
                "seo": 80.0,
                "grade": "B",
                "status": "passed"
            }
        """
        # Calculate category scores
        irdai_score = ScoringService._calculate_category_score(violations, "irdai")
        brand_score = ScoringService._calculate_category_score(violations, "brand")
        seo_score = ScoringService._calculate_category_score(violations, "seo")

        # Calculate weighted overall score
        overall_score = (
            irdai_score * ScoringService.CATEGORY_WEIGHTS["irdai"] +
            brand_score * ScoringService.CATEGORY_WEIGHTS["brand"] +
            seo_score * ScoringService.CATEGORY_WEIGHTS["seo"]
        )

        # Get grade
        grade = ScoringService._get_grade(overall_score)

        # Determine status
        status = ScoringService._get_status(violations, overall_score)

        return {
            "overall": round(overall_score, 2),
            "irdai": round(irdai_score, 2),
            "brand": round(brand_score, 2),
            "seo": round(seo_score, 2),
            "grade": grade,
            "status": status
        }

    @staticmethod
    def _calculate_category_score(violations: List[Dict], category: str) -> float:
        """Calculate score for a specific category."""
        base_score = 100.0

        # Filter violations for this category
        category_violations = [v for v in violations if v.get("category") == category]

        # Deduct points
        for violation in category_violations:
            severity = violation.get("severity", "low")
            deduction = ScoringService.WEIGHTS.get(severity, 0)
            base_score -= deduction

        # Ensure score doesn't go below 0
        return max(0.0, base_score)

    @staticmethod
    def _get_grade(score: float) -> str:
        """Convert numeric score to letter grade."""
        if score >= 90:
            return "A"
        elif score >= 80:
            return "B"
        elif score >= 70:
            return "C"
        elif score >= 60:
            return "D"
        else:
            return "F"

    @staticmethod
    def _get_status(violations: List[Dict], overall_score: float) -> str:
        """Determine compliance status."""
        # Check for critical violations
        has_critical = any(v.get("severity") == "critical" for v in violations)

        if has_critical or overall_score < 60:
            return "failed"
        elif overall_score < 80:
            return "flagged"
        else:
            return "passed"


scoring_service = ScoringService()

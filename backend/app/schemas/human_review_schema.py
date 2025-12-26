from pydantic import BaseModel, Field
from typing import Optional, List

class HumanReviewRequest(BaseModel):
    """
    Structured Request for Human Review (Factor 7: Contact Humans).
    Triggered when High/Critical rules are ambiguous.
    """
    rule_text: str = Field(..., description="The generated rule text that triggered the review")
    reason: str = Field(..., description="Why human review is needed (e.g., 'Ambiguous severity', 'Unclear actionable criteria')")
    suggested_action: str = Field(..., description="What the human should double check")
    severity: str = Field(..., description="Proposed severity")

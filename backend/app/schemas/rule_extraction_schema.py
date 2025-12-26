from typing import List, Optional
from pydantic import BaseModel, Field

class ExtractedRuleSchema(BaseModel):
    rule_text: str = Field(..., description="Clear, specific compliance requirement")
    severity: str = Field(..., description="Severity level: critical, high, medium, low")
    keywords: List[str] = Field(..., description="List of relevant keywords for matching")
    points_deduction: float = Field(..., description="Points to deduct for violation (critical=-20, high=-10, medium=-5, low=-2)")
    confidence_score: float = Field(..., description="Confidence score between 0.0 and 1.0")
    category: Optional[str] = Field(None, description="Category of the rule (e.g., regulatory, brand, seo)")

class RuleExtractionResult(BaseModel):
    rules: List[ExtractedRuleSchema] = Field(default_factory=list, description="List of extracted rules")

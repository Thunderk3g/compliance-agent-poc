from abc import ABC, abstractmethod
from typing import List, Any
from ...models.rule import Rule
from ...schemas.compliance_schemas import ComplianceAnalysisResult

class ComplianceAgent(ABC):
    """
    Abstract Base Class for specialized compliance sub-agents.
    Factor 10: Small, Focused Agents.
    """
    
    @abstractmethod
    async def analyze(self, content: str, rules: List[Rule], execution_id: str = None, db: Any = None) -> ComplianceAnalysisResult:
        """
        Analyze content against a specific set of rules.
        """
        pass

    @property
    @abstractmethod
    def category(self) -> str:
        """The category of rules this agent handles (e.g., 'regulatory', 'brand', 'seo')."""
        pass

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

    def _record_trace(self, db: Any, execution_id: str, step: str, thought: str = None, action: str = None, action_input: Any = None, observation: str = None):
        """
        Helper to record an immutable trace.
        """
        if not db or not execution_id:
            return
            
        try:
            from ...models.agent_trace import AgentTrace
            import uuid
            
            # Ensure execution_id is UUID
            if isinstance(execution_id, str):
                uid = uuid.UUID(execution_id)
            else:
                uid = execution_id

            trace = AgentTrace(
                execution_id=uid,
                step_number=step,
                thought=thought,
                action=action,
                action_input=action_input,
                observation=observation
            )
            db.add(trace)
            db.commit()
        except Exception as e:
            # We don't want observability to crash the agent
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Failed to record trace: {e}")

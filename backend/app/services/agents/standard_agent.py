from typing import List, Any
from .base_agent import ComplianceAgent
from ...models.rule import Rule
from ...schemas.compliance_schemas import ComplianceAnalysisResult
from ...services.llm_service import llm_service
from ...services.preprocessing_service import ContextEngineeringService

class StandardComplianceAgent(ComplianceAgent):
    """
    Standard implementation of a specific compliance agent (e.g., Regulatory, Brand, SEO).
    Uses the 'Context Engineering' service to build prompts and 'Ollama Service' for structured output.
    """
    
    def __init__(self, category: str, context_service: ContextEngineeringService):
        self._category = category
        self.context_service = context_service
        
    @property
    def category(self) -> str:
        return self._category
        
    @property
    def name(self) -> str:
        return self._category

    @property
    def system_prompt(self) -> str:
        return f"You are a specialist {self.category} compliance agent. Analyze the content against the provided rules. Return ONLY valid JSON."

    async def analyze(self, content: str, rules: List[Rule], execution_id: str = None, db: Any = None) -> ComplianceAnalysisResult:
        # 1. Build Prompt (Context Engineering)
        # We pass the rules under their specific category header
        rules_dict = {self.category: rules}
        prompt = self.context_service.create_compliance_prompts(content, rules_dict)
        
        # Define context
        context = {
            "agent_category": self.category,
            "rules_count": len(rules)
        }
        
        # 2. Call LLM (Structured Output)
        response = await llm_service.generate_structured_response(
            prompt=prompt,
            output_model=ComplianceAnalysisResult,
            system_prompt=self.system_prompt,
            context=context,
            execution_id=execution_id,
            db=db,
            tool_name=f"{self.name}_analysis"
        )
        
        return response

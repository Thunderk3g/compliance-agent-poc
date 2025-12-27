
from .base_agent import ComplianceAgent
from .standard_agent import StandardComplianceAgent
from ...services.preprocessing_service import ContextEngineeringService

class AgentFactory:
    """
    Factory for creating specialized compliance agents.
    Allows for dynamic agent creation based on configuration or industry.
    """
    
    @staticmethod
    def create_agent(category: str, context_service: ContextEngineeringService) -> ComplianceAgent:
        """
        Create a compliance agent for a specific category.
        Could be extended to return different subclasses based on industry (e.g. InsuranceRegulatoryAgent).
        """
        # In a more complex version, we could check:
        # if category == "regulatory" and industry == "insurance": return InsuranceRegulatoryAgent(...)
        
        return StandardComplianceAgent(category, context_service)

"""
Agent Dispatcher - Unified Entry Point for Multi-Agent System

Routes incoming requests to the appropriate specialist agent based on input type:
- Voice/Audio files → VoiceAuditAgent
- Marketing content → ComplianceAgent (existing)
- Analytics queries → AnalyticsAgent
- Customer messages → SalesAgent
"""

import logging
from typing import Dict, Any, Optional
from enum import Enum

logger = logging.getLogger(__name__)


class AgentType(Enum):
    """Supported agent types in the multi-agent system."""
    VOICE = "voice"
    COMPLIANCE = "compliance"
    ANALYTICS = "analytics"
    SALES = "sales"


class AgentDispatcher:
    """
    The First Layer - Unified dispatcher for all specialist agents.
    
    Think of this as the mission briefing coordinator:
    - The Auditor is listening to the past (voice calls)
    - The Compliance Officer is checking the present rules
    - The Analyst is calculating future trends
    - The Sales Agent is talking to the customer
    """
    
    def __init__(self):
        self._agents: Dict[AgentType, Any] = {}
        self._initialize_agents()
    
    def _initialize_agents(self):
        """Lazy-load agent instances."""
        # Import here to avoid circular dependencies
        from .voice.voice_agent import VoiceAuditAgent
        from .analytics.analytics_agent import AnalyticsAgent
        from .sales.sales_agent import SalesAgent
        # Compliance uses existing engine
        from ..compliance_engine import ComplianceEngine
        
        self._agents = {
            AgentType.VOICE: VoiceAuditAgent(),
            AgentType.COMPLIANCE: ComplianceEngine(),
            AgentType.ANALYTICS: AnalyticsAgent(),
            AgentType.SALES: SalesAgent(),
        }
        logger.info("AgentDispatcher initialized with 4 specialist agents")
    
    def detect_agent_type(self, input_data: dict) -> AgentType:
        """
        Determine which agent should handle the request based on input structure.
        
        Args:
            input_data: Request payload with various possible keys
            
        Returns:
            AgentType enum indicating the appropriate handler
        """
        if "audio_file" in input_data or "audio_url" in input_data:
            return AgentType.VOICE
        
        if "analytics_query" in input_data or "insight_request" in input_data:
            return AgentType.ANALYTICS
        
        if "customer_message" in input_data or "chat_message" in input_data:
            return AgentType.SALES
        
        # Default to compliance for marketing content, documents, text
        return AgentType.COMPLIANCE
    
    async def dispatch(
        self, 
        input_data: dict,
        agent_type: Optional[AgentType] = None,
        **kwargs
    ) -> dict:
        """
        Route request to appropriate agent.
        
        Args:
            input_data: Request payload
            agent_type: Optional explicit agent selection (auto-detect if None)
            **kwargs: Additional parameters passed to the agent
            
        Returns:
            Agent response as dictionary
        """
        # Detect or use specified agent type
        selected_type = agent_type or self.detect_agent_type(input_data)
        logger.info(f"Dispatching to {selected_type.value} agent")
        
        agent = self._agents.get(selected_type)
        if not agent:
            raise ValueError(f"No agent registered for type: {selected_type}")
        
        try:
            # Each agent implements a common interface
            if selected_type == AgentType.VOICE:
                return await agent.process(input_data, **kwargs)
            
            elif selected_type == AgentType.COMPLIANCE:
                # Existing compliance engine uses different method signature
                submission_id = input_data.get("submission_id")
                db = kwargs.get("db")
                return await agent.analyze_submission(submission_id, db)
            
            elif selected_type == AgentType.ANALYTICS:
                return await agent.reason(input_data, **kwargs)
            
            elif selected_type == AgentType.SALES:
                return await agent.respond(input_data, **kwargs)
                
        except Exception as e:
            logger.error(f"Agent {selected_type.value} failed: {e}")
            return {
                "error": str(e),
                "agent_type": selected_type.value,
                "status": "failed"
            }
    
    def get_agent(self, agent_type: AgentType) -> Any:
        """Get direct access to a specific agent."""
        return self._agents.get(agent_type)


# Singleton instance
agent_dispatcher = AgentDispatcher()

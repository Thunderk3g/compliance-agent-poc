from typing import TypedDict, List, Dict, Any, Optional, Annotated
import operator
from langchain_core.messages import BaseMessage

class ComplianceState(TypedDict):
    """
    Represents the state of the compliance orchestration graph.
    Tracking document progress, rules, violations, and scores.
    """
    submission_id: str
    project_id: Optional[str]
    user_id: Optional[str]
    analytics_query: Optional[str]
    dataset_id: Optional[str] # Query for Analytics Agent
    
    # Document Content
    chunks: List[Dict[str, Any]]  # Preprocessed chunks
    
    # Rules
    active_rules: Dict[str, List[Dict[str, Any]]] # Serialized rules by category
    
    # Analysis Results (Append-only)
    # Using operator.add to merge lists from parallel branches if we use them, 
    # or just to accumulate updates.
    violations: Annotated[List[Dict[str, Any]], operator.add]
    
    # Detailed Agent Results (State updates)
    analytics_result: Optional[Dict[str, Any]]
    voice_result: Optional[Dict[str, Any]]
    sales_result: Optional[Dict[str, Any]]
    
    # Scoring
    scores: Dict[str, Any]
    
    # Status & Metadata
    status: str
    metadata: Dict[str, Any]
    
    # History & Chat
    messages: Annotated[List[BaseMessage], operator.add]
    
    # HITL
    user_feedback: Optional[str]

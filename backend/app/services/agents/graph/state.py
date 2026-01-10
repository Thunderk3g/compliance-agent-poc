from typing import TypedDict, List, Dict, Any, Optional, Annotated
import operator
from langchain_core.messages import BaseMessage

class ComplianceState(TypedDict):
    """
    Represents the state of the compliance orchestration graph.
    Acts as a 'Stateless Reducer' where strictly typed updates are merged.
    """
    submission_id: str
    project_id: Optional[str]
    user_id: Optional[str]
    
    # Document Content (Librarian's Output)
    chunks: List[Dict[str, Any]]
    
    # Rules (Teacher's Output)
    active_rules: Dict[str, List[Dict[str, Any]]]
    
    # Analysis Results (Brain's Accumulator)
    # Using operator.add to append violations from parallel agents
    violations: Annotated[List[Dict[str, Any]], operator.add]
    
    # Track which agents were spawned
    active_agents: Annotated[List[str], operator.add]
    
    # Scoring
    scores: Dict[str, Any]
    
    # Status & Metadata
    status: str
    metadata: Dict[str, Any]
    
    # History & Chat
    messages: Annotated[List[BaseMessage], operator.add]
    
    # HITL
    user_feedback: Optional[str]

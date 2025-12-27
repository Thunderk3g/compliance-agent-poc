from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime
import uuid

class ComplianceState(BaseModel):
    """
    Represents the state of a compliance analysis session (Stateless Reducer Pattern).
    
    This object is passed between steps in the compliance workflow. 
    It is immutable between transitions (conceptually) - each step returns a new state/updates it.
    """
    # Session Identity
    session_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    submission_id: str
    project_id: Optional[str] = None
    
    # Workflow Control
    current_step: str = "initialized"  # initialized, chunking, analysis, scoring, complete, failed
    status: str = "running"           # running, paused, completed, failed
    step_history: List[str] = Field(default_factory=list)
    
    # Data Accumulation
    total_chunks: int = 0
    processed_chunks: int = 0
    violations: List[Dict[str, Any]] = Field(default_factory=list)
    scores: Dict[str, Any] = Field(default_factory=dict)
    
    # Error Handling & Context
    errors: List[str] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    def transition_to(self, new_step: str):
        """Record transition to a new step."""
        self.step_history.append(self.current_step)
        self.current_step = new_step
        self.updated_at = datetime.utcnow()

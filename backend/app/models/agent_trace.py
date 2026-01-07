from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from ..database import Base

class AgentTrace(Base):
    """
    Immutable trace of agent reasoning steps (Thought/Action/Observation)
    for auditability and debugging.
    """
    __tablename__ = "agent_traces"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    execution_id = Column(UUID(as_uuid=True), ForeignKey('agent_executions.id', ondelete='CASCADE'), index=True)
    
    step_number = Column(String(50), nullable=False) # e.g. "Step 1", "Planning"
    
    # Reasoning components
    thought = Column(Text, nullable=True) # The LLM's internal monologue
    action = Column(String(255), nullable=True) # Tool name
    action_input = Column(JSONB, nullable=True) # Tool arguments
    observation = Column(Text, nullable=True) # Tool output
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship
    execution = relationship("AgentExecution", back_populates="traces")

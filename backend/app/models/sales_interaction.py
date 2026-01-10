from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Float
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from pgvector.sqlalchemy import Vector
from ..database import Base

class SalesInteraction(Base):
    """
    Sales Agent Interactions.
    Stores chat history, extracted profiles, and risk assessments.
    """
    __tablename__ = "sales_interactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    session_id = Column(String, unique=True, index=True, nullable=False)
    
    # Store complete chat history
    messages = Column(JSONB, nullable=True)
    
    # Extracted data
    customer_profile = Column(JSONB, nullable=True)
    risk_assessment = Column(JSONB, nullable=True)
    recommendations = Column(JSONB, nullable=True)
    
    # Compliance checks during chat
    compliance_flags = Column(JSONB, nullable=True)
    
    # Vector embedding for semantic search of the conversation
    embedding = Column(Vector(1536), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    project = relationship("Project", backref="sales_interactions")

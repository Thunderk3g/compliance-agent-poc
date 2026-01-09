from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from ..database import Base

class AnalyticsResult(Base):
    __tablename__ = "analytics_results"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    submission_id = Column(UUID(as_uuid=True), ForeignKey("submissions.id", ondelete="CASCADE"), nullable=False, index=True)
    
    bi_reasoning = Column(Text, nullable=True) # The thought process/reasoning trace
    insights = Column(JSONB, nullable=True) # Key business insights extracted
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    submission = relationship("Submission", back_populates="analytics_results")

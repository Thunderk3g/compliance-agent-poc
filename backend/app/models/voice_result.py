from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Numeric
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from ..database import Base

class VoiceResult(Base):
    __tablename__ = "voice_results"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    submission_id = Column(UUID(as_uuid=True), ForeignKey("submissions.id", ondelete="CASCADE"), nullable=False, index=True)
    
    transcript = Column(Text, nullable=True)
    sentiment_score = Column(Numeric(3, 2), nullable=True) # 0.00 to 1.00
    tone_analysis = Column(JSONB, nullable=True) # Detailed tone breakdown
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    submission = relationship("Submission", back_populates="voice_results")

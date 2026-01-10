from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Float
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from pgvector.sqlalchemy import Vector
from ..database import Base

class VoiceReport(Base):
    """
    Independent Voice Agent Reports.
    These are project-scoped, not submission-scoped.
    """
    __tablename__ = "voice_reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    submission_id = Column(UUID(as_uuid=True), ForeignKey("submissions.id", ondelete="SET NULL"), nullable=True, index=True)
    
    transcript = Column(Text, nullable=True)
    
    # Analysis Results
    sentiment_analysis = Column(JSONB, nullable=True)  # Sentiment breakdown
    tone_report = Column(JSONB, nullable=True)  # Tone analysis details
    extracted_entities = Column(JSONB, nullable=True) # JSON list of entities (NER)
    violations = Column(JSONB, nullable=True) # JSON list of compliance violations
    business_insights = Column(JSONB, nullable=True) # Extracted intent/categorization
    
    risk_score = Column(Float, nullable=True) # 0-100 score
    
    # Vector embedding for semantic search of the transcript
    embedding = Column(Vector(1536), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    project = relationship("Project", backref="voice_reports")
    submission = relationship("Submission", backref="voice_reports")

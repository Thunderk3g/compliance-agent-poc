from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from ..database import Base

class AnalyticsReport(Base):
    """
    Independent Analytics Agent Reports.
    These are project-scoped for business intelligence insights.
    """
    __tablename__ = "analytics_reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    
    bi_reasoning = Column(Text, nullable=True)  # The reasoning trace
    data_insights = Column(JSONB, nullable=True)  # Key insights
    metrics = Column(JSONB, nullable=True)  # Quantitative metrics
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    project = relationship("Project", backref="analytics_reports")

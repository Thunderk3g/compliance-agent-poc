from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from ..database import Base

class Project(Base):
    __tablename__ = "projects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Agent Configuration
    agent_voice = Column(Boolean, default=False)
    agent_compliance = Column(Boolean, default=True)
    agent_analytics = Column(Boolean, default=False)
    agent_sales = Column(Boolean, default=False)
    agent_config = Column(JSONB, nullable=True) # For additional agent-specific settings

    # Relationships
    owner = relationship("User", backref="projects")
    guidelines = relationship("Guideline", back_populates="project", cascade="all, delete-orphan")
    rules = relationship("Rule", back_populates="project", cascade="all, delete-orphan")
    submissions = relationship("Submission", back_populates="project", cascade="all, delete-orphan")
    agents = relationship("ProjectAgent", back_populates="project", cascade="all, delete-orphan")

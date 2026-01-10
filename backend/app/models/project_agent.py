"""Project Agents Join Table Model - Links projects to agents."""

from sqlalchemy import Column, String, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
import uuid
from ..database import Base


class ProjectAgent(Base):
    """
    Join table linking projects to their active agents.
    Allows flexible, many-to-many agent assignment with per-project config.
    """
    __tablename__ = "project_agents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    agent_type = Column(String(50), ForeignKey("agent_registry.agent_type", ondelete="CASCADE"), nullable=False)
    enabled = Column(Boolean, default=True)
    config = Column(JSONB, default={})  # Agent-specific config for this project

    # Relationships
    project = relationship("Project", back_populates="agents")
    agent = relationship("AgentRegistry")

    def __repr__(self):
        return f"<ProjectAgent project={self.project_id} agent={self.agent_type}>"

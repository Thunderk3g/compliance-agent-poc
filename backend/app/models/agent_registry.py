"""Agent Registry Model - Central agent definitions."""

from sqlalchemy import Column, String, Text, Boolean
from sqlalchemy.dialects.postgresql import JSONB
from ..database import Base


class AgentRegistry(Base):
    """
    Central registry of all available agents in the system.
    This table defines the metadata for each agent type.
    """
    __tablename__ = "agent_registry"

    agent_type = Column(String(50), primary_key=True)  # 'compliance', 'voice', 'analytics', 'sales'
    display_name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    icon_url = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    config_schema = Column(JSONB, nullable=True)  # JSON Schema for agent-specific config

    def __repr__(self):
        return f"<AgentRegistry {self.agent_type}>"

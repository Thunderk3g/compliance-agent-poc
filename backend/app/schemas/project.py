from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional, List

class AgentRegistryResponse(BaseModel):
    agent_type: str
    display_name: str
    description: Optional[str] = None
    icon_url: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True

class ProjectAgentResponse(BaseModel):
    agent_type: str
    enabled: bool
    config: Optional[dict] = None

    class Config:
        from_attributes = True

class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None

class ProjectCreate(ProjectBase):
    active_agents: Optional[List[str]] = [] # List of agent names to enable

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    active_agents: Optional[List[str]] = None # If provided, replaces current active agents

class ProjectResponse(ProjectBase):
    id: UUID
    created_by: UUID
    created_at: datetime
    agents: List[ProjectAgentResponse] = []

    class Config:
        from_attributes = True

class GuidelineResponse(BaseModel):
    id: UUID
    title: str
    created_at: datetime

    class Config:
        from_attributes = True

class ImproveRulesRequest(BaseModel):
    instructions: str

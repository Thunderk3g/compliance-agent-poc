from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional

class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    agent_voice: bool = False
    agent_compliance: bool = True
    agent_analytics: bool = False
    agent_sales: bool = False
    agent_config: Optional[dict] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    agent_voice: Optional[bool] = None
    agent_compliance: Optional[bool] = None
    agent_analytics: Optional[bool] = None
    agent_sales: Optional[bool] = None
    agent_config: Optional[dict] = None

class ProjectResponse(ProjectBase):
    id: UUID
    created_by: UUID

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

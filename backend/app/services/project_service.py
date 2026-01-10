from sqlalchemy.orm import Session
from uuid import UUID
from typing import List, Optional
from ..models.project import Project
from ..models.user import User
from ..models.project_agent import ProjectAgent
from ..models.agent_registry import AgentRegistry

class ProjectService:
    def __init__(self, db: Session):
        self.db = db

    def create_project(
        self, 
        user_id: UUID, 
        name: str, 
        description: str = None,
        active_agents: List[str] = []
    ) -> Project:
        """Create a new project for a user."""
        project = Project(
            name=name,
            description=description,
            created_by=user_id
        )
        self.db.add(project)
        self.db.flush() # Get ID before adding agents
        
        # Add agents
        if not active_agents:
            active_agents = ["compliance"] # Default agent
            
        for agent_type in active_agents:
            # Verify agent exists in registry
            agent_exists = self.db.query(AgentRegistry).filter(AgentRegistry.agent_type == agent_type).first()
            if agent_exists:
                pa = ProjectAgent(
                    project_id=project.id,
                    agent_type=agent_type,
                    enabled=True
                )
                self.db.add(pa)
        
        self.db.commit()
        self.db.refresh(project)
        return project

    def update_project(
        self, 
        project_id: UUID, 
        name: Optional[str] = None,
        description: Optional[str] = None,
        active_agents: Optional[List[str]] = None
    ) -> Optional[Project]:
        """Update an existing project."""
        project = self.get_project(project_id)
        if not project:
            return None
        
        if name is not None:
            project.name = name
        if description is not None:
            project.description = description
            
        if active_agents is not None:
            # Sync agents: removal
            current_agents = {pa.agent_type for pa in project.agents}
            target_agents = set(active_agents)
            
            # Remove agents not in target list
            for pa in list(project.agents):
                if pa.agent_type not in target_agents:
                    self.db.delete(pa)
            
            # Add new agents
            for agent_type in target_agents:
                if agent_type not in current_agents:
                    agent_exists = self.db.query(AgentRegistry).filter(AgentRegistry.agent_type == agent_type).first()
                    if agent_exists:
                        pa = ProjectAgent(
                            project_id=project.id,
                            agent_type=agent_type,
                            enabled=True
                        )
                        self.db.add(pa)
            
        self.db.commit()
        self.db.refresh(project)
        return project

    def get_user_projects(self, user_id: UUID) -> List[Project]:
        """Get all projects for a user."""
        return self.db.query(Project).filter(Project.created_by == user_id).all()

    def get_project(self, project_id: UUID) -> Optional[Project]:
        """Get a specific project."""
        return self.db.query(Project).filter(Project.id == project_id).first()
    
    def ensure_default_project(self, user_id: UUID) -> Project:
        """Ensure the user has at least one project (Default Project)."""
        projects = self.get_user_projects(user_id)
        if not projects:
            return self.create_project(user_id, "Default Project", "Your first project")
        return projects[0]

    def delete_project(self, project_id: UUID) -> bool:
        """Delete a project and all associated files."""
        project = self.get_project(project_id)
        if not project:
            return False
            
        # Delete project directory from upload_dir
        # Assuming settings is imported in routes, but better to import it here or use the path from config
        from ..config import settings
        import os
        import shutil
        
        upload_dir = os.path.join(settings.upload_dir, str(project_id))
        if os.path.exists(upload_dir):
            try:
                shutil.rmtree(upload_dir)
            except OSError as e:
                print(f"Error deleting project directory: {e}")
                
        self.db.delete(project)
        self.db.commit()
        return True

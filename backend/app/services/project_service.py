from sqlalchemy.orm import Session
from uuid import UUID
from typing import List, Optional
from ..models.project import Project
from ..models.user import User

class ProjectService:
    def __init__(self, db: Session):
        self.db = db

    def create_project(
        self, 
        user_id: UUID, 
        name: str, 
        description: str = None,
        agent_voice: bool = False,
        agent_compliance: bool = True,
        agent_analytics: bool = False,
        agent_sales: bool = False,
        agent_config: dict = None
    ) -> Project:
        """Create a new project for a user."""
        project = Project(
            name=name,
            description=description,
            created_by=user_id,
            agent_voice=agent_voice,
            agent_compliance=agent_compliance,
            agent_analytics=agent_analytics,
            agent_sales=agent_sales,
            agent_config=agent_config
        )
        self.db.add(project)
        self.db.commit()
        self.db.refresh(project)
        return project

    def update_project(
        self, 
        project_id: UUID, 
        name: Optional[str] = None,
        description: Optional[str] = None,
        agent_voice: Optional[bool] = None,
        agent_compliance: Optional[bool] = None,
        agent_analytics: Optional[bool] = None,
        agent_sales: Optional[bool] = None,
        agent_config: Optional[dict] = None
    ) -> Optional[Project]:
        """Update an existing project."""
        project = self.get_project(project_id)
        if not project:
            return None
        
        if name is not None:
            project.name = name
        if description is not None:
            project.description = description
        if agent_voice is not None:
            project.agent_voice = agent_voice
        if agent_compliance is not None:
            project.agent_compliance = agent_compliance
        if agent_analytics is not None:
            project.agent_analytics = agent_analytics
        if agent_sales is not None:
            project.agent_sales = agent_sales
        if agent_config is not None:
            project.agent_config = agent_config
            
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

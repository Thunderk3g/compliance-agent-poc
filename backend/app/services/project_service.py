from sqlalchemy.orm import Session
from uuid import UUID
from typing import List, Optional
from ..models.project import Project
from ..models.user import User

class ProjectService:
    def __init__(self, db: Session):
        self.db = db

    def create_project(self, user_id: UUID, name: str, description: str = None) -> Project:
        """Create a new project for a user."""
        project = Project(
            name=name,
            description=description,
            created_by=user_id
        )
        self.db.add(project)
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

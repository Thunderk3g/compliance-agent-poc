import uuid
from typing import List, Optional
from sqlalchemy.orm import Session
from ..models.project import Project
from ..models.submission import Submission
from ..models.rule import Rule
from ..database import get_db

class Resolvers:
    @staticmethod
    def get_projects(info) -> List[Project]:
        db = next(get_db())
        try:
            return db.query(Project).all()
        finally:
            db.close()

    @staticmethod
    def get_project(info, id: uuid.UUID) -> Optional[Project]:
        db = next(get_db())
        try:
            return db.query(Project).filter(Project.id == id).first()
        finally:
            db.close()

    @staticmethod
    def get_submissions(info, project_id: Optional[uuid.UUID] = None) -> List[Submission]:
        db = next(get_db())
        try:
            query = db.query(Submission)
            if project_id:
                query = query.filter(Submission.project_id == project_id)
            return query.all()
        finally:
            db.close()

    @staticmethod
    def get_rules(info, category: Optional[str] = None) -> List[Rule]:
        db = next(get_db())
        try:
            query = db.query(Rule)
            if category:
                query = query.filter(Rule.category == category)
            return query.all()
        finally:
            db.close()

    @staticmethod
    def get_violations(info, submission_id: uuid.UUID) -> List[any]:
        # This would require common imports or models
        from ..models.violation import Violation
        db = next(get_db())
        try:
            return db.query(Violation).filter(Violation.submission_id == submission_id).all()
        finally:
            db.close()

    @staticmethod
    def create_project(info, name: str, description: Optional[str] = None) -> Project:
        # For authenticated operations, we can check info.context
        user_id = getattr(info.context.get("request", {}), "user_id", None)
        # Note: Strawberry FastAPI context might be different, 
        # normally it's available in info.context["request"]
        
        db = next(get_db())
        try:
            project = Project(name=name, description=description)
            db.add(project)
            db.commit()
            db.refresh(project)
            return project
        finally:
            db.close()

    @staticmethod
    def delete_project(info, id: uuid.UUID) -> bool:
        db = next(get_db())
        try:
            project = db.query(Project).filter(Project.id == id).first()
            if project:
                db.delete(project)
                db.commit()
                return True
            return False
        finally:
            db.close()

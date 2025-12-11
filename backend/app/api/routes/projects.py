from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List
import shutil
import os
import uuid
from ...database import get_db
from ..deps import get_current_user_id
from ...services.project_service import ProjectService
from ...services.rule_generator_service import rule_generator_service
from ...models.guideline import Guideline
from ...config import settings
from pydantic import BaseModel

router = APIRouter(prefix="/api/projects", tags=["projects"])

# ... (ProjectCreate, ProjectResponse models) ...

@router.post("/{project_id}/guidelines")
async def upload_guideline(
    project_id: UUID,
    file: UploadFile = File(...),
    user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Upload a guideline document and extract rules."""
    service = ProjectService(db)
    project = service.get_project(project_id)
    if not project:
         raise HTTPException(status_code=404, detail="Project not found")
    if project.created_by != user_id:
         raise HTTPException(status_code=403, detail="Not authorized")

    # Save file
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in ['.pdf', '.docx', '.txt', '.html', '.md']:
        raise HTTPException(status_code=400, detail="Unsupported file format")

    upload_dir = os.path.join(settings.upload_dir, str(project_id))
    os.makedirs(upload_dir, exist_ok=True)
    
    file_path = os.path.join(upload_dir, f"{uuid.uuid4()}{file_ext}")
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Convert extension to content_type alias
    content_map = {
        '.pdf': 'pdf',
        '.docx': 'docx',
        '.txt': 'markdown', # Treat txt as markdown/text
        '.md': 'markdown',
        '.html': 'html'
    }
    content_type = content_map.get(file_ext, 'text')

    # Create Guideline record
    guideline = Guideline(
        project_id=project_id,
        title=file.filename,
        file_path=file_path
    )
    db.add(guideline)
    db.commit()
    db.refresh(guideline)

    # Extract Rules
    result = await rule_generator_service.generate_rules_from_document(
        file_path=file_path,
        content_type=content_type,
        document_title=file.filename,
        created_by_user_id=user_id,
        db=db,
        project_id=project_id,
        source_guideline_id=guideline.id
    )

    return {
        "guideline_id": guideline.id,
        "filename": guideline.title,
        "rules_extracted": result["rules_created"],
        "extraction_success": result["success"],
        "errors": result["errors"]
    }

class ProjectCreate(BaseModel):
    name: str
    description: str = None

class ProjectResponse(BaseModel):
    id: UUID
    name: str
    description: str = None
    created_by: UUID

    class Config:
        from_attributes = True

@router.post("/", response_model=ProjectResponse)
def create_project(
    project: ProjectCreate,
    user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    service = ProjectService(db)
    return service.create_project(user_id, project.name, project.description)

@router.get("/", response_model=List[ProjectResponse])
def get_projects(
    user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    service = ProjectService(db)
    # Ensure default project exists on first load
    service.ensure_default_project(user_id)
    return service.get_user_projects(user_id)

@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(
    project_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    service = ProjectService(db)
    project = service.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.created_by != user_id:
         raise HTTPException(status_code=403, detail="Not authorized to view this project")
    return project

class GuidelineResponse(BaseModel):
    id: UUID
    title: str
    created_at: str

    class Config:
        from_attributes = True

@router.get("/{project_id}/guidelines", response_model=List[GuidelineResponse])
def get_project_guidelines(
    project_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    service = ProjectService(db)
    project = service.get_project(project_id)
    if not project or project.created_by != user_id:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Assuming relationship exists, or query manually
    return db.query(Guideline).filter(Guideline.project_id == project_id).all()

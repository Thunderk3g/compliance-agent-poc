from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from uuid import UUID
from typing import List
from datetime import datetime
import shutil
import os
import uuid
from ...database import get_db
from ..deps import get_current_user_id
from ...services.project_service import ProjectService
from ...services.rule_generator_service import rule_generator_service
from ...models.guideline import Guideline
from ...models.rule import Rule
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

from ...schemas.project import ProjectCreate, ProjectResponse, GuidelineResponse, ImproveRulesRequest

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

@router.delete("/{project_id}")
def delete_project(
    project_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    service = ProjectService(db)
    project = service.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.created_by != user_id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this project")
        
    success = service.delete_project(project_id)
    if not success:
         raise HTTPException(status_code=500, detail="Failed to delete project")
         
    return {"success": True, "message": "Project deleted successfully"}

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

@router.delete("/{project_id}/guidelines/{guideline_id}")
def delete_guideline(
    project_id: UUID,
    guideline_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    service = ProjectService(db)
    project = service.get_project(project_id)
    if not project or project.created_by != user_id:
        raise HTTPException(status_code=404, detail="Project not found")

    guideline = db.query(Guideline).filter(
        Guideline.id == guideline_id,
        Guideline.project_id == project_id
    ).first()

    if not guideline:
        raise HTTPException(status_code=404, detail="Guideline not found")

    # Delete associated file
    if os.path.exists(guideline.file_path):
        try:
            os.remove(guideline.file_path)
        except OSError:
            pass # Log error but continue

    # Soft delete associated rules
    rules = db.query(Rule).filter(Rule.source_guideline_id == guideline.id).all()
    for rule in rules:
        rule.is_active = False
    
    # Delete guideline record
    db.delete(guideline)
    db.commit()

    return {"success": True, "message": "Guideline and associated rules deleted"}

@router.post("/{project_id}/guidelines/{guideline_id}/improve-rules")
async def improve_guideline_rules(
    project_id: UUID,
    guideline_id: UUID,
    request: ImproveRulesRequest,
    user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    service = ProjectService(db)
    project = service.get_project(project_id)
    if not project or project.created_by != user_id:
        raise HTTPException(status_code=404, detail="Project not found")

    guideline = db.query(Guideline).filter(
        Guideline.id == guideline_id,
        Guideline.project_id == project_id
    ).first()

    if not guideline:
        raise HTTPException(status_code=404, detail="Guideline not found")

    # Determine content type from file extension
    file_ext = os.path.splitext(guideline.file_path)[1].lower()
    content_map = {
        '.pdf': 'pdf',
        '.docx': 'docx',
        '.txt': 'markdown',
        '.md': 'markdown',
        '.html': 'html'
    }
    content_type = content_map.get(file_ext, 'text')

    # Trigger rule generation with instructions
    result = await rule_generator_service.generate_rules_from_document(
        file_path=guideline.file_path,
        content_type=content_type,
        document_title=guideline.title,
        created_by_user_id=user_id,
        db=db,
        project_id=project_id,
        source_guideline_id=guideline_id,
        instructions=request.instructions
    )

    return {
        "success": result["success"],
        "rules_added": result["rules_created"],
        "errors": result["errors"]
    }

@router.delete("/{project_id}/rules/{rule_id}")
def delete_project_rule(
    project_id: UUID,
    rule_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    service = ProjectService(db)
    project = service.get_project(project_id)
    if not project or project.created_by != user_id:
        raise HTTPException(status_code=404, detail="Project not found")

    rule = db.query(Rule).filter(
        Rule.id == rule_id,
        Rule.project_id == project_id
    ).first()

    if not rule:
        # Also check if it's linked via source guideline in this project
        rule = db.query(Rule).join(Guideline).filter(
            Rule.id == rule_id,
            Guideline.project_id == project_id
        ).first()

    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found in this project")

    # Soft delete
    rule.is_active = False
    db.commit()

    return {"success": True, "message": "Rule deleted"}


@router.post("/{project_id}/rules/{rule_id}/refine")
async def refine_project_rule(
    project_id: UUID,
    rule_id: UUID,
    request: ImproveRulesRequest,
    user_id: UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """Refine a specific rule using AI instructions."""
    service = ProjectService(db)
    project = service.get_project(project_id)
    if not project or project.created_by != user_id:
        raise HTTPException(status_code=404, detail="Project not found")

    rule = db.query(Rule).filter(
        Rule.id == rule_id,
        Rule.project_id == project_id
    ).first()

    if not rule:
        # Check source guideline
        rule = db.query(Rule).join(Guideline).filter(
            Rule.id == rule_id,
            Guideline.project_id == project_id
        ).first()

    if not rule:
        raise HTTPException(status_code=404, detail="Rule not found in this project")

    # Call AI service
    result = await rule_generator_service.refine_rule_with_ai(
        rule_text=rule.rule_text,
        refinement_instruction=request.instructions,
        category=rule.category,
        severity=rule.severity
    )

    if result["success"]:
        # Update rule in place
        rule.rule_text = result["refined_text"]
        if result["refined_keywords"]:
            rule.keywords = result["refined_keywords"]
        db.commit()
        
        return {
            "success": True,
            "rule": {
                "id": str(rule.id),
                "rule_text": rule.rule_text,
                "category": rule.category,
                "severity": rule.severity,
                "keywords": rule.keywords
            }
        }
    else:
        raise HTTPException(status_code=500, detail=f"Failed to refine rule: {result.get('error')}")

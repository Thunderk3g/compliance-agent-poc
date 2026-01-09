"""
Voice Reports API Routes
"""

import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from ...api.deps import get_db
from ...models.voice_report import VoiceReport
from ...services.agents.orchestration import voice_graph
from pydantic import BaseModel
from datetime import datetime

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/voice-reports", tags=["Voice Reports"])


class VoiceReportResponse(BaseModel):
    id: str
    project_id: str
    submission_id: str | None
    transcript: str | None
    sentiment_analysis: dict | None
    tone_report: dict | None
    created_at: datetime

    class Config:
        from_attributes = True


@router.get("/project/{project_id}", response_model=List[VoiceReportResponse])
async def get_voice_reports_by_project(
    project_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Get all voice reports for a specific project.
    """
    try:
        reports = db.query(VoiceReport).filter(
            VoiceReport.project_id == project_id
        ).order_by(VoiceReport.created_at.desc()).all()
        
        return [
            VoiceReportResponse(
                id=str(report.id),
                project_id=str(report.project_id),
                submission_id=str(report.submission_id) if report.submission_id else None,
                transcript=report.transcript,
                sentiment_analysis=report.sentiment_analysis,
                tone_report=report.tone_report,
                created_at=report.created_at
            )
            for report in reports
        ]
        
    except Exception as e:
        logger.error(f"Failed to fetch voice reports: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{project_id}/analyze")
async def trigger_voice_analysis(
    project_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Trigger a voice analysis for a project.
    """
    try:
        # For now, we use a mock state as we don't have real audio chunks yet
        # Once we have a real upload flow, this will be more complex
        state = {
            "project_id": str(project_id),
            "chunks": [{"text": "Mock call transcript for analysis."}]
        }
        
        result = await voice_graph.ainvoke(state)
        
        return {
            "status": "completed",
            "voice_report_id": result.get("voice_report_id"),
            "message": "Voice analysis completed and report generated."
        }
    except Exception as e:
        logger.error(f"Voice analysis trigger failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{report_id}", response_model=VoiceReportResponse)
async def get_voice_report(
    report_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Get a specific voice report by ID.
    """
    try:
        report = db.query(VoiceReport).filter(VoiceReport.id == report_id).first()
        
        if not report:
            raise HTTPException(status_code=404, detail="Voice report not found")
        
        return VoiceReportResponse(
            id=str(report.id),
            project_id=str(report.project_id),
            submission_id=str(report.submission_id) if report.submission_id else None,
            transcript=report.transcript,
            sentiment_analysis=report.sentiment_analysis,
            tone_report=report.tone_report,
            created_at=report.created_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to fetch voice report: {e}")
        raise HTTPException(status_code=500, detail=str(e))

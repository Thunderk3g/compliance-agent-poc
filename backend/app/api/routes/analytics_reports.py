"""
Analytics Reports API Routes
"""

import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from ...api.deps import get_db
from ...models.analytics_report import AnalyticsReport
from ...services.agents.orchestration import analytics_graph
from pydantic import BaseModel
from datetime import datetime

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/analytics-reports", tags=["Analytics Reports"])


class AnalyticsReportResponse(BaseModel):
    id: str
    project_id: str
    bi_reasoning: str | None
    data_insights: dict | None
    metrics: dict | None
    created_at: datetime

    class Config:
        from_attributes = True


@router.get("/project/{project_id}", response_model=List[AnalyticsReportResponse])
async def get_analytics_reports_by_project(
    project_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Get all analytics reports for a specific project.
    """
    try:
        reports = db.query(AnalyticsReport).filter(
            AnalyticsReport.project_id == project_id
        ).order_by(AnalyticsReport.created_at.desc()).all()
        
        return [
            AnalyticsReportResponse(
                id=str(report.id),
                project_id=str(report.project_id),
                bi_reasoning=report.bi_reasoning,
                data_insights=report.data_insights,
                metrics=report.metrics,
                created_at=report.created_at
            )
            for report in reports
        ]
        
    except Exception as e:
        logger.error(f"Failed to fetch analytics reports: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{project_id}/analyze")
async def trigger_analytics_analysis(
    project_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Trigger a BI analytics analysis for a project.
    """
    try:
        # Mock state for analytics
        state = {
            "project_id": str(project_id),
            "chunks": [{"text": "Sample data for BI analysis"}]
        }
        
        result = await analytics_graph.ainvoke(state)
        
        return {
            "status": "completed",
            "analytics_report_id": result.get("analytics_report_id"),
            "message": "Analytics reasoning completed and report generated."
        }
    except Exception as e:
        logger.error(f"Analytics analysis trigger failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{report_id}", response_model=AnalyticsReportResponse)
async def get_analytics_report(
    report_id: UUID,
    db: Session = Depends(get_db)
):
    """
    Get a specific analytics report by ID.
    """
    try:
        report = db.query(AnalyticsReport).filter(AnalyticsReport.id == report_id).first()
        
        if not report:
            raise HTTPException(status_code=404, detail="Analytics report not found")
        
        return AnalyticsReportResponse(
            id=str(report.id),
            project_id=str(report.project_id),
            bi_reasoning=report.bi_reasoning,
            data_insights=report.data_insights,
            metrics=report.metrics,
            created_at=report.created_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to fetch analytics report: {e}")
        raise HTTPException(status_code=500, detail=str(e))

"""
Analytics Reports API Routes
"""

import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from uuid import UUID

from ...api.deps import get_db
from ...models.analytics_report import AnalyticsReport
from ...services.agents.orchestration import analytics_graph
from ...services.agents.analytics.preprocessor_agent import PreprocessorAgent
from pydantic import BaseModel
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File

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


class AnalyticsChatRequest(BaseModel):
    query: str
    project_id: str
    dataset_id: Optional[str] = None
    context: dict = {}


class AnalyticsChatResponse(BaseModel):
    answer: str
    data: dict | None = None
    chart_type: str | None = None


@router.post("/seed-sales-data")
async def seed_sales_data_endpoint(
    db: Session = Depends(get_db)
):
    """
    Seed the database with synthetic sales data (Policies).
    """
    try:
        from ...scripts.seed_sales_data import seed_sales_data
        seed_sales_data(db)
        return {"message": "Sales data seeded successfully."}
    except Exception as e:
        logger.error(f"Seeding failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/upload-dataset")
async def upload_dataset(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload a CSV/Excel file for analysis. 
    Triggers the PreprocessorAgent to ingest and infer schema.
    """
    agent = PreprocessorAgent()
    try:
        content = await file.read()
        dataset_id = await agent.ingest_dataset(content, file.filename, db)
        return {"message": "Dataset uploaded successfully", "dataset_id": dataset_id}
    except Exception as e:
        logger.error(f"Upload failed: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/chat", response_model=AnalyticsChatResponse)
async def chat_with_analytics(
    request: AnalyticsChatRequest,
    db: Session = Depends(get_db)
):
    """
    Chat with the Analytics Agent about project data.
    """
    try:
        from ...services.agents.orchestration import analytics_graph
        
        # Initialize state for the graph
        state_input = {
            "project_id": request.project_id,
            "analytics_query": request.query,
            "dataset_id": request.dataset_id,
            "chunks": [], # In a real scenario, we might need to load chunks if context requires it
            "messages": [],
            "status": "pending_analytics"
        }
        
        # Execute Graph (Traced by LangSmith/LangGraph)
        result_state = await analytics_graph.ainvoke(state_input)
        
        # Extract Results
        analytics_result = result_state.get("analytics_result", {})
        data_insights = analytics_result.get("data_insights", {})
        
        narrative = analytics_result.get("bi_reasoning", "Analysis failed.")
        chart_config = data_insights.get("chart_config")
        
        # Map to Chat Response
        chart_type = None
        chart_data = None
        
        if chart_config:
            chart_type = chart_config.get("type", "bar")
            chart_data = chart_config.get("data")
        
        return AnalyticsChatResponse(
            answer=narrative,
            data=chart_data,
            chart_type=chart_type
        )
        
    except Exception as e:
        logger.error(f"Analytics chat failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

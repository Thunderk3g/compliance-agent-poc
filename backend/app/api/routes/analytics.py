"""
Analytics API Routes

Endpoints for BI reasoning and executive insights.
"""

import logging
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

from ...services.agents.analytics.analytics_agent import AnalyticsAgent

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/analytics", tags=["Analytics"])

# Agent instance
analytics_agent = AnalyticsAgent()


class InsightRequest(BaseModel):
    """Request body for analytics insights."""
    query: str
    project_id: Optional[str] = None
    date_range: Optional[str] = None  # e.g., "last_30_days", "this_quarter"


class InsightResponse(BaseModel):
    """Response from analytics reasoning."""
    query: str
    reasoning_steps: List[Dict[str, Any]]
    metrics: Dict[str, Any]
    trends: Dict[str, Any]
    anomalies: List[Dict[str, Any]]
    narrative: str
    generated_at: datetime
    status: str = "completed"
    error: Optional[str] = None


@router.post("/insights", response_model=InsightResponse)
async def get_insights(request: InsightRequest):
    """
    Generate AI-powered insights from compliance data.
    
    Uses multi-step reasoning to:
    1. Parse query intent
    2. Plan data fetches
    3. Analyze trends
    4. Detect anomalies
    5. Generate executive narrative
    """
    try:
        input_data = {
            "analytics_query": request.query,
            "project_id": request.project_id
        }
        
        result = await analytics_agent.reason(input_data)
        
        return InsightResponse(
            query=result.get("query", request.query),
            reasoning_steps=result.get("reasoning_steps", []),
            metrics=result.get("metrics", {}),
            trends=result.get("trends", {}),
            anomalies=result.get("anomalies", []),
            narrative=result.get("narrative", ""),
            generated_at=datetime.fromisoformat(result.get("generated_at")) if result.get("generated_at") else datetime.now(),
            status="completed" if "error" not in result else "failed",
            error=result.get("error")
        )
        
    except Exception as e:
        logger.error(f"Analytics insight generation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/trends")
async def get_trends(
    period: str = Query("month", description="Period: week, month, quarter, year"),
    project_id: Optional[str] = None
):
    """
    Get submission and compliance trends for specified period.
    """
    try:
        result = await analytics_agent.get_submission_trends(period)
        return {
            "period": period,
            "data": result,
            "generated_at": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Trend fetch failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/heatmap")
async def get_violation_heatmap(project_id: Optional[str] = None):
    """
    Get violation heatmap by category and severity.
    """
    try:
        result = await analytics_agent.get_violation_heatmap(project_id)
        return {
            "project_id": project_id,
            "data": result,
            "generated_at": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Heatmap fetch failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/performance")
async def get_agent_performance():
    """
    Get LLM agent performance metrics.
    
    Returns token usage, response times, success rates, and cost estimates.
    """
    try:
        result = await analytics_agent.get_agent_performance()
        return {
            "data": result,
            "generated_at": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Performance fetch failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/summary")
async def get_executive_summary():
    """
    Generate executive summary of compliance status.
    
    Uses the BI Reasoning Agent's narrative generator.
    """
    try:
        input_data = {"analytics_query": "Generate executive summary report"}
        result = await analytics_agent.reason(input_data)
        
        return {
            "summary": result.get("narrative", ""),
            "metrics": result.get("metrics", {}),
            "generated_at": datetime.now().isoformat()
        }
    except Exception as e:
        logger.error(f"Summary generation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

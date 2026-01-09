import logging
import uuid
import datetime
from typing import Dict, Any
from langchain_core.messages import AIMessage

from .state import ComplianceState
from app.models.analytics_report import AnalyticsReport
from app.database import SessionLocal

logger = logging.getLogger(__name__)

async def analytics_reasoning_node(state: ComplianceState):
    """
    Analytics Agent Reasoning Node.
    Performs business intelligence analysis on project data.
    """
    logger.info("Node: Analytics Reasoning running...")
    
    chunks_data = state.get("chunks", [])
    project_id = state.get("project_id")
    
    # Aggregate chunk data for analysis
    total_chunks = len(chunks_data)
    avg_chunk_size = sum(len(chunk.get("text", "")) for chunk in chunks_data) / total_chunks if total_chunks > 0 else 0
    
    # Mocked BI reasoning (replace with real LLM call)
    bi_reasoning = f"""
    Business Intelligence Analysis:
    - Total content chunks analyzed: {total_chunks}
    - Average chunk size: {avg_chunk_size:.0f} characters
    - Data quality assessment: High
    - Recommended actions: Continue with compliance review
    """
    
    data_insights = {
        "content_volume": total_chunks,
        "avg_content_length": avg_chunk_size,
        "quality_score": 0.85,
        "insights": [
            "Content is well-structured",
            "Suitable for automated analysis",
            "Recommend periodic review"
        ]
    }
    
    metrics = {
        "total_chunks": total_chunks,
        "processing_time_ms": 250,
        "quality_indicators": {
            "completeness": 0.9,
            "clarity": 0.8,
            "relevance": 0.85
        }
    }
    
    analytics_result = {
        "bi_reasoning": bi_reasoning.strip(),
        "data_insights": data_insights,
        "metrics": metrics
    }
    
    return {
        "analytics_result": analytics_result,
        "messages": [AIMessage(content="Analytics Reasoning: BI analysis completed.")]
    }


async def analytics_output_node(state: ComplianceState):
    """
    Analytics Agent Output Node.
    Persists the analytics result to the database.
    """
    logger.info("Node: Analytics Output running...")
    
    db = SessionLocal()
    try:
        analytics_result = state.get("analytics_result")
        project_id = state.get("project_id")
        
        if not analytics_result:
            logger.warning("No analytics result to save.")
            return {"messages": [AIMessage(content="Analytics Output: No data to persist.")]}
        
        # Create DB record
        report = AnalyticsReport(
            project_id=uuid.UUID(project_id) if project_id else None,
            bi_reasoning=analytics_result.get("bi_reasoning"),
            data_insights=analytics_result.get("data_insights"),
            metrics=analytics_result.get("metrics")
        )
        
        db.add(report)
        db.commit()
        db.refresh(report)
        
        logger.info(f"Analytics report saved: {report.id}")
        
        return {
            "analytics_report_id": str(report.id),
            "messages": [AIMessage(content=f"Analytics Output: Report saved as {report.id}.")]
        }
        
    except Exception as e:
        logger.error(f"Analytics output failed: {e}")
        db.rollback()
        return {
            "messages": [AIMessage(content=f"Analytics Output: Error - {str(e)}")]
        }
    finally:
        db.close()

import logging
import uuid
import datetime
from typing import Dict, Any
from langchain_core.messages import AIMessage

from .state import ComplianceState
from app.models.analytics_report import AnalyticsReport
from app.database import SessionLocal
from langsmith import traceable

logger = logging.getLogger(__name__)

@traceable(name="Analytics Node: Reasoning", run_type="chain")
async def analytics_reasoning_node(state: ComplianceState):
    """
    Analytics Agent Reasoning Node.
    Performs business intelligence analysis on project data.
    """
    logger.info("Node: Analytics Reasoning running...")
    
    chunks_data = state.get("chunks", [])
    project_id = state.get("project_id")
    
    # Initialize Agent
    from app.services.agents.analytics.analytics_agent import AnalyticsAgent
    agent = AnalyticsAgent()
    
    # Construct input for agent
    input_data = {
        "analytics_query": state.get("analytics_query", "executive_summary"),
        "project_id": state.get("project_id"),
        "dataset_id": state.get("dataset_id")
    }
    
    # Execute reasoning loop
    # We pass the DB session explicitly to ensure the agent can access the database
    db = SessionLocal()
    try:
        insight_result = await agent.reason(input_data, db=db)
    finally:
        db.close()
    
    # Map agent result to expected structure for DB Report
    # The agent returns: {"metrics": ..., "trends": ..., "anomalies": ..., "narrative": ...}
    # DB Report expects: bi_reasoning, data_insights, metrics
    
    # Calculate content metrics
    total_chunks = len(chunks_data)
    avg_chunk_size = sum(len(c.get("text", "")) for c in chunks_data) / len(chunks_data) if chunks_data else 0

    analytics_result = {
        "bi_reasoning": insight_result.get("narrative"),
        "data_insights": {
            "content_volume": total_chunks,
            "avg_content_length": avg_chunk_size,
            "trends": insight_result.get("trends"),
            "anomalies": [a.get("probable_cause") for a in insight_result.get("anomalies", [])],
            "chart_config": insight_result.get("chart_config"),
            "key_insights": insight_result.get("key_insights")
        },
        "metrics": insight_result.get("metrics")
    }
    
    return {
        "analytics_result": analytics_result,
        "messages": [AIMessage(content="Analytics Reasoning: BI analysis completed.")]
    }


@traceable(name="Analytics Node: Output", run_type="chain")
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

import logging
import uuid
import datetime
from typing import Dict, Any
from langchain_core.messages import AIMessage

from .state import ComplianceState
from app.models.voice_report import VoiceReport
from app.database import SessionLocal

logger = logging.getLogger(__name__)

async def voice_analysis_node(state: ComplianceState):
    """
    Voice Agent Analysis Node.
    Analyzes text content for sentiment and tone (mocked for now).
    """
    logger.info("Node: Voice Analysis running...")
    
    chunks_data = state.get("chunks", [])
    project_id = state.get("project_id")
    
    # Aggregate all chunks text (simplified)
    full_text = " ".join([chunk.get("text", "") for chunk in chunks_data])
    
    # Mocked sentiment analysis (replace with real LLM call)
    sentiment_analysis = {
        "overall_sentiment": "neutral",
        "confidence": 0.75,
        "positive_score": 0.3,
        "negative_score": 0.2,
        "neutral_score": 0.5
    }
    
    tone_report = {
        "primary_tone": "professional",
        "secondary_tones": ["informative", "formal"],
        "emotional_indicators": {
            "confidence": "high",
            "urgency": "low"
        }
    }
    
    # Store in state for later persistence
    voice_result = {
        "transcript": full_text[:500] + "...",  # Truncated for demo
        "sentiment_analysis": sentiment_analysis,
        "tone_report": tone_report
    }
    
    return {
        "voice_result": voice_result,
        "messages": [AIMessage(content="Voice Analysis: Sentiment and tone analyzed.")]
    }


async def voice_output_node(state: ComplianceState):
    """
    Voice Agent Output Node.
    Persists the voice analysis result to the database.
    """
    logger.info("Node: Voice Output running...")
    
    db = SessionLocal()
    try:
        voice_result = state.get("voice_result")
        project_id = state.get("project_id")
        submission_id = state.get("submission_id")
        
        if not voice_result:
            logger.warning("No voice result to save.")
            return {"messages": [AIMessage(content="Voice Output: No data to persist.")]}
        
        # Create DB record
        report = VoiceReport(
            project_id=uuid.UUID(project_id) if project_id else None,
            submission_id=uuid.UUID(submission_id) if submission_id else None,
            transcript=voice_result.get("transcript"),
            sentiment_analysis=voice_result.get("sentiment_analysis"),
            tone_report=voice_result.get("tone_report")
        )
        
        db.add(report)
        db.commit()
        db.refresh(report)
        
        logger.info(f"Voice report saved: {report.id}")
        
        return {
            "voice_report_id": str(report.id),
            "messages": [AIMessage(content=f"Voice Output: Report saved as {report.id}.")]
        }
        
    except Exception as e:
        logger.error(f"Voice output failed: {e}")
        db.rollback()
        return {
            "messages": [AIMessage(content=f"Voice Output: Error - {str(e)}")]
        }
    finally:
        db.close()

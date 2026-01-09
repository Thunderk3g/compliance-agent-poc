"""
Voice Audit API Routes

Endpoints for call transcription and compliance analysis.
"""

import logging
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from uuid import UUID, uuid4

from ...services.agents.voice.voice_agent import VoiceAuditAgent

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/voice", tags=["Voice Audit"])

# Agent instance
voice_agent = VoiceAuditAgent()


class VoiceAnalysisRequest(BaseModel):
    """Request body for voice analysis."""
    call_id: Optional[str] = None
    transcript: Optional[List[Dict[str, Any]]] = None
    audio_url: Optional[str] = None


class VoiceAnalysisResponse(BaseModel):
    """Response from voice analysis."""
    call_id: str
    status: str
    duration_seconds: Optional[float] = None
    speakers: Optional[List[str]] = None
    sentiment_analysis: Optional[Dict[str, Any]] = None
    extracted_entities: Optional[Dict[str, List[str]]] = None
    violations: Optional[List[Dict[str, Any]]] = None
    business_insights: Optional[Dict[str, Any]] = None
    error: Optional[str] = None


@router.post("/analyze", response_model=VoiceAnalysisResponse)
async def analyze_call(request: VoiceAnalysisRequest):
    """
    Analyze a call transcript for compliance violations.
    
    Accepts either:
    - A pre-transcribed call (transcript field)
    - An audio URL for transcription (audio_url field)
    
    Returns sentiment analysis, extracted entities, and violations.
    """
    try:
        input_data = {
            "call_id": request.call_id or str(uuid4()),
        }
        
        if request.transcript:
            input_data["transcript"] = request.transcript
        
        if request.audio_url:
            input_data["audio_url"] = request.audio_url
        
        result = await voice_agent.process(input_data)
        
        return VoiceAnalysisResponse(
            call_id=result.get("call_id", ""),
            status="completed" if "error" not in result else "failed",
            duration_seconds=result.get("duration_seconds"),
            speakers=result.get("speakers"),
            sentiment_analysis=result.get("sentiment_analysis"),
            extracted_entities=result.get("extracted_entities"),
            violations=result.get("violations"),
            business_insights=result.get("business_insights"),
            error=result.get("error")
        )
        
    except Exception as e:
        logger.error(f"Voice analysis failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/upload")
async def upload_audio(
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = None
):
    """
    Upload an audio file for async transcription and analysis.
    
    Supports: MP3, WAV, M4A, WebM
    Max size: 100MB
    
    Returns a job_id to track progress.
    """
    # Validate file type
    allowed_types = ["audio/mpeg", "audio/wav", "audio/m4a", "audio/webm", "audio/mp3"]
    if file.content_type and file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported file type: {file.content_type}. Allowed: {allowed_types}"
        )
    
    job_id = str(uuid4())
    
    # TODO: Save file and queue for async processing
    # For now, return placeholder job_id
    
    return {
        "job_id": job_id,
        "status": "queued",
        "message": "Audio file queued for processing. Use /voice/status/{job_id} to check progress.",
        "note": "Whisper transcription not yet configured - using placeholder"
    }


@router.get("/status/{job_id}")
async def get_job_status(job_id: str):
    """
    Check the status of an async voice analysis job.
    """
    # TODO: Implement job status lookup from Redis
    return {
        "job_id": job_id,
        "status": "pending",
        "progress": 0,
        "message": "Job tracking not yet implemented"
    }


@router.get("/violations/types")
async def get_violation_types():
    """
    Get list of supported IRDAI call violation types.
    """
    return {
        "violation_types": [
            {
                "type": "guaranteed_returns",
                "severity": "critical",
                "description": "Promising guaranteed returns not supported by policy"
            },
            {
                "type": "missing_free_look",
                "severity": "major",
                "description": "Failing to mention 15-day free-look cancellation period"
            },
            {
                "type": "pressure_tactics",
                "severity": "major",
                "description": "Using urgency language to pressure customer"
            },
            {
                "type": "misrepresentation",
                "severity": "critical",
                "description": "Claims not matching policy documents"
            },
            {
                "type": "missing_risk_disclosure",
                "severity": "major",
                "description": "No mention of market risks for ULIP products"
            }
        ]
    }

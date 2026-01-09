"""
Sales Chat API Routes

Endpoints for bilingual customer chat and underwriting assistance.
"""

import logging
from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import uuid4

from ...services.agents.sales.sales_agent import SalesAgent

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/chat", tags=["Sales Chat"])

# Agent instance
sales_agent = SalesAgent()


class ChatRequest(BaseModel):
    """Request body for chat message."""
    message: str
    session_id: Optional[str] = None
    language: Optional[str] = None  # "en" or "hi"


class ChatResponse(BaseModel):
    """Response from sales agent."""
    session_id: str
    language: str
    response: str
    extracted_profile: Optional[Dict[str, Any]] = None
    risk_assessment: Optional[Dict[str, Any]] = None
    product_recommendations: Optional[List[Dict[str, Any]]] = None
    compliance_flags: List[str] = []


@router.post("/message", response_model=ChatResponse)
async def send_message(request: ChatRequest):
    """
    Send a message to the sales assistant.
    
    Features:
    - Bilingual support (English/Hindi auto-detection)
    - RAG-based product knowledge
    - Real-time profile extraction
    - Underwriting risk assessment
    - Compliance guardrails
    """
    try:
        input_data = {
            "customer_message": request.message,
            "session_id": request.session_id or str(uuid4()),
        }
        
        result = await sales_agent.respond(input_data)
        
        # Extract the last assistant message as response
        messages = result.get("messages", [])
        last_response = ""
        for msg in reversed(messages):
            if msg.get("role") == "assistant":
                last_response = msg.get("content", "")
                break
        
        return ChatResponse(
            session_id=result.get("session_id", ""),
            language=result.get("language", "en"),
            response=last_response,
            extracted_profile=result.get("extracted_profile"),
            risk_assessment=result.get("risk_assessment"),
            product_recommendations=result.get("product_recommendations"),
            compliance_flags=result.get("compliance_flags", [])
        )
        
    except Exception as e:
        logger.error(f"Chat message failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/history/{session_id}")
async def get_chat_history(session_id: str):
    """
    Get chat history for a session.
    """
    history = sales_agent.conversation_history.get(session_id, [])
    
    return {
        "session_id": session_id,
        "messages": [
            {
                "role": m.role,
                "content": m.content,
                "timestamp": m.timestamp.isoformat(),
                "language": m.language.value
            }
            for m in history
        ],
        "message_count": len(history)
    }


@router.get("/profile/{session_id}")
async def get_customer_profile(session_id: str):
    """
    Get extracted customer profile for a session.
    """
    profile = sales_agent.extracted_profiles.get(session_id)
    
    if not profile:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return {
        "session_id": session_id,
        "profile": profile.model_dump(),
        "completeness": sum(1 for v in profile.model_dump().values() if v is not None) / 7
    }


@router.post("/risk-assessment")
async def calculate_risk(
    age: int,
    smoker: Optional[bool] = None,
    occupation: Optional[str] = None,
    pre_existing: Optional[List[str]] = None
):
    """
    Calculate underwriting risk for given profile data.
    
    Independent of chat session - direct API for quick risk checks.
    """
    from ...services.agents.sales.sales_agent import CustomerProfile
    
    profile = CustomerProfile(
        age=age,
        smoker=smoker,
        occupation=occupation,
        pre_existing_conditions=pre_existing or []
    )
    
    risk = await sales_agent._calculate_risk(profile)
    
    return {
        "profile": profile.model_dump(),
        "risk_assessment": risk.model_dump(mode="json")
    }


@router.websocket("/ws/{session_id}")
async def websocket_chat(websocket: WebSocket, session_id: str):
    """
    WebSocket endpoint for real-time chat.
    
    Enables streaming responses and live profile updates.
    """
    await websocket.accept()
    logger.info(f"WebSocket connected: {session_id}")
    
    try:
        while True:
            # Receive message
            data = await websocket.receive_json()
            message = data.get("message", "")
            
            # Process through agent
            input_data = {
                "customer_message": message,
                "session_id": session_id
            }
            
            result = await sales_agent.respond(input_data)
            
            # Extract response
            messages = result.get("messages", [])
            last_response = ""
            for msg in reversed(messages):
                if msg.get("role") == "assistant":
                    last_response = msg.get("content", "")
                    break
            
            # Send response
            await websocket.send_json({
                "type": "message",
                "content": last_response,
                "language": result.get("language", "en"),
                "profile_update": result.get("extracted_profile"),
                "risk_update": result.get("risk_assessment"),
                "recommendations": result.get("product_recommendations")
            })
            
    except WebSocketDisconnect:
        logger.info(f"WebSocket disconnected: {session_id}")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        await websocket.close(code=1011, reason=str(e))

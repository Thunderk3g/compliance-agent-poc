"""
Voice Audit Agent - Call Transcription and Compliance Analysis

Specialist Focus: Call transcription, emotional analysis, violation detection
Processes audio transcripts from customer calls to ensure legal and emotional alignment.
"""

import logging
import os
import json
import base64
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from datetime import datetime

try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    genai = None

logger = logging.getLogger(__name__)


class SentimentScore(BaseModel):
    """Sentiment analysis result for a speaker."""
    overall: float  # -1 to +1
    trajectory: List[float] = []


class ExtractedEntity(BaseModel):
    """Named entity extracted from call."""
    entity_type: str  # POLICY_NUMBER, PREMIUM_AMOUNT, DATE, etc.
    value: str
    timestamp: Optional[float] = None


class CallViolation(BaseModel):
    """Detected compliance violation in call."""
    type: str  # guaranteed_returns, missing_free_look, pressure_tactics, etc.
    severity: str  # critical, major, minor
    timestamp: float  # seconds into call
    evidence: str  # exact quote
    suggested_correction: Optional[str] = None


class BusinessInsight(BaseModel):
    """Business context from the call."""
    call_reason: str  # policy_inquiry, complaint, claim, renewal
    resolution: str  # resolved, escalated, pending
    cross_sell_attempts: List[str] = []
    recommended_followup: Optional[str] = None


class VoiceAnalysisResult(BaseModel):
    """Complete analysis result for a call."""
    call_id: str
    duration_seconds: float
    speakers: List[str]
    transcript: List[Dict[str, Any]]
    sentiment_analysis: Dict[str, SentimentScore]
    extracted_entities: Dict[str, List[str]]
    violations: List[CallViolation]
    business_insights: BusinessInsight


class VoiceAuditAgent:
    """
    Senior Voice Intelligence Auditor
    
    Analyzes call transcripts for:
    - Miss-selling and compliance breaches
    - Script deviations
    - Sentiment analysis (agent and customer)
    - Named entity recognition (products, dates, premiums)
    """
    
    # IRDAI Call Compliance Keywords
    GUARANTEED_RETURNS_PHRASES = [
        "guaranteed returns", "assured benefit", "guaranteed 15%",
        "guaranteed profit", "100% assured", "no risk"
    ]
    
    PRESSURE_TACTICS_PHRASES = [
        "offer expires today", "last chance", "only today",
        "limited time offer", "act now", "don't miss"
    ]
    
    FREE_LOOK_KEYWORDS = [
        "free-look", "free look", "15 days", "15-day",
        "cancel within", "return the policy"
    ]
    
    def __init__(self):
        self.transcription_service = None  # Will be initialized when Whisper is available
        self.sentiment_analyzer = None
        self.gemini_model = None
        
        # Initialize Gemini client if available
        if GEMINI_AVAILABLE:
            api_key = os.environ.get("GEMINI_API_KEY")
            if api_key:
                try:
                    genai.configure(api_key=api_key)
                    self.gemini_model = genai.GenerativeModel("gemini-1.5-flash")
                    logger.info("Gemini model initialized for audio analysis")
                except Exception as e:
                    logger.warning(f"Failed to initialize Gemini: {e}")
            else:
                logger.warning("GEMINI_API_KEY not found in environment")
        else:
            logger.warning("google-generativeai not installed, Gemini audio analysis unavailable")
        
        logger.info("VoiceAuditAgent initialized")
    
    async def process_audio_file(
        self,
        audio_bytes: bytes,
        mime_type: str,
        call_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Analyze an audio file using Gemini 1.5 Flash.
        
        Args:
            audio_bytes: Raw audio file data.
            mime_type: MIME type of the audio (e.g., 'audio/wav', 'audio/mpeg').
            call_id: Optional identifier for the call.
            
        Returns:
            Full analysis result with transcript, violations, sentiment, etc.
        """
        call_id = call_id or f"call_{datetime.now().timestamp()}"
        
        if not self.gemini_model:
            logger.error("Gemini model not available for audio analysis")
            return {
                "call_id": call_id,
                "error": "Gemini model not configured. Please set GEMINI_API_KEY.",
                "status": "failed"
            }
        
        try:
            # Encode audio to base64
            audio_base64 = base64.b64encode(audio_bytes).decode("utf-8")
            
            prompt = """You are an insurance compliance auditor for Bajaj Life Insurance. 
Listen to this call and identify potential mis-selling or regulatory violations 
as per IRDAI guidelines. Provide a structured audit report.

Focus on:
1. Guaranteed return claims (critical violation)
2. Omission of policy risks
3. Failure to disclose mandatory policy details (free-look period, exclusions)
4. Misleading statements
5. High-pressure sales tactics to close deals

Provide your response as a JSON object with the following structure:
{
    "riskScore": <0-100>,
    "riskLevel": "Low" | "Medium" | "High",
    "summary": "<brief summary>",
    "metadata": {
        "agentName": "<string or Unknown>",
        "customerName": "<string or Unknown>",
        "duration": "<mm:ss>",
        "department": "<string or Unknown>",
        "callDate": "<string or Unknown>"
    },
    "issues": [
        {
            "id": "<unique_id>",
            "category": "<violation type>",
            "excerpt": "<exact quote from call>",
            "explanation": "<why this is a violation>",
            "confidence": <0.0-1.0>,
            "startTime": <seconds>,
            "endTime": <seconds>,
            "severity": "critical" | "major" | "minor"
        }
    ],
    "transcript": [
        {
            "speaker": "Agent" | "Customer",
            "text": "<dialogue>",
            "timestamp": "<mm:ss>"
        }
    ]
}"""
            
            # Create the content with inline audio data
            response = await self._call_gemini_with_audio(audio_base64, mime_type, prompt)
            
            # Parse the response
            result_data = self._parse_gemini_response(response, call_id)
            return result_data
            
        except Exception as e:
            logger.error(f"Audio analysis failed: {e}", exc_info=True)
            return {
                "call_id": call_id,
                "error": str(e),
                "status": "failed"
            }
    
    async def _call_gemini_with_audio(
        self,
        audio_base64: str,
        mime_type: str,
        prompt: str
    ) -> str:
        """Call Gemini API with audio data."""
        import asyncio
        
        def _blocking_call():
            # Create inline audio part
            audio_part = {
                "inline_data": {
                    "data": audio_base64,
                    "mime_type": mime_type
                }
            }
            
            response = self.gemini_model.generate_content(
                [audio_part, prompt],
                generation_config={
                    "response_mime_type": "application/json"
                }
            )
            return response.text
        
        # Run the blocking call in a thread pool
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(None, _blocking_call)
        return result
    
    def _parse_gemini_response(self, response_text: str, call_id: str) -> Dict[str, Any]:
        """Parse Gemini JSON response into our result format."""
        try:
            data = json.loads(response_text)
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse Gemini response: {e}")
            return {
                "call_id": call_id,
                "error": f"Invalid JSON response from Gemini: {e}",
                "status": "failed",
                "raw_response": response_text[:500]  # Include partial response for debugging
            }
        
        # Map Gemini response to our VoiceAnalysisResult format
        transcript = []
        for item in data.get("transcript", []):
            transcript.append({
                "speaker": item.get("speaker", "Unknown").lower(),
                "text": item.get("text", ""),
                "timestamp": self._parse_timestamp(item.get("timestamp", "00:00"))
            })
        
        violations = []
        for issue in data.get("issues", []):
            violations.append(CallViolation(
                type=issue.get("category", "unknown"),
                severity=issue.get("severity", "minor"),
                timestamp=issue.get("startTime", 0),
                evidence=issue.get("excerpt", ""),
                suggested_correction=issue.get("explanation", "")
            ))
        
        # Build sentiment from metadata or defaults
        sentiment = {
            "agent": SentimentScore(overall=0.5, trajectory=[0.5]),
            "customer": SentimentScore(overall=0.5, trajectory=[0.5])
        }
        
        # Extract entities (basic from transcript text)
        full_text = " ".join([t.get("text", "") for t in transcript])
        entities = self._extract_entities_sync(full_text)
        
        # Build business insights
        metadata = data.get("metadata", {})
        insights = BusinessInsight(
            call_reason="inquiry",
            resolution="pending",
            cross_sell_attempts=[],
            recommended_followup="Review call" if violations else None
        )
        
        # Calculate duration from metadata or transcript
        duration_str = metadata.get("duration", "00:00")
        duration_seconds = self._parse_timestamp(duration_str)
        
        result = VoiceAnalysisResult(
            call_id=call_id,
            duration_seconds=duration_seconds,
            speakers=["agent", "customer"],
            transcript=transcript,
            sentiment_analysis=sentiment,
            extracted_entities=entities,
            violations=violations,
            business_insights=insights
        )
        
        # Add Gemini-specific fields
        result_dict = result.model_dump()
        result_dict["gemini_risk_score"] = data.get("riskScore", 0)
        result_dict["gemini_risk_level"] = data.get("riskLevel", "Unknown")
        result_dict["gemini_summary"] = data.get("summary", "")
        result_dict["metadata"] = metadata
        result_dict["status"] = "completed"
        
        return result_dict
    
    def _parse_timestamp(self, ts: str) -> float:
        """Convert mm:ss or ss string to seconds."""
        if isinstance(ts, (int, float)):
            return float(ts)
        if not isinstance(ts, str):
            return 0.0
        parts = ts.split(":")
        try:
            if len(parts) == 2:
                return float(parts[0]) * 60 + float(parts[1])
            elif len(parts) == 1:
                return float(parts[0])
            elif len(parts) == 3:  # hh:mm:ss
                return float(parts[0]) * 3600 + float(parts[1]) * 60 + float(parts[2])
        except ValueError:
            return 0.0
        return 0.0
    
    def _extract_entities_sync(self, full_text: str) -> Dict[str, List[str]]:
        """Synchronous entity extraction for use in parsing."""
        import re
        entities = {
            "policy_numbers": [],
            "amounts": [],
            "dates": [],
            "policy_types": []
        }
        policy_pattern = r'POL-\d{5,}'
        entities["policy_numbers"] = re.findall(policy_pattern, full_text)
        amount_pattern = r'[₹Rs\.]+\s*[\d,]+(?:\s*(?:lakh|crore|thousand))?'
        entities["amounts"] = re.findall(amount_pattern, full_text, re.IGNORECASE)
        return entities

    
    async def process(
        self, 
        input_data: Dict[str, Any],
        **kwargs
    ) -> Dict[str, Any]:
        """
        Main entry point for voice analysis.
        
        Args:
            input_data: Contains audio_file or audio_url
            
        Returns:
            VoiceAnalysisResult as dictionary
        """
        call_id = input_data.get("call_id", f"call_{datetime.now().timestamp()}")
        
        try:
            # Step 1: Transcribe audio (placeholder for Whisper integration)
            transcript = await self._transcribe_audio(input_data)
            
            # Step 2: Analyze sentiment
            sentiment = await self._analyze_sentiment(transcript)
            
            # Step 3: Extract entities
            entities = await self._extract_entities(transcript)
            
            # Step 4: Detect violations
            violations = await self._detect_violations(transcript)
            
            # Step 5: Generate business insights
            insights = await self._generate_insights(transcript, violations)
            
            result = VoiceAnalysisResult(
                call_id=call_id,
                duration_seconds=self._calculate_duration(transcript),
                speakers=["agent", "customer"],
                transcript=transcript,
                sentiment_analysis=sentiment,
                extracted_entities=entities,
                violations=violations,
                business_insights=insights
            )
            
            return result.model_dump()
            
        except Exception as e:
            logger.error(f"Voice analysis failed: {e}")
            return {
                "call_id": call_id,
                "error": str(e),
                "status": "failed"
            }
    
    async def _transcribe_audio(
        self, 
        input_data: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        Transcribe audio using Whisper.
        
        TODO: Integrate OpenAI Whisper for actual transcription.
        Currently returns placeholder for testing dispatcher.
        """
        # Placeholder transcript for testing
        if "transcript" in input_data:
            return input_data["transcript"]
        
        logger.warning("Whisper not configured - using placeholder transcript")
        return [
            {"timestamp": 0, "speaker": "agent", "text": "Hello, welcome to insurance services."},
            {"timestamp": 5, "speaker": "customer", "text": "Hi, I want to know about term insurance."},
        ]
    
    async def _analyze_sentiment(
        self, 
        transcript: List[Dict[str, Any]]
    ) -> Dict[str, SentimentScore]:
        """
        Analyze emotional tone for both speakers.
        
        TODO: Integrate sentiment analysis model.
        """
        # Placeholder sentiment scores
        return {
            "agent": SentimentScore(overall=0.7, trajectory=[0.6, 0.7, 0.8]),
            "customer": SentimentScore(overall=0.5, trajectory=[0.4, 0.5, 0.6])
        }
    
    async def _extract_entities(
        self, 
        transcript: List[Dict[str, Any]]
    ) -> Dict[str, List[str]]:
        """
        Extract named entities using spaCy custom NER.
        
        TODO: Integrate spaCy with custom insurance entities.
        """
        full_text = " ".join([t["text"] for t in transcript])
        
        entities = {
            "policy_numbers": [],
            "amounts": [],
            "dates": [],
            "policy_types": []
        }
        
        # Simple pattern matching for now
        import re
        
        # Policy numbers (POL-XXXXX pattern)
        policy_pattern = r'POL-\d{5,}'
        entities["policy_numbers"] = re.findall(policy_pattern, full_text)
        
        # Amounts (₹ or Rs format)
        amount_pattern = r'[₹Rs\.]+\s*[\d,]+(?:\s*(?:lakh|crore|thousand))?'
        entities["amounts"] = re.findall(amount_pattern, full_text, re.IGNORECASE)
        
        return entities
    
    async def _detect_violations(
        self, 
        transcript: List[Dict[str, Any]]
    ) -> List[CallViolation]:
        """
        Detect IRDAI compliance violations in call.
        """
        violations = []
        full_text = " ".join([t["text"] for t in transcript]).lower()
        
        # Check for guaranteed returns claims
        for phrase in self.GUARANTEED_RETURNS_PHRASES:
            if phrase.lower() in full_text:
                violations.append(CallViolation(
                    type="guaranteed_returns",
                    severity="critical",
                    timestamp=0,  # TODO: Find actual timestamp
                    evidence=phrase,
                    suggested_correction="Returns are subject to market performance and not guaranteed."
                ))
        
        # Check for pressure tactics
        for phrase in self.PRESSURE_TACTICS_PHRASES:
            if phrase.lower() in full_text:
                violations.append(CallViolation(
                    type="pressure_tactics",
                    severity="major",
                    timestamp=0,
                    evidence=phrase,
                    suggested_correction="Avoid urgency language. Allow customer time to decide."
                ))
        
        # Check for missing free-look period mention
        has_free_look_mention = any(
            kw.lower() in full_text for kw in self.FREE_LOOK_KEYWORDS
        )
        if not has_free_look_mention and len(transcript) > 5:
            violations.append(CallViolation(
                type="missing_free_look",
                severity="major",
                timestamp=0,
                evidence="No mention of 15-day free-look period",
                suggested_correction="Always inform customer about the 15-day free-look cancellation period."
            ))
        
        return violations
    
    async def _generate_insights(
        self, 
        transcript: List[Dict[str, Any]],
        violations: List[CallViolation]
    ) -> BusinessInsight:
        """
        Extract business insights from call.
        
        TODO: Use LLM for better intent classification.
        """
        full_text = " ".join([t["text"] for t in transcript]).lower()
        
        # Simple keyword-based classification
        call_reason = "inquiry"
        if "complaint" in full_text or "problem" in full_text:
            call_reason = "complaint"
        elif "claim" in full_text:
            call_reason = "claim"
        elif "renew" in full_text:
            call_reason = "renewal"
        
        resolution = "pending"
        if "thank you" in full_text or "resolved" in full_text:
            resolution = "resolved"
        elif "supervisor" in full_text or "escalate" in full_text:
            resolution = "escalated"
        
        return BusinessInsight(
            call_reason=call_reason,
            resolution=resolution,
            cross_sell_attempts=[],
            recommended_followup="Review call if violations detected" if violations else None
        )
    
    def _calculate_duration(self, transcript: List[Dict[str, Any]]) -> float:
        """Calculate call duration from transcript timestamps."""
        if not transcript:
            return 0
        
        timestamps = [t.get("timestamp", 0) for t in transcript]
        return max(timestamps) - min(timestamps) if timestamps else 0

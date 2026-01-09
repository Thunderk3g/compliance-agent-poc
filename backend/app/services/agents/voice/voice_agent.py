"""
Voice Audit Agent - Call Transcription and Compliance Analysis

Specialist Focus: Call transcription, emotional analysis, violation detection
Processes audio transcripts from customer calls to ensure legal and emotional alignment.
"""

import logging
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from datetime import datetime

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
        logger.info("VoiceAuditAgent initialized")
    
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

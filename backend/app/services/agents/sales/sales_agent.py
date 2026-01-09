"""
Sales & Underwriting Agent - Bilingual Chat with Risk Assessment

Specialist Focus: Bilingual (English/Hindi) chat, RAG-powered responses, risk prediction
Customer-facing assistant that helps with product inquiries while assessing underwriting risk.
"""

import logging
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from datetime import datetime
from enum import Enum

logger = logging.getLogger(__name__)


class Language(Enum):
    """Supported languages."""
    ENGLISH = "en"
    HINDI = "hi"


class RiskCategory(Enum):
    """Underwriting risk categories."""
    STANDARD = "standard"
    SUBSTANDARD = "substandard"
    REFER = "refer"
    DECLINE = "decline"


class CustomerProfile(BaseModel):
    """Extracted customer profile from conversation."""
    age: Optional[int] = None
    gender: Optional[str] = None
    annual_income: Optional[int] = None
    occupation: Optional[str] = None
    smoker: Optional[bool] = None
    pre_existing_conditions: List[str] = []
    coverage_need: Optional[int] = None


class RiskAssessment(BaseModel):
    """Underwriting risk assessment."""
    score: float  # 0 to 1, higher = more risk
    category: RiskCategory
    factors: List[str]
    suggested_premium_loading: float  # Percentage loading
    recommended_actions: List[str] = []


class ProductRecommendation(BaseModel):
    """Insurance product recommendation."""
    product_name: str
    premium_estimate: str
    coverage: str
    suitability_score: float


class ChatMessage(BaseModel):
    """Chat message structure."""
    role: str  # user, assistant
    content: str
    timestamp: datetime
    language: Language


class SalesAgentResponse(BaseModel):
    """Complete sales agent response."""
    session_id: str
    language: Language
    messages: List[ChatMessage]
    extracted_profile: Optional[CustomerProfile] = None
    risk_assessment: Optional[RiskAssessment] = None
    product_recommendations: List[ProductRecommendation] = []
    compliance_flags: List[str] = []


class SalesAgent:
    """
    Bilingual Insurance Sales and Underwriting Assistant
    
    Two parallel tasks:
    1. Answer product queries in English/Hindi using RAG
    2. Extract customer profile for real-time risk assessment
    
    Safety: Never promise guaranteed returns or unsupported claims.
    """
    
    # Prohibited claims that must be filtered
    PROHIBITED_CLAIMS = [
        "guaranteed returns",
        "no risk",
        "100% assured",
        "tax-free forever",
        "double your money"
    ]
    
    # Hindi greeting patterns
    HINDI_PATTERNS = [
        "namaste", "namaskar", "kaise", "kya", "mujhe", "chahiye",
        "batao", "bataiye", "kitna", "kitni", "kab", "kyun"
    ]
    
    # Occupation risk multipliers
    OCCUPATION_RISK = {
        "office": 1.0,
        "it": 1.0,
        "teacher": 1.0,
        "driver": 1.3,
        "construction": 1.5,
        "mining": 2.0,
        "pilot": 1.4,
        "military": 1.6
    }
    
    def __init__(self):
        self.conversation_history: Dict[str, List[ChatMessage]] = {}
        self.extracted_profiles: Dict[str, CustomerProfile] = {}
        logger.info("SalesAgent initialized")
    
    async def respond(
        self, 
        input_data: Dict[str, Any],
        **kwargs
    ) -> Dict[str, Any]:
        """
        Main entry point for sales chat.
        
        Args:
            input_data: Contains customer_message and optional session_id
            
        Returns:
            SalesAgentResponse as dictionary
        """
        message = input_data.get("customer_message", input_data.get("chat_message", ""))
        session_id = input_data.get("session_id", f"session_{datetime.now().timestamp()}")
        
        try:
            # Step 1: Detect language
            language = self._detect_language(message)
            
            # Step 2: Store user message
            user_message = ChatMessage(
                role="user",
                content=message,
                timestamp=datetime.now(),
                language=language
            )
            self._add_to_history(session_id, user_message)
            
            # Step 3: Retrieve relevant product context (RAG)
            context = await self._retrieve_context(message)
            
            # Step 4: Generate response
            response_text = await self._generate_response(message, context, language)
            
            # Step 5: Apply safety guardrails
            filtered_response = await self._apply_guardrails(response_text)
            
            # Step 6: Extract/update customer profile
            profile = await self._extract_profile(session_id)
            
            # Step 7: Calculate risk if enough profile data
            risk = None
            if self._has_minimum_profile(profile):
                risk = await self._calculate_risk(profile)
            
            # Step 8: Get product recommendations
            recommendations = await self._get_recommendations(profile, message)
            
            # Step 9: Store assistant response
            assistant_message = ChatMessage(
                role="assistant",
                content=filtered_response,
                timestamp=datetime.now(),
                language=language
            )
            self._add_to_history(session_id, assistant_message)
            
            result = SalesAgentResponse(
                session_id=session_id,
                language=language,
                messages=self.conversation_history.get(session_id, [])[-10:],  # Last 10
                extracted_profile=profile,
                risk_assessment=risk,
                product_recommendations=recommendations,
                compliance_flags=[]
            )
            
            return result.model_dump(mode="json")
            
        except Exception as e:
            logger.error(f"Sales agent failed: {e}")
            return {
                "session_id": session_id,
                "error": str(e),
                "status": "failed"
            }
    
    def _detect_language(self, text: str) -> Language:
        """
        Detect if text is Hindi or English.
        
        Uses simple keyword matching. TODO: Use proper language detection.
        """
        text_lower = text.lower()
        
        # Check for Hindi patterns
        hindi_count = sum(1 for pattern in self.HINDI_PATTERNS if pattern in text_lower)
        
        # Check for Devanagari script
        has_devanagari = any('\u0900' <= char <= '\u097F' for char in text)
        
        if hindi_count >= 2 or has_devanagari:
            return Language.HINDI
        
        return Language.ENGLISH
    
    def _add_to_history(self, session_id: str, message: ChatMessage):
        """Add message to conversation history."""
        if session_id not in self.conversation_history:
            self.conversation_history[session_id] = []
        self.conversation_history[session_id].append(message)
    
    async def _retrieve_context(self, query: str) -> List[Dict[str, Any]]:
        """
        Retrieve relevant product documents using RAG.
        
        TODO: Integrate Pinecone or pgvector for actual vector search.
        """
        # Placeholder product context
        return [
            {
                "product": "Term Life Insurance",
                "coverage": "Up to ₹1 Crore",
                "key_features": ["Pure life cover", "Low premium", "Tax benefits under 80C"],
                "disclaimer": "Returns subject to policy terms and conditions."
            },
            {
                "product": "Health Insurance",
                "coverage": "Up to ₹10 Lakh",
                "key_features": ["Cashless hospitalization", "Pre/post hospitalization", "No claim bonus"],
                "disclaimer": "Subject to waiting periods and exclusions."
            }
        ]
    
    async def _generate_response(
        self, 
        query: str, 
        context: List[Dict[str, Any]],
        language: Language
    ) -> str:
        """
        Generate response using retrieved context.
        
        TODO: Use LLM for proper response generation.
        """
        query_lower = query.lower()
        
        # Simple keyword-based response for demo
        if language == Language.HINDI:
            if "term" in query_lower or "insurance" in query_lower:
                return (
                    "Namaste! Term Insurance ek pure life cover hai jo aapke parivaar ko "
                    "financial suraksha deta hai. ₹1 Crore tak ka cover mil sakta hai. "
                    "Kya aap apni umar aur income bata sakte hain? "
                    "Isse hum aapke liye sahi plan suggest kar sakte hain."
                )
            return "Namaste! Main aapki kaise madad kar sakta hoon?"
        else:
            if "term" in query_lower or "insurance" in query_lower:
                return (
                    "Hello! Term Insurance provides pure life cover to protect your family financially. "
                    "Coverage is available up to ₹1 Crore. "
                    "Could you share your age and income so I can suggest the right plan for you? "
                    "Note: All benefits are subject to policy terms and conditions."
                )
            return "Hello! How can I help you today with insurance products?"
    
    async def _apply_guardrails(self, response: str) -> str:
        """
        Filter out prohibited claims from response.
        """
        response_lower = response.lower()
        
        for claim in self.PROHIBITED_CLAIMS:
            if claim in response_lower:
                logger.warning(f"Filtered prohibited claim: {claim}")
                # Replace with compliant alternative
                response = response.replace(
                    claim, 
                    "returns subject to market conditions"
                )
        
        return response
    
    async def _extract_profile(self, session_id: str) -> CustomerProfile:
        """
        Extract customer profile from conversation history.
        
        TODO: Use LLM for better extraction.
        """
        if session_id not in self.extracted_profiles:
            self.extracted_profiles[session_id] = CustomerProfile()
        
        profile = self.extracted_profiles[session_id]
        history = self.conversation_history.get(session_id, [])
        
        # Simple extraction from text
        full_text = " ".join([m.content for m in history]).lower()
        
        # Extract age
        import re
        age_match = re.search(r'(\d{2})\s*(?:years?|yrs?|sal)', full_text)
        if age_match and not profile.age:
            profile.age = int(age_match.group(1))
        
        # Extract smoker status
        if "non-smoker" in full_text or "don't smoke" in full_text:
            profile.smoker = False
        elif "smoker" in full_text or "smoke" in full_text:
            profile.smoker = True
        
        # Extract income (lakhs)
        income_match = re.search(r'(\d+)\s*(?:lakh|lac)', full_text)
        if income_match and not profile.annual_income:
            profile.annual_income = int(income_match.group(1)) * 100000
        
        self.extracted_profiles[session_id] = profile
        return profile
    
    def _has_minimum_profile(self, profile: CustomerProfile) -> bool:
        """Check if we have enough data for risk assessment."""
        return profile.age is not None
    
    async def _calculate_risk(self, profile: CustomerProfile) -> RiskAssessment:
        """
        Calculate underwriting risk score.
        """
        factors = []
        
        # Base risk by age (sigmoid curve)
        age = profile.age or 30
        if age < 25:
            age_risk = 0.2
            factors.append("young age (low risk)")
        elif age < 45:
            age_risk = 0.3
            factors.append("prime age")
        elif age < 60:
            age_risk = 0.5
            factors.append("middle age (moderate risk)")
        else:
            age_risk = 0.8
            factors.append("senior age (higher risk)")
        
        # Smoker factor
        smoker_multiplier = 1.0
        if profile.smoker is True:
            smoker_multiplier = 1.5
            factors.append("smoker (50% loading)")
        elif profile.smoker is False:
            factors.append("non-smoker")
        
        # Occupation factor
        occupation = (profile.occupation or "office").lower()
        occ_multiplier = 1.0
        for occ_key, mult in self.OCCUPATION_RISK.items():
            if occ_key in occupation:
                occ_multiplier = mult
                if mult > 1.0:
                    factors.append(f"{occupation} (elevated risk)")
                break
        
        # Pre-existing conditions
        health_multiplier = 1.0
        if profile.pre_existing_conditions:
            health_multiplier = 1.0 + (0.1 * len(profile.pre_existing_conditions))
            factors.append(f"{len(profile.pre_existing_conditions)} pre-existing condition(s)")
        
        # Combined score
        risk_score = age_risk * smoker_multiplier * occ_multiplier * health_multiplier
        risk_score = min(risk_score, 1.0)  # Cap at 1.0
        
        # Categorize
        if risk_score < 0.4:
            category = RiskCategory.STANDARD
        elif risk_score < 0.7:
            category = RiskCategory.SUBSTANDARD
        elif risk_score < 0.9:
            category = RiskCategory.REFER
        else:
            category = RiskCategory.DECLINE
        
        # Premium loading
        loading = max(0, (risk_score - 0.3) * 100)
        
        return RiskAssessment(
            score=risk_score,
            category=category,
            factors=factors,
            suggested_premium_loading=loading,
            recommended_actions=self._get_risk_actions(category)
        )
    
    def _get_risk_actions(self, category: RiskCategory) -> List[str]:
        """Get recommended actions based on risk category."""
        if category == RiskCategory.STANDARD:
            return ["Proceed with standard rates"]
        elif category == RiskCategory.SUBSTANDARD:
            return ["Apply premium loading", "Consider modified coverage"]
        elif category == RiskCategory.REFER:
            return ["Refer to underwriting team", "Request medical examination"]
        else:
            return ["Refer to senior underwriter", "Consider alternative products"]
    
    async def _get_recommendations(
        self, 
        profile: CustomerProfile, 
        query: str
    ) -> List[ProductRecommendation]:
        """
        Get product recommendations based on profile.
        """
        recommendations = []
        
        # Calculate coverage need (10x income or stated)
        coverage = profile.coverage_need or (profile.annual_income or 500000) * 10
        
        # Term insurance for all
        premium = int(coverage * 0.001 * (1 + (profile.age or 30) * 0.01))
        recommendations.append(ProductRecommendation(
            product_name="Term Life Insurance",
            premium_estimate=f"₹{premium:,}/year",
            coverage=f"₹{coverage:,}",
            suitability_score=0.9
        ))
        
        # Health insurance if age > 30
        if (profile.age or 0) >= 30:
            recommendations.append(ProductRecommendation(
                product_name="Health Insurance",
                premium_estimate="₹8,000/year",
                coverage="₹10 Lakh",
                suitability_score=0.8
            ))
        
        return recommendations

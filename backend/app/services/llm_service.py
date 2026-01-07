import json
import asyncio
import time
import os
from typing import Dict, Any, Optional, List, Type, TypeVar
from sqlalchemy.orm import Session
from ..models.tool_invocation import ToolInvocation
import logging
from datetime import datetime
from pydantic import BaseModel, ValidationError
from ..config import settings
from openai import AsyncOpenAI, APIConnectionError, APIStatusError
from langsmith import traceable

T = TypeVar("T", bound=BaseModel)

logger = logging.getLogger(__name__)


class LLMService:
    """Service for integrating with Cloud LLMs (Gemini/OpenAI) via OpenAI API."""

    def __init__(self):
        self.api_key = settings.llm_api_key
        self.base_url = settings.llm_base_url
        self.model = settings.llm_model
        
        # Logging config
        self.log_file = os.path.join("logs", "log.json")
        os.makedirs("logs", exist_ok=True)
        
        # Initialize OpenAI client
        # Note: If api_key is empty, this might raise error on instantiation or first call depending on lib version.
        # We'll assume it's provided or handled gracefully.
        if not self.api_key:
             logger.warning("LLM_API_KEY is not set. LLM service will fail.")
        
        self.client = AsyncOpenAI(
            api_key=self.api_key,
            base_url=self.base_url
        )

    async def health_check(self) -> bool:
        """Check if LLM service is available."""
        try:
            # Simple call to list models or just a basic chat completion
            # listing models might not be supported by all proxies, so we try a cheap generation
            await self.client.models.list()
            logger.info(f"✅ LLM service available with model '{self.model}'")
            return True

        except Exception as e:
            logger.warning(f"LLM health check failed: {str(e)}")
            return False

    @traceable(run_type="llm", name="generate_response")
    async def generate_response(
        self,
        prompt: str,
        system_prompt: str = None,
        context: Dict[str, Any] = None
    ) -> str:
        """Generate response from LLM."""
        messages = self._build_chat_messages(prompt, system_prompt, context)
        
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.7
            )
            response_text = response.choices[0].message.content.strip()
            
            # Log interaction
            await self._log_to_json(prompt, response_text, system_prompt, context)
            
            return response_text

        except Exception as e:
            logger.error(f"LLM generation failed: {str(e)}")
            return self._get_fallback_response(prompt, context)

    @traceable(run_type="llm", name="generate_structured_response")
    async def generate_structured_response(
        self,
        prompt: str,
        output_model: Type[T],
        system_prompt: str = None,
        context: Dict[str, Any] = None,
        execution_id: str = None,
        db: Session = None,
        tool_name: str = "llm_structured"
    ) -> T:
        """
        Generate a structured response validated against a Pydantic model.
        """
        # Append schema instructions to system prompt
        schema_instruction = (
            f"\nYou must output JSON that adheres to this schema:\n"
            f"{output_model.model_json_schema()}\n"
            f"Return ONLY the JSON object, no other text."
        )
        full_system_prompt = (system_prompt or "") + schema_instruction
        
        # We generally use response_format={"type": "json_object"} if supported,
        # but generic OpenAI compatible endpoints might variable support.
        # We will try robust prompting first (which we already added above).
        
        messages = self._build_chat_messages(prompt, full_system_prompt, context)
        start_time = time.time()
        
        # Simple retry logic (simplified from Ollama service)
        max_retries = 3
        current_messages = messages
        
        for attempt in range(max_retries):
            try:
                # Use with_raw_response to access the full unmapped payload (crucial for Gemini's usageMetadata)
                response_wrapper = await self.client.chat.completions.with_raw_response.create(
                    model=self.model,
                    messages=current_messages,
                    temperature=0.2, # Lower temperature for structured output
                    response_format={"type": "json_object"} 
                )
                
                # Parse the standard ChatCompletion object
                response = response_wrapper.parse()
                
                # Extract token usage from the raw generic response
                token_usage = 0
                try:
                    # Get raw JSON dict
                    import json # Ensure json is available inside scope if needed, though it's imported at top
                    raw_data = json.loads(response_wrapper.http_response.text)
                    
                    if "usageMetadata" in raw_data:
                        token_usage = raw_data["usageMetadata"].get("totalTokenCount", 0)
                    elif hasattr(response, 'usage') and response.usage:
                        token_usage = response.usage.total_tokens
                    else:
                        # Fallback estimate
                        response_text_len = len(response.choices[0].message.content.strip())
                        token_usage = (len(prompt) + response_text_len) // 4
                except Exception as e:
                    logger.warning(f"Failed to extract token usage from raw response: {e}")
                    # Final fallback
                    token_usage = 0

                response_text = response.choices[0].message.content.strip()
                
                # Log interaction
                await self._log_to_json(prompt, response_text, system_prompt, context)
                
                
                # Parse and Clean JSON (in case response format didn't work perfectly or extra text)
                if "```json" in response_text:
                    start = response_text.find("```json") + 7
                    end = response_text.find("```", start)
                    response_text = response_text[start:end].strip()
                elif "```" in response_text:
                    start = response_text.find("```") + 3
                    end = response_text.find("```", start)
                    response_text = response_text[start:end].strip()
                
                # Validate
                result = output_model.model_validate_json(response_text)
                
                end_time = time.time()
                
                # Record metrics if execution_id is provided
                if execution_id and db:
                     await self._record_tool_invocation(
                        db=db,
                        execution_id=execution_id,
                        tool_name=tool_name,
                        input_data={"prompt": prompt[:500], "system": system_prompt[:200] if system_prompt else None},
                        output_data=result.model_dump(mode='json'),
                        start_time=start_time,
                        end_time=end_time,
                        tokens=token_usage
                     )
                
                return result

            except (ValidationError, json.JSONDecodeError, Exception) as e:
                logger.warning(f"Structured generation attempt {attempt + 1} failed: {e}")
                
                if attempt == max_retries - 1:
                    raise e
                    
                # Feed error back into context
                error_feedback = f"\n\nPrevious response was invalid JSON or did not match schema. Error: {str(e)}. \nPlease CORRECT the JSON output."
                # Append to messages as user message
                current_messages.append({"role": "assistant", "content": response_text if 'response_text' in locals() else ""})
                current_messages.append({"role": "user", "content": error_feedback})
                
                await asyncio.sleep(1)

    async def _log_to_json(self, prompt: str, response: str, system_prompt: str = None, context: Dict = None):
        """Log LLM interaction to log.json."""
        try:
            log_entry = {
                "timestamp": datetime.now().isoformat(),
                "model": self.model,
                "system_prompt": system_prompt,
                "context": context,
                "prompt": prompt,
                "response": response
            }
            
            # Read existing logs
            logs = []
            if os.path.exists(self.log_file):
                try:
                    with open(self.log_file, "r") as f:
                        logs = json.load(f)
                except:
                    pass
            
            # Append and write back
            logs.append(log_entry)
            # Keep only last 50 logs to avoid file size explosion
            logs = logs[-50:]
            
            with open(self.log_file, "w") as f:
                json.dump(logs, f, indent=2)
                
        except Exception as e:
            logger.error(f"Failed to log to json: {e}")

    def _build_chat_messages(
        self,
        user_prompt: str,
        system_prompt: str = None,
        context: Dict[str, Any] = None
    ) -> List[Dict[str, str]]:
        """Build messages array for Chat API."""
        messages = []

        # Add system message
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})

        # Add context as system message
        if context:
            context_str = json.dumps(context, indent=2)
            messages.append({
                "role": "system",
                "content": f"Context:\n{context_str}"
            })

        # Add user message
        messages.append({"role": "user", "content": user_prompt})

        return messages

    def _get_fallback_response(self, prompt: str, context: Dict[str, Any]) -> str:
        """Fallback response when LLM is unavailable."""
        return json.dumps({
            "violations": [],
            "overall_assessment": "AI analysis service temporarily unavailable. Please try again later.",
            "key_issues": ["AI service unavailable"]
        })
    
    async def generate_rules_from_context(
        self,
        search_results: List[Dict[str, Any]],
        industry: str,
        scope: str
    ) -> List[Dict[str, Any]]:
        """
        Generate structured compliance rules from search results.
        """
        # Map scope to category
        category_map = {
            "regulatory": "irdai",
            "brand": "brand",
            "seo": "seo",
            "qualitative": "brand"
        }
        category = category_map.get(scope, "irdai")
        
        # Build prompt for rule extraction
        prompt = self._build_rule_extraction_prompt(
            search_results=search_results,
            industry=industry,
            category=category
        )
        
        system_prompt = (
            "You are a compliance expert specializing in extracting structured rules "
            "from regulatory documents and best practices. Return ONLY valid JSON."
        )
        
        try:
            response = await self.generate_response(
                prompt=prompt,
                system_prompt=system_prompt
            )
            
            # Parse JSON response
            rules = self._parse_rule_extraction_response(response, category)
            
            # Add source URLs
            for i, rule in enumerate(rules):
                if i < len(search_results):
                    rule["source_url"] = search_results[i].get("url", "")
            
            logger.info(f"Generated {len(rules)} rules for {category} from {len(search_results)} sources")
            
            return rules
            
        except Exception as e:
            logger.error(f"Rule generation failed: {str(e)}")
            return []
    
    def _build_rule_extraction_prompt(
        self,
        search_results: List[Dict],
        industry: str,
        category: str
    ) -> str:
        """Build prompt for extracting rules from search results."""
        # Format search results
        sources = []
        for i, result in enumerate(search_results[:5], 1):  # Limit to top 5
            sources.append(
                f"Source {i}:\n"
                f"Title: {result.get('title', 'N/A')}\n"
                f"Content: {result.get('snippet', 'N/A')}\n"
            )
        
        sources_text = "\n\n".join(sources)
        
        return f"""Extract actionable compliance rules from the following sources for the {industry} industry.

{sources_text}

**Your task:**
Extract 3-5 specific, actionable compliance rules from these sources.

**Output Format (JSON only, no markdown):**
[
  {{
    "rule_text": "Clear, specific compliance requirement",
    "severity": "critical|high|medium|low",
    "keywords": ["keyword1", "keyword2"],
    "points_deduction": -20.0 (for critical) | -10.0 (high) | -5.0 (medium) | -2.0 (low),
    "confidence_score": 0.0-1.0
  }}
]

**Guidelines:**
- Focus on specific, testable requirements
- Extract exact language from sources where possible
- Assign severity based on regulatory importance
- Include relevant keywords for rule matching
- Set high confidence (0.8+) for explicit regulations
- Limit to 5 most important rules

Return ONLY the JSON array, no other text.
"""
    
    def _parse_rule_extraction_response(
        self,
        response: str,
        category: str
    ) -> List[Dict[str, Any]]:
        """Parse LLM response into structured rules."""
        try:
            # Clean response (remove markdown if present)
            if "```json" in response:
                start = response.find("```json") + 7
                end = response.find("```", start)
                response = response[start:end].strip()
            elif "```" in response:
                start = response.find("```") + 3
                end = response.find("```", start)
                response = response[start:end].strip()
            
            # Simple fix for potential trailing commas or formatting issues could go here
            rules_data = json.loads(response)
            
            # Ensure it's a list
            if isinstance(rules_data, dict):
                rules_data = [rules_data]
            
            # Validate and add category
            validated_rules = []
            for rule in rules_data:
                if "rule_text" in rule:
                    validated_rules.append({
                        "category": category,
                        "rule_text": rule["rule_text"],
                        "severity": rule.get("severity", "medium"),
                        "keywords": rule.get("keywords", []),
                        "points_deduction": rule.get("points_deduction", -5.0),
                        "confidence_score": rule.get("confidence_score", 0.7)
                    })
            
            return validated_rules
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse rule extraction response: {str(e)}")
            logger.debug(f"Response was: {response[:500]}")
            return []

    async def analyze_line_for_violations(
        self,
        line_content: str,
        line_number: int,
        document_context: str,
        rules: List[Dict]
    ) -> Dict[str, Any]:
        """
        Analyze a single line for compliance violations.
        """
        from .prompts.deep_analysis_prompt import (
            build_deep_analysis_prompt,
            parse_line_analysis_response
        )
        
        # Build prompts
        prompts = build_deep_analysis_prompt(
            line_content=line_content,
            line_number=line_number,
            document_title=document_context,
            rules=rules
        )
        
        try:
            # Call LLM
            response_text = await self.generate_response(
                prompt=prompts["user_prompt"],
                system_prompt=prompts["system_prompt"]
            )
            
            # Parse response
            result = parse_line_analysis_response(response_text)
            
            logger.debug(f"Line {line_number} analysis: {len(result.get('violations', []))} violations found")
            
            return result
            
        except Exception as e:
            logger.error(f"Error analyzing line {line_number}: {str(e)}")
            return {
                "relevance_context": "Error during analysis",
                "violations": []
            }

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.client:
           await self.client.close()


    async def _record_tool_invocation(
        self,
        db: Session,
        execution_id: str,
        tool_name: str,
        input_data: Dict,
        output_data: Dict,
        start_time: float,
        end_time: float,
        tokens: int
    ):
        """Record tool invocation metrics to DB."""
        try:
            duration_ms = int((end_time - start_time) * 1000)
            cost = (tokens / 1000) * 0.0001 # Dummy cost model
            
            invocation = ToolInvocation(
                execution_id=execution_id,
                tool_name=tool_name,
                input_data=input_data,
                output_data=output_data,
                tokens_used=tokens,
                execution_time_ms=duration_ms,
                cost_usd=cost
            )
            db.add(invocation)
            db.commit()
            
        except Exception as e:
            logger.error(f"Failed to record tool invocation: {e}")

# Singleton instance
llm_service = LLMService()

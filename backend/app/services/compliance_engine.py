from typing import Dict, List, Any, Optional
import json
import logging
import traceback
import uuid
from sqlalchemy.orm import Session
from datetime import datetime

from ..models.rule import Rule
from ..models.submission import Submission
from ..models.compliance_check import ComplianceCheck
from ..models.violation import Violation
from ..models.compliance_state import ComplianceState
from ..schemas.compliance_schemas import ComplianceAnalysisResult
from ..models.agent_execution import AgentExecution

from .llm_service import llm_service
from .scoring_service import scoring_service
from .content_retrieval_service import ContentRetrievalService
from .preprocessing_service import ContextEngineeringService
from .agents.agent_factory import AgentFactory

logger = logging.getLogger(__name__)

class ComplianceEngine:
    """
    Refactored Compliance Engine following 12-Factor Agent principles.
    Acts as a Stateless Reducer: State_n+1 = f(State_n, Input)
    """

    # Template moved to ContextEngineeringService
    # COMPLIANCE_PROMPT_TEMPLATE = ...

    @staticmethod
    async def analyze_submission(submission_id: str, db: Session) -> Optional[ComplianceCheck]:
        """
        Entry point for compliance analysis (Refactored to use LangGraph with HITL).
        Orchestrates the flow via 'compliance_graph'.
        """
        submission = None
        try:
            # 1. Initialize State & Data
            submission = db.query(Submission).filter(Submission.id == submission_id).first()
            if not submission:
                raise ValueError(f"Submission {submission_id} not found")

            # Update status
            submission.status = "analyzing"
            db.commit()

            # Load Rules & Content
            rules_orm = ComplianceEngine._load_active_rules(db, submission.project_id)
            
            # Serialize rules for State (LangGraph persistence needs serializable objects)
            rules_serializable = {}
            for cat, r_list in rules_orm.items():
                rules_serializable[cat] = [
                    {
                        "id": str(r.id),
                        "rule_text": r.rule_text,
                        "category": r.category,
                        "severity": r.severity,
                        "conditions": r.pattern # Mapping pattern to conditions, or keep empty if unused
                    } for r in r_list
                ]

            content_service = ContentRetrievalService(db)
            chunks = content_service.get_analyzable_content(submission_id)
            
            # Prepare Input for LangGraph
            chunks_data = [
                {
                    "id": str(c.id), 
                    "text": c.text, 
                    "chunk_index": c.chunk_index,
                    "metadata": c.metadata
                } 
                for c in chunks
            ]
            
            initial_state = {
                "submission_id": str(submission_id),
                "project_id": str(submission.project_id) if submission.project_id else None,
                "chunks": chunks_data,
                "active_rules": rules_serializable,
                "violations": [],
                "scores": {},
                "status": "running",
                "messages": [],
                "metadata": {} 
            }
            
            logger.info(f"Starting LangGraph analysis for {submission_id} with {len(chunks)} chunks")

            # 2. Invoke LangGraph
            # Import here to avoid top-level circular dependency if any
            from .agents.orchestration import compliance_graph, GraphContext
            
            # Set Context
            token = GraphContext.set_db_session(db)
            
            # Config for persistence
            config = {"configurable": {"thread_id": str(submission_id)}}
            
            try:
                # Use stream or ainvoke. If we use interrupt_before, ainvoke might return just until the interrupt.
                # But ainvoke returns the final state *reached*. 
                # If interrupted, it stops.
                
                final_state_dict = await compliance_graph.ainvoke(initial_state, config=config)
                
                # Check snapshot to see if we are done or interrupted
                snapshot = compliance_graph.get_state(config)
                
                if snapshot.next:
                    # If there are next steps, we are paused/interrupted
                    logger.info(f"LangGraph execution PAUSED at {snapshot.next} for {submission_id}")
                    submission.status = "waiting_for_review"
                    db.commit()
                    return None # Return None or partial result? For now None as check isn't complete.
                else:
                     logger.info("LangGraph execution COMPLETED.")
            
            finally:
                GraphContext.reset_db_session(token)
            

            # 3. Persist Results (If completed)
            legacy_state = ComplianceState.construct(
                submission_id=final_state_dict["submission_id"],
                project_id=final_state_dict.get("project_id"), # Use .get()
                current_step="completed",
                status="completed",
                violations=final_state_dict["violations"],
                scores=final_state_dict["scores"],
                total_chunks=len(chunks),
                chunks=chunks,
                metadata={
                    "assessments": [m.content for m in final_state_dict.get("messages", []) if hasattr(m, 'content')],
                    "graph_snapshot": "final"
                }
            )
            
            # Persist
            compliance_check = ComplianceEngine.persist_results(legacy_state, db)
            
            return compliance_check

        except Exception as e:
            traceback.print_exc()
            logger.error(f"Error analyzing submission: {str(e)}")
            db.rollback()
            # Re-fetch submission in case rollback detached it
            if submission_id:
                sub = db.query(Submission).filter(Submission.id == submission_id).first()
                if sub:
                    sub.status = "failed"
                    db.add(sub)
                    db.commit()
            raise

    @staticmethod
    async def resume_submission(submission_id: str, formatted_feedback: str, db: Session) -> Optional[ComplianceCheck]:
        """
        Resumes a paused compliance check (HITL).
        """
        try:
             # 1. Setup
            submission = db.query(Submission).filter(Submission.id == submission_id).first()
            if not submission:
                raise ValueError("Submission not found")
                
            from .agents.orchestration import compliance_graph, GraphContext
            
            # Set Context
            token = GraphContext.set_db_session(db)
            config = {"configurable": {"thread_id": str(submission_id)}}
            
            try:
                # Update state with feedback
                # "human_review" node will read "user_feedback"
                update_dict = {"user_feedback": formatted_feedback}
                compliance_graph.update_state(config, update_dict)
                
                # Resume (call invoke with None input to proceed from current state)
                final_state_dict = await compliance_graph.ainvoke(None, config=config)
                
                 # Check snapshot
                snapshot = compliance_graph.get_state(config)
                if snapshot.next:
                     logger.info(f"LangGraph execution PAUSED again at {snapshot.next}")
                     return None
                
            finally:
                 GraphContext.reset_db_session(token)
                 
            # 2. Persist Results (Copied from analyze_submission - refactor candidate)
            # Fetch chunks again for constructing legacy state if needed, or reconstruct minimal
            # For persist_results, we use chunks mainly for metadata or just len.
            # Let's get chunks count from existing data if possible, or query.
            # State violations are full content so chunks not strictly needed for legacy object creation 
            # except for the loops in persists (which iterates state.violations).
            
            legacy_state = ComplianceState.construct(
                submission_id=final_state_dict["submission_id"],
                project_id=final_state_dict.get("project_id"),
                current_step="completed",
                status="completed",
                violations=final_state_dict["violations"],
                scores=final_state_dict["scores"],
                total_chunks=0, # Placeholder, not critical for persist_results
                chunks=[], 
                metadata={
                    "assessments": [m.content for m in final_state_dict.get("messages", []) if hasattr(m, 'content')],
                    "graph_snapshot": "final"
                }
            )
            
            compliance_check = ComplianceEngine.persist_results(legacy_state, db)
            return compliance_check
            
        except Exception as e:
            logger.error(f"Error resuming submission: {str(e)}")
            # Handle status updates if needed
            raise

    @staticmethod
    async def get_interim_results(submission_id: str, db: Session) -> Optional[Dict[str, Any]]:
        """
        Retrieves the current state of a paused submission (HITL), calculating projected scores.
        Returns a dict structure matching ComplianceCheckResponse.
        """
        try:
            from .agents.orchestration import compliance_graph
            
            config = {"configurable": {"thread_id": str(submission_id)}}
            snapshot = compliance_graph.get_state(config)
            
            if not snapshot.values:
                return None
                
            state = snapshot.values
            violations = state.get("violations", [])
            
            # Calculate scores dynamically for preview since Enterprise Architect hasn't run yet
            scores = scoring_service.calculate_scores(violations, db=db)
            
            # Construct response dict (mimicking ComplianceCheckResponse)
            # We don't have a check ID yet, so we generate a placeholder or use validation to skip
            
            # Needed for Pydantic validation of ViolationResponse nested objects
            # ViolationResponse expects fields like check_id, which we don't have.
            # We might need to handle this at the schema level or mock it.
            # Or the frontend doesn't care about ID if we just display it.
            
            # Map violations to match expected schema of ViolationResponse
            # Schema: id, rule_id, severity, category, description, location, current_text, suggested_fix
            
            formatted_violations = []
            for v in violations:
                formatted_violations.append({
                    "id": uuid.uuid4(), # Temporary ID
                    "check_id": uuid.uuid4(), # Temporary ID
                    "rule_id": uuid.uuid4() if not v.get("rule_id") else v.get("rule_id"), # Handle missing rule_id
                    "severity": v.get("severity", "medium"),
                    "category": v.get("category", "general"),
                    "description": v.get("description", "No description"),
                    "location": v.get("location", ""),
                    "current_text": v.get("current_text", ""),
                    "suggested_fix": v.get("suggested_fix", ""),
                    "is_auto_fixable": v.get("auto_fixable", False)
                })

            return {
                "id": uuid.uuid4(), # Temporary ID
                "submission_id": uuid.UUID(submission_id),
                "overall_score": scores.get("overall", 0),
                "irdai_score": scores.get("irdai", 0),
                "brand_score": scores.get("brand", 0),
                "seo_score": scores.get("seo", 0),
                "status": "waiting_for_review",
                "grade": scores.get("grade", "F"),
                "ai_summary": "Analysis paused for human review.",
                "check_date": datetime.now(),
                "has_deep_analysis": False,
                "violations": formatted_violations
            }
            
        except Exception as e:
            logger.error(f"Error fetching interim results: {str(e)}")
            return None

    @staticmethod
    def initialize_state(submission_id: str, project_id: Optional[str]) -> ComplianceState:
        """Create initial empty state."""
        return ComplianceState(
            submission_id=str(submission_id),
            project_id=str(project_id) if project_id else None,
            current_step="initialized",
            status="running"
        )

    @staticmethod
    async def process_chunk_step(
        state: ComplianceState, 
        chunk: Any, 
        rules: Dict[str, List[Rule]],
        context_service: ContextEngineeringService
    ) -> ComplianceState:
        """
        Stateless step: Takes current state + chunk + rules -> returns updated state with new violations.
        Uses Factor 10: Configurble Sub-Agents.
        """
        logger.info(f"Processing chunk {chunk.chunk_index}")
        
        # 1. Identify required agents based on available rules
        active_categories = [cat for cat, rules in rules.items() if rules]
        
        new_violations = []

        # 2. Iterate through categories and spawn agents (Factor 10)
        # 2. Iterate through categories and spawn agents (Factor 10)
        for category in active_categories:
            category_rules = rules[category]
            
            # Spawn Agent via Factory
            agent = AgentFactory.create_agent(category, context_service)
            
            logger.info(f"Invoking {category} agent for chunk {chunk.chunk_index}")
            
            # Create Execution Record
            execution = AgentExecution(
                agent_type=category,
                session_id=uuid.UUID(state.submission_id), # Assuming submission_id is session for now, or generate new
                project_id=uuid.UUID(state.project_id) if state.project_id else None,
                status="running",
                input_data={"chunk_index": chunk.chunk_index, "text_preview": chunk.text[:100]}
            )
            db = context_service.db # Access DB from context service or pass it in. Wait, process_chunk_step signature doesn't have db.
            # I need to check where db comes from. process_chunk_step signature:
            # async def process_chunk_step(state, chunk, rules, context_service)
            # context_service has self.db. I verified initialization in analyze_submission: context_service = ContextEngineeringService(db)
            
            context_service.db.add(execution)
            context_service.db.commit() # Commit to get ID
            
            try:
                # Agent Analysis
                analysis_result = await agent.analyze(
                    content=chunk.text, 
                    rules=category_rules,
                    execution_id=str(execution.id),
                    db=context_service.db
                )
                
                # Update Execution Success
                execution.status = "completed"
                execution.output_data = analysis_result.model_dump(mode='json')
                execution.completed_at = datetime.now()
                context_service.db.commit()

                # Accumulate Results
                for v in analysis_result.violations:
                    enriched_v = v.model_dump()
                    enriched_v["chunk_id"] = str(chunk.id)
                    enriched_v["chunk_index"] = chunk.chunk_index
                    
                    # Build location string
                    loc = f"chunk:{chunk.id}"
                    if chunk.metadata.get("page_number"):
                        loc += f":page:{chunk.metadata['page_number']}"
                    elif chunk.metadata.get("char_offset_start") is not None:
                        loc += f":offset:{chunk.metadata['char_offset_start']}"
                    enriched_v["location"] = loc
                    
                    new_violations.append(enriched_v)

                # Accumulate overall assessments
                if analysis_result.overall_assessment:
                    if "assessments" not in state.metadata:
                        state.metadata["assessments"] = []
                    state.metadata["assessments"].append(f"[{category.upper()}]: {analysis_result.overall_assessment}")
            
            except Exception as e:
                logger.error(f"Agent {category} execution failed: {e}")
                execution.status = "failed"
                execution.output_data = {"error": str(e)}
                execution.completed_at = datetime.now()
                context_service.db.commit()
                # Continue process? Yes, fail gracefully for one agent shouldn't kill whole process ideally
                # But for now we just log

        # Return NEW state with accumulated violations
        state.violations.extend(new_violations)
        state.processed_chunks += 1
            
        return state

    @staticmethod
    def scoring_step(state: ComplianceState, db: Session) -> ComplianceState:
        """
        Pure logic step: Calculate scores based on accumulated violations in state.
        """
        # We need to adapt the state violations to what scoring_service expects
        # scoring_service expects a list of dicts, which matches state.violations
        
        scores = scoring_service.calculate_scores(state.violations, db=db)
        state.scores = scores
        return state

    @staticmethod
    def persist_results(state: ComplianceState, db: Session) -> ComplianceCheck:
        """
        Final step: Side effect to save state to DB.
        """
        # Save ComplianceCheck
        compliance_check = ComplianceCheck(
            submission_id=state.submission_id,
            overall_score=state.scores.get("overall", 0),
            irdai_score=state.scores.get("irdai", 0),
            brand_score=state.scores.get("brand", 0),
            seo_score=state.scores.get("seo", 0),
            status=state.scores.get("status", "unknown"),
            grade=state.scores.get("grade", "F"),
            ai_summary=f"Analyzed {state.total_chunks} chunks. " + " ".join(state.metadata.get("assessments", [])[:2])
        )
        db.add(compliance_check)
        db.flush() # Get ID

        # Save Violations
        for v_data in state.violations:
            rule_id = v_data.get("rule_id")
            # Basic validation for rule_id being a UUID if present
            valid_rule_id = None
            if rule_id:
                try:
                    uuid.UUID(str(rule_id))
                    valid_rule_id = rule_id
                except:
                    pass

            violation = Violation(
                check_id=compliance_check.id,
                rule_id=valid_rule_id,
                severity=v_data.get("severity", "medium"),
                category=v_data.get("category", "general"),
                description=v_data.get("description", "No description"),
                location=v_data.get("location", ""),
                current_text=v_data.get("current_text", ""),
                suggested_fix=v_data.get("suggested_fix", ""),
                is_auto_fixable=v_data.get("auto_fixable", False)
            )
            db.add(violation)
            
        # Update Submission
        submission = db.query(Submission).filter(Submission.id == state.submission_id).first()
        if submission:
            submission.status = "analyzed"
        
        db.commit()
        return compliance_check

    @staticmethod
    def _load_active_rules(db: Session, project_id: Any = None) -> Dict[str, List[Rule]]:
        """Load top active rules per category, filtered by project."""
        query = db.query(Rule).filter(Rule.is_active == True)
        
        if project_id:
            query = query.filter(Rule.project_id == project_id)
        else:
            query = query.filter(Rule.project_id.is_(None))
            
        rules = query.all()

        # Sort by severity weight
        severity_order = {"critical": 4, "high": 3, "medium": 2, "low": 1}
        rules.sort(key=lambda r: severity_order.get(r.severity, 0), reverse=True)

        grouped = {"irdai": [], "brand": [], "seo": []}

        for rule in rules:
            if rule.category not in grouped:
                grouped[rule.category] = []
            
            grouped[rule.category].append(rule)

        return grouped

        return grouped

    @staticmethod
    def _parse_ollama_response(response: str) -> Dict[str, Any]:
        """Parse Ollama's JSON response."""
        try:
            if "```json" in response:
                start = response.find("```json") + 7
                end = response.find("```", start)
                response = response[start:end].strip()
            elif "```" in response:
                start = response.find("```") + 3
                end = response.find("```", start)
                response = response[start:end].strip()

            result = json.loads(response)
            
            if "violations" not in result:
                result["violations"] = []
                
            return result

        except Exception as e:
            logger.error(f"Failed to parse Ollama response: {e}")
            return {"violations": [], "overall_assessment": "Error parsing AI response"}

compliance_engine = ComplianceEngine()

import logging
import uuid
import datetime
import asyncio
from typing import Dict, Any, List
from langchain_core.messages import AIMessage

from .state import ComplianceState

# Services
from app.services.preprocessing_service import ContextEngineeringService
from app.services.agents.compliance.scoring import scoring_service
from app.services.agents.compliance.engine import ComplianceEngine as LegacyEngine # For helper methods if needed
from app.models.submission import Submission
from app.models.content_chunk import ContentChunk
from app.models.agent_execution import AgentExecution
from app.models.tool_invocation import ToolInvocation
from app.services.agents.agent_factory import AgentFactory
from app.database import SessionLocal 

# Context
from .context import GraphContext

logger = logging.getLogger(__name__)

async def preprocess_node(state: ComplianceState):
    """
    Librarian Node: Prepares document chunks.
    """
    logger.info("Node: Preprocess (Librarian) running...")
    
    db = GraphContext.get_db_session()
    submission_id = state["submission_id"]
    
    # 1. Run Preprocessing (Idempotent check inside service)
    service = ContextEngineeringService(db)
    try:
        # This commits internally
        chunk_count = await service.preprocess_submission(uuid.UUID(submission_id))
        logger.info(f"Preprocessing complete. Chunk count: {chunk_count}")
        
        # 2. Load Chunks into State
        # We need to query them back to have them in memory for the graph
        submission_chunks = db.query(ContentChunk).filter(ContentChunk.submission_id == submission_id).order_by(ContentChunk.chunk_index).all()
        
        chunks_data = [
            {
                "id": str(c.id), 
                "text": c.text, 
                "chunk_index": c.chunk_index,
                "metadata": c.chunk_metadata
            } 
            for c in submission_chunks
        ]
        
        return {
            "chunks": chunks_data, 
            "messages": [AIMessage(content=f"Librarian: Prepared {len(chunks_data)} chunks.")]
        }
        
    except Exception as e:
        logger.error(f"Preprocessing failed: {e}")
        return {
            "messages": [AIMessage(content=f"Librarian: Error during preprocessing - {str(e)}")],
            "status": "failed"
        }

async def dispatch_node(state: ComplianceState):
    """
    Brain Node: Identifies active rules and determines execution plan.
    """
    logger.info("Node: Dispatch (Brain) running...")
    
    db = GraphContext.get_db_session()
    project_id = state.get("project_id")
    
    # Load Rules
    # Using the helper from ComplianceEngine to ensure consistency
    rules_orm = LegacyEngine._load_active_rules(db, project_id)
    
    # Serialize for state
    rules_serializable = {}
    active_count = 0
    for cat, r_list in rules_orm.items():
        if r_list:
            rules_serializable[cat] = [
                {
                    "id": str(r.id),
                    "rule_text": r.rule_text,
                    "category": r.category,
                    "severity": r.severity
                } for r in r_list
            ]
            active_count += len(r_list)
            
    return {
        "active_rules": rules_serializable,
        "messages": [AIMessage(content=f"Brain: Dispatched. Active Rules: {active_count}")]
    }

async def analysis_node(state: ComplianceState):
    """
    Compliance Specialist: Runs sub-agents on chunks against rules.
    """
    logger.info("Node: Analysis running...")
    
    db = GraphContext.get_db_session() # Main session (not used for threading)
    
    chunks_data = state.get("chunks", [])
    rules = state.get("active_rules", {})
    submission_id = state.get("submission_id")
    project_id = state.get("project_id")
    user_id = state.get("user_id")
    
    active_categories = [cat for cat, r_list in rules.items() if r_list]
    new_violations = []

    # Helper for parallel execution
    async def process_task(category, chunk_data):
        chunk_text = chunk_data.get("text", "")
        chunk_index = chunk_data.get("chunk_index")
        chunk_id = chunk_data.get("id")
        
        task_violations = []
        task_db = SessionLocal() # Dedicated session
        
        try:
            # Init Service
            context_service = ContextEngineeringService(task_db)
            agent = AgentFactory.create_agent(category, context_service)
            
            # Record Execution
            execution = AgentExecution(
                agent_type=category,
                session_id=uuid.UUID(submission_id) if submission_id else None,
                project_id=uuid.UUID(project_id) if project_id else None,
                user_id=uuid.UUID(user_id) if user_id else None,
                status="running",
                input_data={"chunk_index": chunk_index, "text_preview": chunk_text[:100]}
            )
            task_db.add(execution)
            task_db.commit()
            
            try:
                start_time = datetime.datetime.now()
                # Run Analysis
                # We need to pass the rules as objects or dicts. Agent expects list of Rules or dicts.
                # state['active_rules'] is dicts. standard_agent.py expects objects usually but handles dicts?
                # Check standard_agent.py: it calls `self.context_service.create_compliance_prompts`.
                # ContextService.create_compliance_prompts handles both.
                
                analysis_result = await agent.analyze(
                    content=chunk_text,
                    rules=rules[category],
                    execution_id=str(execution.id),
                    db=task_db
                )
                end_time = datetime.datetime.now()
                
                # Update Success
                execution.status = "completed"
                execution.output_data = analysis_result.model_dump(mode='json')
                execution.completed_at = end_time
                execution.execution_time_ms = int((end_time - start_time).total_seconds() * 1000)
                
                # Tokens
                tool_invocations = task_db.query(ToolInvocation).filter(ToolInvocation.execution_id == execution.id).all()
                execution.total_tokens_used = sum(inv.tokens_used for inv in tool_invocations)
                
                task_db.commit()
                
                # Collect Violations
                for v in analysis_result.violations:
                    v_dict = v.model_dump()
                    v_dict["chunk_id"] = str(chunk_id)
                    v_dict["chunk_index"] = chunk_index
                    
                    loc = f"chunk:{chunk_id}"
                    meta = chunk_data.get("metadata", {})
                    if meta.get("page_number"):
                        loc += f":page:{meta['page_number']}"
                    v_dict["location"] = loc
                    
                    task_violations.append(v_dict)
                    
            except Exception as e:
                logger.error(f"Task failed ({category}, chunk {chunk_index}): {e}")
                execution.status = "failed"
                execution.output_data = {"error": str(e)}
                task_db.commit()
                
        except Exception as e:
            logger.error(f"DB Error in task: {e}")
        finally:
            task_db.close()
            
        return task_violations

    # Create Tasks
    tasks = []
    for chunk in chunks_data:
        for cat in active_categories:
            tasks.append(process_task(cat, chunk))
            
    if tasks:
        logger.info(f"Running {len(tasks)} analysis tasks...")
        results = await asyncio.gather(*tasks)
        for res in results:
            new_violations.extend(res)
            
    return {
        "violations": new_violations,
        "messages": [AIMessage(content=f"Analysis: Found {len(new_violations)} violations.")]
    }

async def scoring_node(state: ComplianceState):
    """
    Scoring Node: Calculates final grades.
    """
    logger.info("Node: Scoring running...")
    db = GraphContext.get_db_session()
    
    violations = state.get("violations", [])
    scores = scoring_service.calculate_scores(violations, db=db)
    
    return {
        "scores": scores,
        "messages": [AIMessage(content=f"Scoring: Grade {scores.get('grade')} ({scores.get('overall')}%)")]
    }

async def refinement_node(state: ComplianceState):
    """
    Refinement Node: HITL Review point.
    """
    logger.info("Node: Refinement (HITL) running...")
    
    feedback = state.get("user_feedback")
    if feedback:
        return {
            "messages": [AIMessage(content=f"Refinement: Processed feedback: {feedback}")]
        }
    
    return {"messages": [AIMessage(content="Refinement: No feedback, proceeding.")]}

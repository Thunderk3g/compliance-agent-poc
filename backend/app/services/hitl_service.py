import logging
import traceback
from uuid import UUID
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session

from .agents.orchestration import compliance_graph, GraphContext
from .agents.compliance.engine import ComplianceEngine
from ..models.submission import Submission
from ..models.compliance_state import ComplianceState

logger = logging.getLogger(__name__)

class HITLService:
    """
    Human-in-the-Loop Service.
    Handles resuming suspended compliance workflows.
    """
    
    @staticmethod
    async def resume_submission(
        submission_id: str, 
        feedback: str, 
        db: Session,
        action: str = "approve" # approve, reject, feedback
    ) -> Dict[str, Any]:
        """
        Resume a paused submission analysis with user feedback.
        """
        logger.info(f"Resuming submission {submission_id} with action '{action}'")
        
        submission = db.query(Submission).filter(Submission.id == submission_id).first()
        if not submission:
            raise ValueError(f"Submission {submission_id} not found")
            
        # 1. Setup Config & Context
        config = {"configurable": {"thread_id": str(submission_id)}}
        token = GraphContext.set_db_session(db)
        
        try:
            # 2. Update State with Feedback
            # We inject the feedback into the state so the human_review node (or next node) sees it.
            # Depending on how the graph is paused (interrupt_before 'human_review'), 
            # updating state here will be applied before 'human_review' runs.
            
            await compliance_graph.aupdate_state(
                config, 
                {"user_feedback": f"Action: {action}. Feedback: {feedback}"}
            )
            
            # 3. Resume Execution
            # invoke(None) continues from the interruption point.
            final_state_dict = await compliance_graph.ainvoke(None, config=config)
            
            logger.info("LangGraph execution completed (Resumed).")
            
            # 4. Persist Final Results
            # Reuse ComplianceEngine logic
            # We need to construct legacy state again. 
            # Ideally ComplianceEngine.persist_results could accept dict, but we stick to object for now.
             
            # Fetch chunks again or store them? Chunks are needed for ComplianceState object?
            # ComplianceState needs total_chunks etc.
            # Optimally, we pull this from the final_state_dict if we put it there.
            # Our AgentState has 'chunks'.
            
            chunks_data = final_state_dict.get("chunks", [])
            
            legacy_state = ComplianceState.construct(
                submission_id=final_state_dict["submission_id"],
                project_id=final_state_dict["project_id"],
                current_step="completed",
                status="completed",
                violations=final_state_dict["violations"],
                scores=final_state_dict["scores"],
                total_chunks=len(chunks_data),
                chunks=[], # We don't need full chunk objects for persist_results if not saving chunks again
                metadata={
                    "assessments": [m.content for m in final_state_dict.get("messages", []) if hasattr(m, 'content')],
                    "graph_snapshot": "final_resumed",
                    "user_feedback": feedback
                }
            )
            
            # Persist
            compliance_check = ComplianceEngine.persist_results(legacy_state, db)
            
            # Update submission status explicitly
            submission.status = "analyzed" # or completed
            db.commit()
            
            return {
                "status": "success", 
                "check_id": str(compliance_check.id),
                "scores": compliance_check.overall_score
            }

        except Exception as e:
            traceback.print_exc()
            logger.error(f"Error resuming submission: {str(e)}")
            db.rollback()
            raise
        finally:
            GraphContext.reset_db_session(token)

hitl_service = HITLService()

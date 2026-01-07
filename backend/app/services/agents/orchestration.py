import logging
import operator
from typing import TypedDict, Annotated, List, Dict, Any, Optional
from uuid import UUID

from langgraph.graph import StateGraph, END
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage

from ...models.rule import Rule
from ...schemas.compliance_schemas import ComplianceAnalysisResult
# from .starting_agent import starting_compliance_agent # Placeholder removed
from ...services.agents.agent_factory import AgentFactory
from ...services.llm_service import llm_service

logger = logging.getLogger(__name__)

# --- State Definition ---

class AgentState(TypedDict):
    """
    Represents the state of the compliance orchestration graph.
    """
    submission_id: str
    project_id: Optional[str]
    
    # Content to analyze
    chunks: List[Dict[str, Any]] 
    
    # Accumulated Results (Reducer pattern: Append-only)
    violations: Annotated[List[Dict[str, Any]], operator.add]
    scores: Dict[str, Any]
    
    # Metadata & Control
    active_rules: Dict[str, List[Rule]]
    status: str
    messages: Annotated[List[BaseMessage], operator.add]
    
    # For HITL
    user_feedback: Optional[str]

# --- Nodes ---

# --- Context Management ---
import contextvars

class GraphContext:
    _db_session: contextvars.ContextVar[Optional[Any]] = contextvars.ContextVar("db_session", default=None)

    @classmethod
    def set_db_session(cls, session: Any):
        return cls._db_session.set(session)

    @classmethod
    def get_db_session(cls) -> Optional[Any]:
        return cls._db_session.get()
        
    @classmethod
    def reset_db_session(cls, token):
        cls._db_session.reset(token)

# --- Nodes ---

async def node_compliance_analyst(state: AgentState):
    """
    Compliance Analyst: Prepares the analysis, identifies active regulations/rules.
    """
    logger.info("Node: Compliance Analyst running...")
    return {"messages": [AIMessage(content="Compliance Analyst: Rules ready.")]}

async def node_compliance_specialist(state: AgentState):
    """
    Compliance Specialist: The core engine that runs individual compliance checks.
    """
    logger.info("Node: Compliance Specialist running...")
    
    # helper to get db from context
    db = GraphContext.get_db_session()
    
    if not db:
        logger.error("DB Session not found in GraphContext!")
        return {"messages": [AIMessage(content="Error: DB Session missing.")]}
        
    chunks_data = state.get("chunks", [])
    rules = state.get("active_rules", {})
    submission_id = state.get("submission_id")
    
    # Initialize Context Service
    from ...services.preprocessing_service import ContextEngineeringService
    context_service = ContextEngineeringService(db)
    
    active_categories = [cat for cat, r_list in rules.items() if r_list]
    new_violations = []
    
    import datetime
    from ...models.agent_execution import AgentExecution
    from ...services.agents.agent_factory import AgentFactory
    
    for chunk_data in chunks_data:
        chunk_text = chunk_data.get("text", "")
        chunk_index = chunk_data.get("chunk_index", 0)
        chunk_id = chunk_data.get("id")
        
        # Iterate through categories and spawn agents
        for category in active_categories:
            category_rules = rules[category]
            
            # Spawn Agent
            agent = AgentFactory.create_agent(category, context_service)
            
            # Create Execution Record
            # UUID conversion if needed
            try:
                sub_uuid = UUID(submission_id)
                proj_uuid = UUID(state.get("project_id")) if state.get("project_id") else None
            except:
                sub_uuid = None
                proj_uuid = None

            execution = AgentExecution(
                agent_type=category,
                session_id=sub_uuid, 
                project_id=proj_uuid,
                status="running",
                input_data={"chunk_index": chunk_index, "text_preview": chunk_text[:100]}
            )
            db.add(execution)
            db.commit() 
            
            try:
                # Agent Analysis
                analysis_result = await agent.analyze(
                    content=chunk_text, 
                    rules=category_rules,
                    execution_id=str(execution.id),
                    db=db
                )
                
                # Update Execution Success
                execution.status = "completed"
                execution.output_data = analysis_result.model_dump(mode='json')
                execution.completed_at = datetime.datetime.now()
                db.commit()

                # Accumulate Results
                for v in analysis_result.violations:
                    enriched_v = v.model_dump()
                    enriched_v["chunk_id"] = str(chunk_id)
                    enriched_v["chunk_index"] = chunk_index
                    
                    # Build location string
                    loc = f"chunk:{chunk_id}"
                    enriched_v["location"] = loc
                    
                    new_violations.append(enriched_v)
            
            except Exception as e:
                logger.error(f"Agent {category} execution failed: {e}")
                execution.status = "failed"
                execution.output_data = {"error": str(e)}
                execution.completed_at = datetime.datetime.now()
                db.commit()

    logger.info(f"Compliance Specialist found {len(new_violations)} violations.")
    return {
        "violations": new_violations,
        "messages": [AIMessage(content=f"Compliance Specialist: Found {len(new_violations)} violations.")]
    }

async def node_enterprise_architect(state: AgentState):
    """
    Enterprise Architect: Validates technical controls and finalizes structural decisions.
    Acts as the 'Scoring' and 'Finalizing' step for Phase 1.
    """
    logger.info("Node: Enterprise Architect running...")
    
    db = GraphContext.get_db_session()
    violations = state.get("violations", [])
    
    from ...services.scoring_service import scoring_service
    
    # Calculate Scores
    scores = scoring_service.calculate_scores(violations, db=db)
    logger.info(f"Scoring complete: {scores.get('overall', 0)}")
    
    return {
        "scores": scores,
        "messages": [AIMessage(content=f"Enterprise Architect: Validation & Scoring complete. Grade: {scores.get('grade')}")]
    }

async def node_human_review(state: AgentState):
    """
    HITL Node: Waits for human input if critical violations/low confidence.
    """
    logger.info("Node: Human Review (Placeholder).")
    return {"status": "reviewed"}

# --- Graph Contruction ---

def build_compliance_graph():
    """
    Builds the LangGraph for Compliance Orchestration.
    """
    workflow = StateGraph(AgentState)
    
    # Add Nodes
    workflow.add_node("compliance_analyst", node_compliance_analyst)
    workflow.add_node("compliance_specialist", node_compliance_specialist)
    workflow.add_node("enterprise_architect", node_enterprise_architect)
    # workflow.add_node("human_review", node_human_review) # Phase 2
    
    # Add Edges
    workflow.set_entry_point("compliance_analyst")
    
    workflow.add_edge("compliance_analyst", "compliance_specialist")
    workflow.add_edge("compliance_specialist", "enterprise_architect")
    workflow.add_edge("enterprise_architect", END)
    
    # Compile
    app = workflow.compile()
    return app

# Singleton / Factory access
compliance_graph = build_compliance_graph()

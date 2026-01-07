import os
import logging
from langgraph.graph import StateGraph, END, START
from redis import Redis

from .graph.state import ComplianceState
from .graph.nodes import (
    preprocess_node,
    dispatch_node,
    analysis_node,
    scoring_node,
    refinement_node
)
from .graph.context import GraphContext

logger = logging.getLogger(__name__)

# Redis Configuration
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

def build_compliance_graph():
    """
    Constructs the Compliance Agent StateGraph.
    """
    workflow = StateGraph(ComplianceState)

    # 1. Add Nodes
    workflow.add_node("preprocess_node", preprocess_node)
    workflow.add_node("dispatch_node", dispatch_node)
    workflow.add_node("analysis_node", analysis_node)
    workflow.add_node("scoring_node", scoring_node)
    workflow.add_node("refinement_node", refinement_node)

    # 2. Define Edges
    workflow.add_edge(START, "preprocess_node")
    workflow.add_edge("preprocess_node", "dispatch_node")
    
    # Conditional logic could be added here, but for now we flow linearly to analysis
    # logic is inside the nodes to handle empty/skipping if needed
    workflow.add_edge("dispatch_node", "analysis_node")
    
    workflow.add_edge("analysis_node", "scoring_node")
    workflow.add_edge("scoring_node", "refinement_node")
    workflow.add_edge("refinement_node", END)

    # 3. Configure Persistence
    try:
        # Using synchronous Redis client for the Checkpointer
        # LangGraph RedisSaver works with a Redis connection object
        from langgraph.checkpoint.redis import RedisSaver
        
        # We need to ensure we use the right client based on the library version
        # Assuming langgraph-checkpoint-redis 2.0+
        conn = Redis.from_url(REDIS_URL)
        checkpointer = RedisSaver(redis_client=conn)
        logger.info(f"Using Redis persistence at {REDIS_URL}")
        
    except ImportError:
        logger.warning("langgraph-checkpoint-redis not installed. Falling back to MemorySaver.")
        from langgraph.checkpoint.memory import MemorySaver
        checkpointer = MemorySaver()
    except Exception as e:
        logger.warning(f"Failed to connect to Redis: {e}. Falling back to MemorySaver.")
        from langgraph.checkpoint.memory import MemorySaver
        checkpointer = MemorySaver()

    # 4. Compile Graph
    app = workflow.compile(
        checkpointer=checkpointer,
        interrupt_before=["refinement_node"]
    )
    
    return app

# Initialize Graph
compliance_graph = build_compliance_graph()

# Helper to visualize
def get_mermaid_png():
    try:
        return compliance_graph.get_graph().draw_mermaid_png()
    except Exception as e:
        logger.warning(f"Visualizer failed: {e}")
        return None

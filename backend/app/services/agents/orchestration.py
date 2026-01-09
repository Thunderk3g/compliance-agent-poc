import os
import logging
from langgraph.graph import StateGraph, END, START
from redis.asyncio import Redis as AsyncRedis

from .graph.state import ComplianceState
from .graph.nodes import (
    preprocess_node,
    dispatch_node,
    analysis_node,
    scoring_node,
    refinement_node
)
from .graph.voice_nodes import voice_analysis_node, voice_output_node
from .graph.analytics_nodes import analytics_reasoning_node, analytics_output_node
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
        # Using AsyncRedisSaver for ainvoke compatibility
        from langgraph.checkpoint.redis import AsyncRedisSaver
        
        conn = AsyncRedis.from_url(REDIS_URL, decode_responses=False)
        checkpointer = AsyncRedisSaver(redis_client=conn)
        logger.info(f"Using Async Redis persistence at {REDIS_URL}")
        
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

def build_voice_graph():
    """Constructs the Voice Audit Agent StateGraph."""
    workflow = StateGraph(ComplianceState)
    workflow.add_node("voice_analysis", voice_analysis_node)
    workflow.add_node("voice_output", voice_output_node)
    
    workflow.add_edge(START, "voice_analysis")
    workflow.add_edge("voice_analysis", "voice_output")
    workflow.add_edge("voice_output", END)
    
    return workflow.compile()

def build_analytics_graph():
    """Constructs the BI Analytics Agent StateGraph."""
    workflow = StateGraph(ComplianceState)
    workflow.add_node("analytics_reasoning", analytics_reasoning_node)
    workflow.add_node("analytics_output", analytics_output_node)
    
    workflow.add_edge(START, "analytics_reasoning")
    workflow.add_edge("analytics_reasoning", "analytics_output")
    workflow.add_edge("analytics_output", END)
    
    return workflow.compile()

# Initialize Graphs
compliance_graph = build_compliance_graph()
voice_graph = build_voice_graph()
analytics_graph = build_analytics_graph()

# Helper to visualize
def get_mermaid_png():
    try:
        return compliance_graph.get_graph().draw_mermaid_png()
    except Exception as e:
        logger.warning(f"Visualizer failed: {e}")
        return None

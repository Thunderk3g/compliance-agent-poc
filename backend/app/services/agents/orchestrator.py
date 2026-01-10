import logging
from typing import Dict, Any, Optional
from uuid import UUID

from langgraph.graph import StateGraph, END, START
from redis.asyncio import Redis as AsyncRedis
from langchain_core.runnables import RunnableConfig

from .graph.state import ComplianceState
from .graph.nodes import (
    preprocess_node,
    dispatch_node,
    analysis_node,
    scoring_node,
    refinement_node
)
from .graph.context import GraphContext
from ...config import settings

logger = logging.getLogger(__name__)

class ComplianceOrchestrator:
    """
    The Brain: Orchestrates the Multi-Agent System.
    Manages the lifecycle of the LangGraph state machine.
    """
    
    def __init__(self):
        self.redis_url = settings.redis_url
        self.checkpointer = None
        self.graph = self._build_graph()

    def _build_graph(self):
        """Constructs the compliance state graph."""
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
        workflow.add_edge("dispatch_node", "analysis_node")
        workflow.add_edge("analysis_node", "scoring_node")
        workflow.add_edge("scoring_node", "refinement_node")
        workflow.add_edge("refinement_node", END)

        # 3. Configure Persistence
        try:
            from langgraph.checkpoint.redis import AsyncRedisSaver
            conn = AsyncRedis.from_url(self.redis_url, decode_responses=False)
            self.checkpointer = AsyncRedisSaver(redis_client=conn)
            self._checkpointer_initialized = False
            logger.info(f"Using Async Redis persistence at {self.redis_url}")
        except ImportError:
            logger.warning("langgraph-checkpoint-redis not installed. Falling back to MemorySaver.")
            from langgraph.checkpoint.memory import MemorySaver
            self.checkpointer = MemorySaver()
            self._checkpointer_initialized = True
        except Exception as e:
            logger.warning(f"Failed to connect to Redis: {e}. Falling back to MemorySaver.")
            from langgraph.checkpoint.memory import MemorySaver
            self.checkpointer = MemorySaver()
            self._checkpointer_initialized = True

        # 4. Compile
        return workflow.compile(
            checkpointer=self.checkpointer,
            interrupt_before=["refinement_node"]
        )
    
    async def _ensure_checkpointer_setup(self):
        """Initialize Redis checkpointer indexes if not already done."""
        if self._checkpointer_initialized:
            return
        try:
            if hasattr(self.checkpointer, 'setup'):
                await self.checkpointer.setup()
                logger.info("Redis checkpointer indexes initialized")
            self._checkpointer_initialized = True
        except Exception as e:
            logger.warning(f"Failed to setup Redis checkpointer: {e}. Falling back to MemorySaver.")
            from langgraph.checkpoint.memory import MemorySaver
            self.checkpointer = MemorySaver()
            self._checkpointer_initialized = True
            # Rebuild graph with new checkpointer
            self.graph = self._build_graph()

    async def run_workflow(self, initial_state: ComplianceState, config: RunnableConfig):
        """Executes the workflow."""
        await self._ensure_checkpointer_setup()
        return await self.graph.ainvoke(initial_state, config=config)

    async def get_state(self, config: RunnableConfig):
        """Gets current graph state."""
        await self._ensure_checkpointer_setup()
        return await self.graph.aget_state(config)

    async def update_state(self, config: RunnableConfig, values: Dict[str, Any]):
        """Updates graph state."""
        await self._ensure_checkpointer_setup()
        return await self.graph.aupdate_state(config, values)

    def get_graph_image(self):
        """Returns mermaid png."""
        try:
            return self.graph.get_graph().draw_mermaid_png()
        except Exception as e:
            logger.warning(f"Graph visualization failed: {e}")
            return None

orchestrator = ComplianceOrchestrator()

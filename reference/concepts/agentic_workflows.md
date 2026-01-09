# Agentic Workflows - Concepts & Patterns

## What is an Agentic System?

An "agentic" AI system goes beyond simple request-response patterns. It exhibits autonomous behavior by:

- **Planning**: Breaking complex tasks into steps
- **Reasoning**: Making decisions based on context
- **Acting**: Executing tools and APIs
- **Observing**: Evaluating results
- **Iterating**: Refining until goal is achieved

## Core Pattern: The Agentic Loop

```
                    ┌─────────────────────────────────┐
                    │                                 │
                    ▼                                 │
┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────┴─────┐
│  OBSERVE │──▶│  THINK   │──▶│   ACT    │──▶│  EVALUATE  │
│          │   │          │   │          │   │            │
│ Gather   │   │ Reason   │   │ Execute  │   │ Check if   │
│ context  │   │ about    │   │ tool or  │   │ goal met   │
│          │   │ next     │   │ action   │   │            │
└──────────┘   │ step     │   └──────────┘   └──────┬─────┘
               └──────────┘                         │
                                                    │
                                    ┌───────────────┴───────────────┐
                                    │                               │
                                    ▼                               ▼
                              ┌──────────┐                   ┌──────────┐
                              │ CONTINUE │                   │  FINISH  │
                              │ (Loop)   │                   │ (Return) │
                              └──────────┘                   └──────────┘
```

## Key Components

### 1. LLM Orchestrator

The "brain" that decides what to do next.

```python
class Orchestrator:
    def __init__(self, llm, tools: List[Tool]):
        self.llm = llm
        self.tools = tools
        self.state = AgentState()

    def run(self, task: str) -> str:
        self.state.task = task

        while not self.state.is_complete:
            # Think: Decide next action
            action = self.llm.decide(
                task=self.state.task,
                history=self.state.history,
                available_tools=self.tools
            )

            # Act: Execute the action
            result = self.execute(action)

            # Observe: Record the result
            self.state.history.append((action, result))

            # Evaluate: Check if done
            self.state.is_complete = self.llm.is_task_complete(
                task=self.state.task,
                history=self.state.history
            )

        return self.state.final_answer
```

### 2. Tools

External capabilities the agent can invoke.

```python
class Tool:
    name: str
    description: str
    parameters: Dict[str, Any]

    def execute(self, **kwargs) -> str:
        """Execute the tool and return result"""
        pass

# Example tools
class SearchTool(Tool):
    name = "search"
    description = "Search a knowledge base"

class CalculatorTool(Tool):
    name = "calculate"
    description = "Perform mathematical calculations"

class APITool(Tool):
    name = "api_call"
    description = "Make an API request"
```

### 3. State Management

Track progress through the task.

```python
from langgraph.graph import StateGraph
from typing import TypedDict, Annotated

class AgentState(TypedDict):
    messages: Annotated[list, add_messages]  # Conversation history
    task: str                                  # Current task
    plan: List[str]                           # Planned steps
    current_step: int                         # Progress
    tool_outputs: Dict[str, Any]              # Tool results
    is_complete: bool                         # Done flag
```

## Agentic Patterns

### Pattern 1: ReAct (Reasoning + Acting)

Interleave thinking and acting.

```
Thought: I need to find the customer's policy details
Action: search_database(customer_id="12345")
Observation: Found policy #POL-789, Term Life, 50L coverage
Thought: Now I need to check compliance status
Action: check_compliance(policy_id="POL-789")
Observation: 2 violations found
Thought: I have all the information needed
Final Answer: Policy POL-789 has 2 compliance violations...
```

### Pattern 2: Plan and Execute

Create a plan first, then execute steps.

```python
def plan_and_execute(task: str):
    # 1. Create plan
    plan = planner_llm.create_plan(task)
    # Output: ["Step 1: ...", "Step 2: ...", "Step 3: ..."]

    # 2. Execute each step
    results = []
    for step in plan:
        result = executor_llm.execute_step(step, context=results)
        results.append(result)

    # 3. Synthesize final answer
    return synthesizer_llm.combine(results)
```

### Pattern 3: Multi-Agent Collaboration

Multiple specialized agents working together.

```
┌───────────────────────────────────────────────────────────────┐
│                       Supervisor Agent                         │
│                    (Coordinates workflow)                       │
└───────────────────────────────────────────────────────────────┘
                               │
            ┌──────────────────┼──────────────────┐
            ▼                  ▼                  ▼
     ┌────────────┐     ┌────────────┐     ┌────────────┐
     │  Research  │     │  Analysis  │     │   Writer   │
     │   Agent    │     │   Agent    │     │   Agent    │
     └────────────┘     └────────────┘     └────────────┘
```

### Pattern 4: Self-Correction

Agent checks and corrects its own output.

```python
def generate_with_correction(request: str, max_attempts: int = 3):
    for attempt in range(max_attempts):
        # Generate
        output = generator_llm.generate(request)

        # Self-check
        issues = checker_llm.find_issues(output)

        if not issues:
            return output

        # Correct
        request = f"Previous output had issues: {issues}. Fix them."

    return output  # Best effort after max attempts
```

## LangGraph Implementation

Your project uses LangGraph for orchestration. Key patterns:

### State Graph Definition

```python
from langgraph.graph import StateGraph, END

# Define the graph
workflow = StateGraph(ComplianceState)

# Add nodes (processing steps)
workflow.add_node("preprocess", preprocess_node)
workflow.add_node("analyze", analyze_node)
workflow.add_node("score", score_node)
workflow.add_node("human_review", human_review_node)

# Add edges (transitions)
workflow.add_edge("preprocess", "analyze")
workflow.add_edge("analyze", "score")
workflow.add_conditional_edges(
    "score",
    should_require_review,  # Routing function
    {
        True: "human_review",
        False: END
    }
)

# Compile
app = workflow.compile()
```

### Interrupts for Human-in-the-Loop

```python
workflow.add_node("human_review", human_review_node)

# Configure interrupt
app = workflow.compile(
    checkpointer=MemorySaver(),
    interrupt_before=["human_review"]  # Pause here
)

# Resume after human input
app.update_state(
    config,
    {"human_decision": "approved"}
)
result = app.invoke(None, config)
```

## When to Use Agentic Patterns

| Use Case                 | Pattern              |
| ------------------------ | -------------------- |
| Complex multi-step tasks | Plan and Execute     |
| Real-time interaction    | ReAct                |
| Specialized sub-tasks    | Multi-Agent          |
| Quality-critical output  | Self-Correction      |
| Compliance workflows     | HITL with interrupts |

## Anti-Patterns to Avoid

1. **Over-engineering**: Don't make simple tasks agentic
2. **Infinite loops**: Always have exit conditions
3. **Context overflow**: Summarize/prune long histories
4. **Tool overload**: Keep tool set focused
5. **No oversight**: Always have human-in-the-loop for critical decisions

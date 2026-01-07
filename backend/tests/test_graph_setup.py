import sys
import os
import asyncio

# Add backend to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

try:
    from app.services.agents.orchestration import compliance_graph
    print("SUCCESS: Graph imported.")
except Exception as e:
    print(f"ERROR: Graph import failed: {e}")
    sys.exit(1)

async def test_graph():
    print("Testing graph compilation...")
    try:
        graph = compliance_graph
        print("Graph compiled successfully.")
        print(f"Nodes: {graph.get_graph().nodes.keys()}")
    except Exception as e:
        print(f"ERROR: Graph compilation failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_graph())

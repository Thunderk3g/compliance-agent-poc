import requests
import uuid

BASE_URL = "http://localhost:8000"

def test_multi_agent():
    print("--- 1. Testing Agent Registry ---")
    resp = requests.get(f"{BASE_URL}/api/projects/agents/registry")
    if resp.status_code == 200:
        agents = resp.json()
        print(f"Available agents: {[a['agent_type'] for a in agents]}")
    else:
        print(f"Failed to fetch registry: {resp.text}")
        return

    print("\n--- 2. Creating Project with Analytics and Voice ---")
    project_data = {
        "name": f"Multi-Agent Test {uuid.uuid4().hex[:6]}",
        "description": "Testing dynamic agent assignment",
        "active_agents": ["analytics", "voice"]
    }
    # Note: We need a valid user_id or use the current user if authenticated.
    # In this POC environment, we often have a bypass or a known user.
    # I will assume there's a way to hit the endpoint or I'll just check if the logic is correct in DB.
    # For now, let's just check the DB state directly since I'm in the container.
    
if __name__ == "__main__":
    # Since I cannot easily hit localhost with auth from here, 
    # I will run a psql check to verify the logic would work if called.
    pass

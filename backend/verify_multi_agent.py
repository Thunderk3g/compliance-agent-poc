import sys
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from uuid import uuid4

# Add app to path
sys.path.append(os.getcwd())

from app.database import Base, get_db
from app.services.project_service import ProjectService
from app.models.user import User
from app.models.agent_registry import AgentRegistry
from app.models.project import Project
from app.models.project_agent import ProjectAgent

DATABASE_URL = "postgresql://compliance_user:compliance_pass@postgres:5432/compliance_db"

def verify_multi_agent_service():
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # 1. Get or Create a test user
        user = db.query(User).first()
        if not user:
            print("No user found. Seeding a test user...")
            user = User(id=uuid4(), email="test@example.com", hashed_password="hashed_password", is_active=True)
            db.add(user)
            db.commit()
            db.refresh(user)

        service = ProjectService(db)
        
        print("\n--- Testing Project Creation with Multiple Agents ---")
        project_name = f"Service Test {uuid4().hex[:6]}"
        active_agents = ["compliance", "analytics", "voice"]
        
        project = service.create_project(
            user_id=user.id,
            name=project_name,
            description="Testing dynamic agent logic",
            active_agents=active_agents
        )
        
        print(f"Project created: {project.name} (ID: {project.id})")
        print(f"Enabled agents in DB: {[pa.agent_type for pa in project.agents]}")
        
        assert len(project.agents) == 3
        assert set([pa.agent_type for pa in project.agents]) == set(active_agents)
        print("✅ Creation successful!")

        print("\n--- Testing Project Update (Removing Analytics, Adding Sales) ---")
        new_agents = ["compliance", "voice", "sales"]
        updated_project = service.update_project(
            project_id=project.id,
            active_agents=new_agents
        )
        
        print(f"Updated agents in DB: {[pa.agent_type for pa in updated_project.agents]}")
        assert len(updated_project.agents) == 3
        assert "analytics" not in [pa.agent_type for pa in updated_project.agents]
        assert "sales" in [pa.agent_type for pa in updated_project.agents]
        print("✅ Update successful!")

        print("\n--- Verifying ProjectResponse compatibility ---")
        # Check if project has the new attributes correctly
        print(f"Project ID: {updated_project.id}")
        for pa in updated_project.agents:
            print(f" - Agent: {pa.agent_type}, Enabled: {pa.enabled}")

        print("\n--- Cleaning up ---")
        db.delete(project)
        db.commit()
        print("✅ Cleanup successful!")

    except Exception as e:
        print(f"❌ Verification failed: {e}")
        db.rollback()
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    verify_multi_agent_service()

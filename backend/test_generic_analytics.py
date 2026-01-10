import asyncio
import sys
import os

# Add parent dir to path to find 'app'
sys.path.append(os.getcwd())

from app.database import SessionLocal
from app.services.agents.analytics.preprocessor_agent import PreprocessorAgent
from app.services.agents.analytics.analytics_agent import AnalyticsAgent
from app.services.llm_service import llm_service

async def test():
    db = SessionLocal()
    try:
        agent = PreprocessorAgent()
        
        # 1. Create dummy CSV
        # Use simpler content to ensure no parsing issues
        csv_content = b"Region,Sales,Date\nNorth,100,2024-01-01\nSouth,200,2024-01-02\nNorth,150,2024-01-03"
        
        # 2. Ingest
        print("Ingesting...")
        dataset_id = await agent.ingest_dataset(csv_content, "test.csv", db)
        print(f"Dataset ID: {dataset_id}")
        
        # 3. Analyze
        analytics_agent = AnalyticsAgent(llm_service)
        query = "Analyze the uploaded dataset sales by region"
        input_data = {
            "analytics_query": query,
            "dataset_id": dataset_id,
            "project_id": "test-project"
        }
        
        print(f"Querying: {query}")
        result = await analytics_agent.reason(input_data, db=db)
        
        print("\n--- FINAL ---")
        print(f"Narrative: {result.get('narrative')[:100]}...")
        print(f"Chart Config: {result.get('chart_config')}")
        
        print("\n--- INTENT ---")
        for step in result.get("reasoning_steps", []):
            if step.get("action") == "parsed_intent":
                print(f"Intent: {step.get('result')}")
                break
        
        print(f"Reasoning Steps: {len(result.get('reasoning_steps', []))}")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(test())

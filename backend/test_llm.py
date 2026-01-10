import asyncio
import os
import sys

# Add /app to python path
sys.path.append("/app")

from app.services.llm_service import llm_service

async def test():
    print("Testing LLM Service...")
    print(f"Base URL: {llm_service.base_url}")
    print(f"Model: {llm_service.model}")
    print(f"API Key present: {bool(llm_service.api_key)}")
    
    try:
        response = await llm_service.generate_response("Hello, are you working?")
        print(f"\nResponse:\n{response}")
    except Exception as e:
        print(f"\nError:\n{e}")

if __name__ == "__main__":
    asyncio.run(test())

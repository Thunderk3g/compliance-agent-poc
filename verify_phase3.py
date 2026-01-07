
import sys
import os
import asyncio
from uuid import uuid4

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

def test_sandboxing():
    print("\n[Testing Sandboxing]")
    from app.services.sandbox_service import sandbox_service, ExecutionRequest
    
    if not sandbox_service.client:
        print("SKIPPING: Docker client not initialized (Docker Desktop running?)")
        return

    req = ExecutionRequest(code="print('Hello from Sandbox')", timeout_seconds=10)
    print(f"Executing: {req.code}")
    res = sandbox_service.execute_code(req)
    
    print(f"Result: ExitCode={res.exit_code}")
    print(f"Stdout: {res.stdout.strip()}")
    print(f"Stderr: {res.stderr.strip()}")
    
    if res.exit_code == 0 and "Hello from Sandbox" in res.stdout:
        print("SUCCESS: Sandbox execution worked.")
    else:
        print("FAILURE: Sandbox execution failed.")

def test_rbac_checker():
    print("\n[Testing RBAC Checker]")
    from fastapi import HTTPException
    from app.api.deps import RoleChecker, User
    
    checker = RoleChecker(["admin"])
    
    # Cast 1: Authorized
    user_admin = User(id=uuid4(), role="admin")
    try:
        checker(user_admin)
        print("SUCCESS: Admin user allowed.")
    except Exception as e:
        print(f"FAILURE: Admin user blocked: {e}")

    # Case 2: Blocked
    user_viewer = User(id=uuid4(), role="viewer")
    try:
        checker(user_viewer)
        print("FAILURE: Viewer user was NOT blocked.")
    except HTTPException as e:
        if e.status_code == 403:
            print("SUCCESS: Viewer user correctly blocked (403).")
        else:
            print(f"FAILURE: Wrong status code {e.status_code}")
    except Exception as e:
        print(f"FAILURE: Unexpected exception: {e}")

    # Case 3: Super Admin bypass
    user_super = User(id=uuid4(), role="super_admin")
    try:
        checker(user_super)
        print("SUCCESS: Super Admin allowed (bypass).")
    except Exception as e:
        print(f"FAILURE: Super Admin blocked: {e}")

def test_observability_model():
    print("\n[Testing Observability Model Import]")
    try:
        from app.models.agent_trace import AgentTrace
        print("SUCCESS: AgentTrace model imported.")
    except ImportError as e:
        print(f"FAILURE: Could not import AgentTrace: {e}")

if __name__ == "__main__":
    print("Starting Phase 3 Verification...")
    try:
        test_rbac_checker()
        test_observability_model()
        test_sandboxing()
    except Exception as e:
        print(f"CRITICAL ERROR in verification script: {e}")
        import traceback
        traceback.print_exc()

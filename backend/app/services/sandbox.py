import docker
import logging
import tempfile
import contextlib
import os
import signal
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class SandboxService:
    """
    Secure Execution Environment using Docker.
    Encapsulates dynamic code execution for the agent system.
    """
    
    def __init__(self):
        try:
            self.client = docker.from_env()
            # Ensure safe image exists
            self.image = "python:3.11-slim"
            # self.client.images.pull(self.image) # Enable if online/needed
        except Exception as e:
            logger.error(f"Failed to initialize Docker client: {e}")
            self.client = None

    def execute_python_code(self, code: str, timeout: int = 10) -> Dict[str, Any]:
        """
        Executes Python code in an isolated container.
        """
        if not self.client:
            return {"error": "Sandbox unavailable (Docker client initialization failed)", "success": False}

        container = None
        try:
            logger.info("Sandbox: Executing code...")
            
            # Constraints
            host_config = self.client.api.create_host_config(
                mem_limit="128m",
                cpu_quota=50000, # 50% CPU
                network_mode="none" # No internet
            )
            
            # Simple wrapper to capture print output
            wrapped_code = f"""
import sys
import json
try:
{code}
except Exception as e:
    print(f"ERROR: {{e}}", file=sys.stderr)
"""
            
            # Run container
            container = self.client.containers.run(
                self.image,
                command=["python", "-c", code],
                detach=True,
                mem_limit="128m",
                network_mode="none",
                # user="sandbox_user", # Ideal if image supports it
                # read_only=True, # Read only FS
                stop_timeout=2
            )
            
            # Wait for result with timeout
            try:
                result = container.wait(timeout=timeout)
                exit_code = result.get('StatusCode', 1)
            except Exception as e: # Timeout or other error
                container.kill()
                return {"error": f"Execution timed out or failed: {str(e)}", "success": False}
                
            # Get logs
            logs_stdout = container.logs(stdout=True, stderr=False).decode('utf-8')
            logs_stderr = container.logs(stdout=False, stderr=True).decode('utf-8')
            
            return {
                "stdout": logs_stdout,
                "stderr": logs_stderr,
                "exit_code": exit_code,
                "success": exit_code == 0
            }

        except Exception as e:
            logger.error(f"Sandbox Error: {e}")
            return {"error": str(e), "success": False}
        finally:
            if container:
                try:
                    container.remove(force=True)
                except:
                    pass

sandbox_service = SandboxService()

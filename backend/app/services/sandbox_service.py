import docker
import logging
from ..schemas.sandbox import ExecutionRequest, ExecutionResponse
from ..config import settings

logger = logging.getLogger(__name__)

class SandboxService:
    def __init__(self):
        try:
            self.client = docker.from_env()
            # Test connection
            self.client.ping()
            logger.info("Docker client initialized successfully.")
        except Exception as e:
            logger.warning(f"Failed to initialize Docker client: {e}. Sandboxing will not work.")
            self.client = None

    def execute_code(self, request: ExecutionRequest) -> ExecutionResponse:
        """
        Executes code within a secure Docker container.
        """
        if not self.client:
            return ExecutionResponse(
                exit_code=-1, stdout="", stderr="", error="Docker implementation not available (client failed init)"
            )

        if request.language != "python":
            return ExecutionResponse(
                exit_code=-1, stdout="", stderr="", error=f"Unsupported language: {request.language}"
            )

        container = None
        try:
            # Prepare code wrapper to avoid immediate exit issues or formatting
            # For simplest python execution:
            
            logger.info("Spawning sandbox container...")
            
            # Use a standard python slim image
            # Network disabled for security
            container = self.client.containers.run(
                "python:3.10-slim",
                command=["python", "-c", request.code],
                detach=True,
                network_disabled=True,
                mem_limit="128m",
                # cpu_period=100000,
                # cpu_quota=50000,
            )
            
            try:
                # Wait for result
                result = container.wait(timeout=request.timeout_seconds)
                exit_code = result.get('StatusCode', 0)
                
                # Get logs
                stdout = container.logs(stdout=True, stderr=False).decode('utf-8', errors='replace')
                stderr = container.logs(stdout=False, stderr=True).decode('utf-8', errors='replace')
                
                return ExecutionResponse(
                    exit_code=exit_code,
                    stdout=stdout,
                    stderr=stderr
                )
            except Exception as e:
                # Likely timeout
                logger.error(f"Sandbox execution timed out or failed wait: {e}")
                return ExecutionResponse(
                    exit_code=-1, 
                    stdout="", 
                    stderr="", 
                    error=f"Execution timed out or failed: {str(e)}"
                )
                
        except Exception as e:
            logger.error(f"Sandbox container launch failed: {e}")
            return ExecutionResponse(
                exit_code=-1, 
                stdout="", 
                stderr="", 
                error=f"Container launch failed: {str(e)}"
            )
        finally:
            if container:
                try:
                    container.remove(force=True)
                except Exception as e:
                    logger.error(f"Failed to remove sandbox container: {e}")

sandbox_service = SandboxService()

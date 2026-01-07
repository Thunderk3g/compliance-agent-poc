from pydantic import BaseModel
from typing import Optional, Dict

class ExecutionRequest(BaseModel):
    code: str
    language: str = "python"
    timeout_seconds: int = 30

class ExecutionResponse(BaseModel):
    exit_code: int
    stdout: str
    stderr: str
    error: Optional[str] = None

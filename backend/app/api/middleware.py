from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
import contextvars
import uuid
import logging

logger = logging.getLogger(__name__)

# ContextVar to hold current user ID globally
user_id_context = contextvars.ContextVar("user_id", default=None)

class AuthenticationMiddleware(BaseHTTPMiddleware):
    """
    Middleware to extract X-User-Id and set it in contextvars for global access.
    Acts as a foundational layer for RBAC by ensuring identity is propagated.
    """
    
    async def dispatch(self, request: Request, call_next):
        user_id = request.headers.get("X-User-Id")
        
        token = None
        if user_id:
            try:
                # Basic validation
                uid = str(uuid.UUID(user_id))
                token = user_id_context.set(uid)
                # logger.debug(f"Middleware: Context set for user {uid}")
            except ValueError:
                logger.warning(f"Middleware: Invalid X-User-Id header: {user_id}")
        
        try:
            response = await call_next(request)
            return response
        finally:
            if token:
                user_id_context.reset(token)

def get_global_user_id():
    """Access the global user ID from context."""
    return user_id_context.get()

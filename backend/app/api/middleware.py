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
        auth_header = request.headers.get("Authorization")
        user_id = None
        
        if auth_header and auth_header.startswith("Bearer "):
            token_str = auth_header.split("Bearer ")[1]
            from ..services.firebase_service import firebase_service
            decoded_token = firebase_service.verify_token(token_str)
            if decoded_token:
                # Map Firebase UID to UUID like in deps.py
                firebase_uid = decoded_token.get("uid")
                try:
                    import uuid
                    if len(firebase_uid) != 36:
                        import hashlib
                        m = hashlib.md5()
                        m.update(firebase_uid.encode('utf-8'))
                        user_id = str(uuid.UUID(m.hexdigest()))
                    else:
                        user_id = str(uuid.UUID(firebase_uid))
                except:
                    logger.warning(f"Middleware: Could not map Firebase UID {firebase_uid} to UUID")

        # Fallback to X-User-Id for POC compatibility during migration
        if not user_id:
            x_user_id = request.headers.get("X-User-Id")
            if x_user_id:
                # Apply same MD5 hashing logic as deps.py to convert Firebase UID to UUID
                try:
                    import uuid
                    import hashlib
                    if len(x_user_id) == 36:
                        # It's already a UUID format
                        user_id = str(uuid.UUID(x_user_id))
                    else:
                        # Firebase UID - hash it to create deterministic UUID
                        m = hashlib.md5()
                        m.update(x_user_id.encode('utf-8'))
                        user_id = str(uuid.UUID(m.hexdigest()))
                except Exception as e:
                    logger.warning(f"Middleware: Could not convert X-User-Id '{x_user_id}' to UUID: {e}")

        token = None
        if user_id:
            try:
                token = user_id_context.set(user_id)
            except Exception as e:
                logger.warning(f"Middleware: Could not set user context: {e}")
        
        try:
            response = await call_next(request)
            return response
        finally:
            if token:
                user_id_context.reset(token)

def get_global_user_id():
    """Access the global user ID from context."""
    return user_id_context.get()

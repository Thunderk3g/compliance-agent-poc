from typing import Generator
from fastapi import Depends, HTTPException, Header, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.user import User
import uuid


def get_db_session() -> Generator[Session, None, None]:
    """Dependency for database session."""
    db = next(get_db())
    try:
        yield db
    finally:
        db.close()


# Phase 2: Role-based authentication dependencies
# Note: This is a simplified POC implementation
# In production, use proper JWT/OAuth authentication

async def get_current_user_id(
    authorization: str = Header(None, description="Firebase ID Token")
) -> uuid.UUID:
    """
    Extract user ID from Firebase ID Token.
    """
    if not authorization or not authorization.startswith("Bearer "):
        # For POC/Demo, still allow X-User-Id as fallback
        # But in real implementation, we should enforce Bearer token
        x_user_id = None
        try:
            # We'll check if X-User-Id is present as a fallback for now
            # This allows gradual migration
            pass
        except:
            pass
            
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header with Bearer token is required"
        )

    id_token = authorization.split("Bearer ")[1]
    from ..services.firebase_service import firebase_service
    
    decoded_token = firebase_service.verify_token(id_token)
    if not decoded_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired Firebase token"
        )

    # Firebase UID is often a string, but our DB uses UUID
    # For POC, we might need to map Firebase UID to our UUID or update DB to use string IDs
    # Here, we'll try to convert or use a default if it's not a UUID format
    firebase_uid = decoded_token.get("uid")
    email = decoded_token.get("email")
    name = decoded_token.get("name", "Firebase User")

    try:
        # Try to use a deterministic UUID based on Firebase UID if it's not a UUID
        if len(firebase_uid) != 36: # Simple check for UUID length
            # Generate a namespace UUID
            import hashlib
            m = hashlib.md5()
            m.update(firebase_uid.encode('utf-8'))
            user_id = uuid.UUID(m.hexdigest())
        else:
            user_id = uuid.UUID(firebase_uid)
            
        # Register user if they don't exist
        db = next(get_db())
        try:
            user = db.query(User).filter(User.id == user_id).first()
            if not user:
                user = User(
                    id=user_id,
                    name=name,
                    email=email,
                    role="super_admin" # Default for POC
                )
                db.add(user)
                db.commit()
        finally:
            db.close()
            
        return user_id
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid user ID mapping from Firebase"
        )


async def get_current_user(
    user_id: uuid.UUID = Depends(get_current_user_id),
    db: Session = Depends(get_db_session)
) -> User:
    """Get current user from database."""
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return user



class RoleChecker:
    def __init__(self, allowed_roles: list[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, user: User = Depends(get_current_user)):
        # Super admin always has access
        if user.role == "super_admin":
            return user
            
        if user.role not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation not permitted. Required roles: {self.allowed_roles}"
            )
        return user

async def require_super_admin(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Require super_admin role.
    Raises 403 Forbidden if user is not a super admin.
    """
    return RoleChecker(["super_admin"])(current_user)

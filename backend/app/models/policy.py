from sqlalchemy import Column, String, Float, DateTime, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from ..database import Base

class Policy(Base):
    """
    Policy model for Sales Analytics (Synthetic Data).
    Replicates the schema from Agentic-LLM-Power-BI for demonstration.
    """
    __tablename__ = "policies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    # Using Integer ID for compatibility with reference logic often using numeric IDs, 
    # but mapped to UUID primary key. We can add a legacy_id if strict int is needed.
    
    product = Column(String(50), nullable=False) # Term, Health, etc.
    premium = Column(Float, nullable=False)
    city = Column(String(50), nullable=False)
    region = Column(String(50), nullable=True) # Optional region
    issue_date = Column(DateTime(timezone=True), nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

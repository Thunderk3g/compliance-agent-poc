from sqlalchemy import Column, String, Text, DateTime, Boolean
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
import uuid
from ..database import Base


class Rule(Base):
    __tablename__ = "rules"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    category = Column(String(20), nullable=False)  # irdai, brand, seo
    rule_text = Column(Text, nullable=False)
    severity = Column(String(20), nullable=False)  # critical, high, medium, low
    keywords = Column(JSONB)  # Array of keywords
    pattern = Column(String(1000))  # Optional regex
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

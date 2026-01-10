from sqlalchemy import Column, String, DateTime, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from ..database import Base

class Dataset(Base):
    """
    Metadata for uploaded datasets.
    """
    __tablename__ = "datasets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(String, nullable=True)
    file_type = Column(String(50), nullable=True) # csv, excel, etc.
    
    # Schema inference: {"columns": [{"name": "col1", "type": "int"}, ...]}
    schema_metadata = Column(JSONB, nullable=True) 
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    rows = relationship("DatasetRow", back_populates="dataset", cascade="all, delete-orphan")

class DatasetRow(Base):
    """
    Generic storage for dataset rows.
    """
    __tablename__ = "dataset_rows"

    id = Column(Integer, primary_key=True, autoincrement=True)
    dataset_id = Column(UUID(as_uuid=True), ForeignKey("datasets.id"), nullable=False)
    
    # Store the row data as a JSON dictionary
    # e.g. {"region": "North", "sales": 1000, "date": "2024-01-01"}
    data = Column(JSONB, nullable=False)
    
    dataset = relationship("Dataset", back_populates="rows")

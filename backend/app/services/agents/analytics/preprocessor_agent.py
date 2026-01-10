import pandas as pd
import json
import uuid
from sqlalchemy.orm import Session
from app.models.analytics_data import Dataset, DatasetRow
import logging
from io import BytesIO

logger = logging.getLogger(__name__)

class PreprocessorAgent:
    """
    Agent responsible for ingesting, cleaning, and preprocessing 
    generic datasets (CSV/Excel) for the Analytics Agent.
    """
    
    def __init__(self):
        pass

    async def ingest_dataset(self, file_contents: bytes, filename: str, db: Session, dataset_name: str = None) -> str:
        """
        Ingest a file (CSV/Excel), infer schema, and save to DB.
        Returns the new Dataset ID.
        """
        try:
            # 1. Load Data
            if filename.endswith(".csv"):
                df = pd.read_csv(BytesIO(file_contents))
            elif filename.endswith((".xls", ".xlsx")):
                df = pd.read_excel(BytesIO(file_contents))
            else:
                raise ValueError("Unsupported file format. Please upload CSV or Excel.")

            # 2. Clean Data
            df = self._clean_data(df)
            
            # 3. Infer Schema
            schema = self._infer_schema(df)
            
            # 4. Create Dataset Record
            dataset_id = uuid.uuid4()
            dataset = Dataset(
                id=dataset_id,
                name=dataset_name or filename,
                file_type=filename.split(".")[-1],
                schema_metadata=schema
            )
            db.add(dataset)
            db.commit() # Commit to get ID usable
            
            # 5. Bulk Insert Rows
            # Convert to list of dicts, ensuring JSON compliance (e.g. dates to strings)
            records = df.to_dict(orient="records")
            
            # Create DatasetRow objects
            row_objects = [
                DatasetRow(dataset_id=dataset_id, data=record) 
                for record in records
            ]
            
            # Use bulk_save_objects for performance
            db.bulk_save_objects(row_objects)
            db.commit()
            
            logger.info(f"Successfully ingested {len(records)} rows for dataset {dataset_id}")
            return str(dataset_id)

        except Exception as e:
            db.rollback()
            logger.error(f"Ingestion failed: {e}")
            raise e

    def _clean_data(self, df: pd.DataFrame) -> pd.DataFrame:
        """Standardize and clean the dataframe."""
        # Replace NaN with None (which becomes null in JSON) or empty string
        # JSON standard doesn't support NaN
        df = df.where(pd.notnull(df), None)
        
        # Convert all generic objects to strings to avoid serialization issues, 
        # EXCEPT numbers/bools which we want to keep native if possible.
        # For this POC, we'll try to keep types inferred by pandas.
        
        # Ensure column names are clean (no spaces, special chars ideally, but for now just strip)
        df.columns = df.columns.str.strip()
        
        return df

    def _infer_schema(self, df: pd.DataFrame) -> dict:
        """Infer JSON schema from DataFrame columns."""
        columns = []
        for col in df.columns:
            dtype = str(df[col].dtype)
            col_type = "string"
            if "int" in dtype:
                col_type = "integer"
            elif "float" in dtype:
                col_type = "float"
            elif "bool" in dtype:
                col_type = "boolean"
            elif "datetime" in dtype:
                col_type = "datetime"
            
            columns.append({"name": col, "type": col_type})
            
        return {"columns": columns}

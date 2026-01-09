import sys
import os
from sqlalchemy import text
from sqlalchemy.orm import sessionmaker

# Add the project root to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database import engine

def migrate():
    print("Starting migration: Adding agent columns to projects table...")
    
    queries = [
        "ALTER TABLE projects ADD COLUMN IF NOT EXISTS agent_voice BOOLEAN DEFAULT FALSE;",
        "ALTER TABLE projects ADD COLUMN IF NOT EXISTS agent_compliance BOOLEAN DEFAULT TRUE;",
        "ALTER TABLE projects ADD COLUMN IF NOT EXISTS agent_analytics BOOLEAN DEFAULT FALSE;",
        "ALTER TABLE projects ADD COLUMN IF NOT EXISTS agent_sales BOOLEAN DEFAULT FALSE;",
        "ALTER TABLE projects ADD COLUMN IF NOT EXISTS agent_config JSONB;"
    ]
    
    with engine.connect() as connection:
        for query in queries:
            try:
                print(f"Executing: {query}")
                connection.execute(text(query))
                connection.commit()
                print("Success.")
            except Exception as e:
                print(f"Error executing query: {e}")
                
    print("Migration complete.")

if __name__ == "__main__":
    migrate()

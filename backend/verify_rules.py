
import sys
import os

# Add current directory to path
sys.path.append(os.getcwd())

# Set env var before importing app.config
os.environ["DATABASE_URL"] = "postgresql://compliance_user:compliance_pass@127.0.0.1:5432/compliance_db"

from app.database import SessionLocal
from app.models.rule import Rule
from app.models.project import Project
from uuid import UUID

def verify_rules():
    db = SessionLocal()
    project_id = UUID('8a752cfd-9df3-4540-83f8-ce00d73f4092')
    
    print(f"Checking details for project_id: {project_id}")
    
    project = db.query(Project).filter(Project.id == project_id).first()
    if project:
        print(f"Project Name: {project.name}")
        print(f"Project Description: {project.description}")
        print(f"Project Created At: {project.created_at}")
    else:
        print("Project NOT FOUND")
        db.close()
        return

    rules = db.query(Rule).filter(Rule.project_id == project_id).all()
    
    print(f"Found {len(rules)} rules.")
    
    if len(rules) > 0:
        print("\nDummy Check - First 3 Rules:")
        for rule in rules[:3]:
            print(f"ID: {rule.id}")
            print(f"Category: {rule.category}")
            print(f"Rule: {rule.rule_text}")
            print(f"Source Guideline ID: {rule.source_guideline_id}")
            print("-" * 20)
    
    db.close()

if __name__ == "__main__":
    verify_rules()

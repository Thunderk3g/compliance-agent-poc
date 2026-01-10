import asyncio
import uuid
from sqlalchemy.orm import Session
from .database import SessionLocal, engine, Base
from .models.user import User
from .models.rule import Rule
from .models.project import Project

def seed_data():
    print("🌱 Starting database seeding...")
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # 1. Create Default Super Admin
        admin_id = uuid.UUID("00000000-0000-0000-0000-000000000000")
        admin = db.query(User).filter(User.id == admin_id).first()
        if not admin:
            admin = User(
                id=admin_id,
                name="System Admin",
                email="admin@wisp-agent.com",
                role="super_admin"
            )
            db.add(admin)
            db.flush()
            print(f"✅ Created super admin: {admin.email}")
        else:
            print("ℹ️ Super admin already exists.")

        # 2. Create Default Project
        project = db.query(Project).filter(Project.name == "Default Compliance Project").first()
        if not project:
            project = Project(
                id=uuid.uuid4(),
                name="Default Compliance Project",
                description="Initial project for regulatory and brand compliance checking.",
                created_by=admin.id
            )
            db.add(project)
            db.flush()
            print(f"✅ Created default project: {project.name}")
        else:
            print("ℹ️ Default project already exists.")

        # 3. Create Initial Rules
        if db.query(Rule).count() == 0:
            print("📏 Creating initial rules...")
            seed_rules = [
                # IRDAI Rules
                {
                    "category": "irdai",
                    "rule_text": "No misleading claims about returns/guarantees",
                    "severity": "critical",
                    "keywords": ["guaranteed", "assured", "fixed returns"],
                    "points_deduction": -20.00
                },
                {
                    "category": "irdai",
                    "rule_text": "Proper risk disclosures required",
                    "severity": "high",
                    "keywords": ["risk factors", "terms and conditions"],
                    "points_deduction": -10.00
                },
                # Brand Rules
                {
                    "category": "brand",
                    "rule_text": "Use of full company name 'Bajaj Allianz Life' required",
                    "severity": "medium",
                    "keywords": ["Bajaj Allianz"],
                    "points_deduction": -5.00
                },
                # SEO Rules
                {
                    "category": "seo",
                    "rule_text": "Title length optimization (50-60 chars)",
                    "severity": "low",
                    "keywords": ["title", "length"],
                    "points_deduction": -2.00
                }
            ]
            
            for rule_data in seed_rules:
                rule = Rule(
                    id=uuid.uuid4(),
                    category=rule_data["category"],
                    rule_text=rule_data["rule_text"],
                    severity=rule_data["severity"],
                    keywords=rule_data["keywords"],
                    points_deduction=rule_data["points_deduction"],
                    is_active=True,
                    created_by=admin.id,
                    project_id=project.id
                )
                db.add(rule)
            
            db.commit()
            print(f"✅ Created {len(seed_rules)} rules.")
        else:
            print("ℹ️ Rules already exist, skipping...")

        print("🎉 Seeding completed successfully!")
        
    except Exception as e:
        print(f"❌ Error during seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()

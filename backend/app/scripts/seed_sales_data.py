import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.policy import Policy
from app.database import SessionLocal
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def seed_sales_data(db: Session, num_records: int = 2500):
    """
    seeds the 'policies' table with synthetic data
    matching the logic in Agentic-LLM-Power-BI reference.
    """
    logger.info(f"Seeding {num_records} policy records...")
    
    # clear existing data
    db.query(Policy).delete()
    
    products = ["Term", "Health", "Travel", "Vehicle", "Property", "Business"]
    cities = ["Pune", "Mumbai", "Delhi", "Bangalore", "Hyderabad"]
    
    policies = []
    
    for _ in range(num_records):
        policies.append(Policy(
            product=random.choice(products),
            premium=float(random.randint(10000, 30000)),
            city=random.choice(cities),
            issue_date=datetime.now() - timedelta(days=random.randint(0, 400))
        ))
    
    db.add_all(policies)
    db.commit()
    logger.info("Seeding complete.")

if __name__ == "__main__":
    db = SessionLocal()
    try:
        seed_sales_data(db)
    finally:
        db.close()

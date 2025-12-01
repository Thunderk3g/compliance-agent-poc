"""Database seeding script for compliance rules and sample data."""
import asyncio
from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models.user import User
from app.models.rule import Rule
from app.models.submission import Submission
import uuid


def seed_users(db: Session):
    """Seed sample users."""
    users = [
        User(name="John Agent", email="john@example.com", role="agent"),
        User(name="Sarah Reviewer", email="sarah@example.com", role="reviewer"),
    ]

    for user in users:
        db.add(user)

    db.commit()
    print(f"✅ Seeded {len(users)} users")


def seed_rules(db: Session):
    """Seed compliance rules."""

    # IRDAI Rules (Critical/High)
    irdai_rules = [
        Rule(
            category="irdai",
            rule_text="No misleading claims about guaranteed returns without proper disclaimers",
            severity="critical",
            keywords=["guaranteed", "returns", "promise", "assured"]
        ),
        Rule(
            category="irdai",
            rule_text="Risk disclosures must be present for all insurance products",
            severity="critical",
            keywords=["risk", "disclosure", "warning"]
        ),
        Rule(
            category="irdai",
            rule_text="Medical conditions must not be trivialized or misrepresented",
            severity="high",
            keywords=["medical", "disease", "health", "cure"]
        ),
        Rule(
            category="irdai",
            rule_text="Competitor comparisons must be factual and verifiable",
            severity="high",
            keywords=["competitor", "versus", "compare", "better than"]
        ),
        Rule(
            category="irdai",
            rule_text="All charges and fees must be clearly disclosed",
            severity="high",
            keywords=["charges", "fees", "cost", "premium"]
        ),
    ]

    # Brand Rules (Medium)
    brand_rules = [
        Rule(
            category="brand",
            rule_text="Use 'Bajaj Allianz' not abbreviations in customer-facing content",
            severity="medium",
            keywords=["BALIC", "BA", "abbreviation"]
        ),
        Rule(
            category="brand",
            rule_text="Prohibited words: cheap, best, guarantee (unless factually backed)",
            severity="medium",
            keywords=["cheap", "best", "guarantee", "cheapest"]
        ),
        Rule(
            category="brand",
            rule_text="Tone must be professional yet approachable, not overly casual",
            severity="medium",
            keywords=["slang", "casual", "unprofessional"]
        ),
        Rule(
            category="brand",
            rule_text="Brand colors and logos must follow visual guidelines",
            severity="low",
            keywords=["logo", "color", "brand"]
        ),
    ]

    # SEO Rules (Low/Medium)
    seo_rules = [
        Rule(
            category="seo",
            rule_text="Title should be 50-60 characters for optimal display",
            severity="low",
            keywords=["title", "heading", "h1"]
        ),
        Rule(
            category="seo",
            rule_text="Meta description required (150-160 characters)",
            severity="medium",
            keywords=["meta", "description"]
        ),
        Rule(
            category="seo",
            rule_text="Focus keyword should appear in first paragraph",
            severity="low",
            keywords=["keyword", "seo"]
        ),
        Rule(
            category="seo",
            rule_text="Images must have alt text for accessibility",
            severity="medium",
            keywords=["alt", "image", "accessibility"]
        ),
    ]

    all_rules = irdai_rules + brand_rules + seo_rules

    for rule in all_rules:
        db.add(rule)

    db.commit()
    print(f"✅ Seeded {len(all_rules)} rules")
    print(f"   - IRDAI: {len(irdai_rules)} rules")
    print(f"   - Brand: {len(brand_rules)} rules")
    print(f"   - SEO: {len(seo_rules)} rules")


def main():
    """Run all seed functions."""
    print("🌱 Starting database seeding...")

    db = SessionLocal()

    try:
        seed_users(db)
        seed_rules(db)

        print("✅ Database seeding completed!")

    except Exception as e:
        print(f"❌ Error seeding database: {str(e)}")
        db.rollback()

    finally:
        db.close()


if __name__ == "__main__":
    main()

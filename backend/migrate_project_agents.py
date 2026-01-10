"""
Data Migration Script: Convert Old Project Agent Flags to New Structure

This script migrates projects from the old boolean flag system (agent_voice, agent_compliance, etc.)
to the new ProjectAgent join table structure.
"""

from sqlalchemy.orm import Session
from app.database import SessionLocal, engine
from app.models.project import Project
from app.models.project_agent import ProjectAgent
from app.models.agent_registry import AgentRegistry
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def migrate_project_agents():
    """Migrate all projects to use the new agent structure."""
    db: Session = SessionLocal()
    
    try:
        # Get all projects
        projects = db.query(Project).all()
        logger.info(f"Found {len(projects)} projects to migrate")
        
        migrated_count = 0
        skipped_count = 0
        
        for project in projects:
            # Check if already migrated (has ProjectAgent records)
            existing_agents = db.query(ProjectAgent).filter(
                ProjectAgent.project_id == project.id
            ).count()
            
            if existing_agents > 0:
                logger.info(f"Project {project.id} ({project.name}) already migrated, skipping")
                skipped_count += 1
                continue
            
            # Map old boolean flags to agent types
            agents_to_add = []
            
            if project.agent_compliance:
                agents_to_add.append('compliance')
            if project.agent_voice:
                agents_to_add.append('voice')
            if project.agent_analytics:
                agents_to_add.append('analytics')
            if project.agent_sales:
                agents_to_add.append('sales')
            
            # If no agents were enabled, default to compliance
            if not agents_to_add:
                agents_to_add = ['compliance']
            
            # Create ProjectAgent records
            for agent_type in agents_to_add:
                # Verify agent exists in registry
                agent_exists = db.query(AgentRegistry).filter(
                    AgentRegistry.agent_type == agent_type,
                    AgentRegistry.is_active == True
                ).first()
                
                if agent_exists:
                    pa = ProjectAgent(
                        project_id=project.id,
                        agent_type=agent_type,
                        enabled=True
                    )
                    db.add(pa)
                    logger.info(f"Added {agent_type} agent to project {project.name}")
                else:
                    logger.warning(f"Agent type '{agent_type}' not found in registry, skipping")
            
            migrated_count += 1
        
        db.commit()
        logger.info(f"\nMigration complete!")
        logger.info(f"Migrated: {migrated_count} projects")
        logger.info(f"Skipped: {skipped_count} projects (already migrated)")
        
    except Exception as e:
        logger.error(f"Migration failed: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    logger.info("Starting project agent migration...")
    migrate_project_agents()
    logger.info("Migration script completed!")

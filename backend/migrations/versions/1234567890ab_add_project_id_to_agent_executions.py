"""add project id to agent executions

Revision ID: 1234567890ab
Revises: c6c5e04af60a
Create Date: 2025-12-27 15:15:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '1234567890ab'
down_revision = 'c6c5e04af60a'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Check if column exists to avoid error if re-running
    conn = op.get_bind()
    inspector = sa.inspect(conn)
    columns = [c['name'] for c in inspector.get_columns('agent_executions')]
    
    if 'project_id' not in columns:
        op.add_column('agent_executions', sa.Column('project_id', postgresql.UUID(as_uuid=True), nullable=True))
        op.create_index(op.f('ix_agent_executions_project_id'), 'agent_executions', ['project_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_agent_executions_project_id'), table_name='agent_executions')
    op.drop_column('agent_executions', 'project_id')

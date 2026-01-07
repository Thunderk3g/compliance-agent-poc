"""Add agent_traces table

Revision ID: 3c4d5e6f7g8h
Revises: 1234567890ab
Create Date: 2026-01-07

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '3c4d5e6f7g8h'
down_revision: Union[str, Sequence[str], None] = '1234567890ab' # Using the latest one I saw in list_dir
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Agent traces - reasoning steps
    op.create_table('agent_traces',
        sa.Column('id', postgresql.UUID(as_uuid=True), 
                  server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('execution_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('step_number', sa.String(50), nullable=False),
        sa.Column('thought', sa.Text(), nullable=True),
        sa.Column('action', sa.String(255), nullable=True),
        sa.Column('action_input', postgresql.JSONB(), nullable=True),
        sa.Column('observation', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), 
                  server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['execution_id'], ['agent_executions.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_agent_traces_execution_id', 'agent_traces', ['execution_id'])


def downgrade() -> None:
    op.drop_table('agent_traces')

"""add_voice_analytics_agents_and_reports

Revision ID: 82c74e3c4c4e
Revises: 5e6f7g8h9i0j
Create Date: 2026-01-10 01:10:25.269545

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '82c74e3c4c4e'
down_revision: Union[str, Sequence[str], None] = '5e6f7g8h9i0j'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    
    # Check existing columns in projects table
    existing_columns = [c['name'] for c in inspector.get_columns('projects')]
    
    if 'agent_voice' not in existing_columns:
        op.add_column('projects', sa.Column('agent_voice', sa.Boolean(), nullable=True, server_default='false'))
    
    if 'agent_analytics' not in existing_columns:
        op.add_column('projects', sa.Column('agent_analytics', sa.Boolean(), nullable=True, server_default='false'))
        
    if 'agent_sales' not in existing_columns:
        op.add_column('projects', sa.Column('agent_sales', sa.Boolean(), nullable=True, server_default='false'))
        
    if 'agent_compliance' not in existing_columns:
        op.add_column('projects', sa.Column('agent_compliance', sa.Boolean(), nullable=True, server_default='true'))
        
    if 'agent_config' not in existing_columns:
        op.add_column('projects', sa.Column('agent_config', sa.dialects.postgresql.JSONB(astext_type=sa.Text()), nullable=True))
    
    # Check existing tables
    existing_tables = inspector.get_table_names()
    
    # Create voice_reports table if it doesn't exist
    if 'voice_reports' not in existing_tables:
        op.create_table(
            'voice_reports',
            sa.Column('id', sa.dialects.postgresql.UUID(as_uuid=True), nullable=False),
            sa.Column('project_id', sa.dialects.postgresql.UUID(as_uuid=True), nullable=False),
            sa.Column('submission_id', sa.dialects.postgresql.UUID(as_uuid=True), nullable=True),
            sa.Column('transcript', sa.Text(), nullable=True),
            sa.Column('sentiment_analysis', sa.dialects.postgresql.JSONB(astext_type=sa.Text()), nullable=True),
            sa.Column('tone_report', sa.dialects.postgresql.JSONB(astext_type=sa.Text()), nullable=True),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
            sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
            sa.ForeignKeyConstraint(['submission_id'], ['submissions.id'], ondelete='SET NULL'),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_voice_reports_project_id'), 'voice_reports', ['project_id'], unique=False)
        op.create_index(op.f('ix_voice_reports_submission_id'), 'voice_reports', ['submission_id'], unique=False)
    
    # Create analytics_reports table if it doesn't exist
    if 'analytics_reports' not in existing_tables:
        op.create_table(
            'analytics_reports',
            sa.Column('id', sa.dialects.postgresql.UUID(as_uuid=True), nullable=False),
            sa.Column('project_id', sa.dialects.postgresql.UUID(as_uuid=True), nullable=False),
            sa.Column('bi_reasoning', sa.Text(), nullable=True),
            sa.Column('data_insights', sa.dialects.postgresql.JSONB(astext_type=sa.Text()), nullable=True),
            sa.Column('metrics', sa.dialects.postgresql.JSONB(astext_type=sa.Text()), nullable=True),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
            sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_analytics_reports_project_id'), 'analytics_reports', ['project_id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    # Drop tables
    op.drop_index(op.f('ix_analytics_reports_project_id'), table_name='analytics_reports')
    op.drop_table('analytics_reports')
    op.drop_index(op.f('ix_voice_reports_submission_id'), table_name='voice_reports')
    op.drop_index(op.f('ix_voice_reports_project_id'), table_name='voice_reports')
    op.drop_table('voice_reports')
    
    # Drop columns from projects
    op.drop_column('projects', 'agent_config')
    op.drop_column('projects', 'agent_compliance')
    op.drop_column('projects', 'agent_sales')
    op.drop_column('projects', 'agent_analytics')
    op.drop_column('projects', 'agent_voice')

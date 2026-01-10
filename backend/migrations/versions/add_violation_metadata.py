"""add violation_metadata column

Revision ID: add_violation_metadata
Revises: a2cb211cbe7f
Create Date: 2026-01-11

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_violation_metadata'
down_revision = 'a2cb211cbe7f'  # Points to merge_migration_heads
branch_labels = None
depends_on = None


def upgrade():
    # Add violation_metadata column to violations table
    op.add_column('violations', sa.Column(
        'violation_metadata', 
        postgresql.JSONB(astext_type=sa.Text()), 
        nullable=True,
        comment='Flexible metadata for violation context (e.g. specific DOM element attributes)'
    ))


def downgrade():
    op.drop_column('violations', 'violation_metadata')

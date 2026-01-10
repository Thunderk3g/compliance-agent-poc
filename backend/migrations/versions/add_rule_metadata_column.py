"""Add rule_metadata column

Revision ID: add_rule_metadata
Revises: adaptive_phase1
Create Date: 2026-01-11 02:10:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'add_rule_metadata'
down_revision = '5e6f7g8h9i0j'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('rules', sa.Column('rule_metadata', postgresql.JSONB(astext_type=sa.Text()), nullable=True, comment='Flexible metadata for rule context (e.g. source URL, version)'))


def downgrade() -> None:
    op.drop_column('rules', 'rule_metadata')

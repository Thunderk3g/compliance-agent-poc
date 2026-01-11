"""merge add_rule_metadata and add_violation_metadata

Revision ID: merge_heads_20260111
Revises: add_rule_metadata, add_violation_metadata
Create Date: 2026-01-11

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'merge_heads_20260111'
down_revision = ('add_rule_metadata', 'add_violation_metadata')
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass

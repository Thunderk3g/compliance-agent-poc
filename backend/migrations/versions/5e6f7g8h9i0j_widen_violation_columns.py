"""Widen violation columns

Revision ID: 5e6f7g8h9i0j
Revises: 3c4d5e6f7g8h
Create Date: 2026-01-07

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5e6f7g8h9i0j'
down_revision: Union[str, Sequence[str], None] = '3c4d5e6f7g8h'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Widen severity and category columns in violations table
    op.alter_column('violations', 'severity',
               existing_type=sa.String(length=20),
               type_=sa.String(length=50),
               existing_nullable=False)
    op.alter_column('violations', 'category',
               existing_type=sa.String(length=20),
               type_=sa.String(length=50),
               existing_nullable=False)


def downgrade() -> None:
    op.alter_column('violations', 'category',
               existing_type=sa.String(length=50),
               type_=sa.String(length=20),
               existing_nullable=False)
    op.alter_column('violations', 'severity',
               existing_type=sa.String(length=50),
               type_=sa.String(length=20),
               existing_nullable=False)

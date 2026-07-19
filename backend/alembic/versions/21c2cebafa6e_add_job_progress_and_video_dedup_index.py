"""add job progress percent and video youtube_video_id unique index

Revision ID: 21c2cebafa6e
Revises: e244102c03cf
Create Date: 2026-07-19 18:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '21c2cebafa6e'
down_revision: Union[str, Sequence[str], None] = 'e244102c03cf'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('jobs', sa.Column('progress_percent', sa.Integer(), nullable=True))
    op.create_index(op.f('ix_videos_youtube_video_id'), 'videos', ['youtube_video_id'], unique=True)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_videos_youtube_video_id'), table_name='videos')
    op.drop_column('jobs', 'progress_percent')

"""add performance indexes

Revision ID: performance_indexes_001
Revises: ff88359529c3
Create Date: 2025-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'performance_indexes_001'
down_revision = 'ff88359529c3'
branch_labels = None
depends_on = None


def upgrade():
    # Add indexes for rooms table
    op.create_index('idx_room_status', 'rooms', ['status'])
    op.create_index('idx_room_type', 'rooms', ['room_type'])
    op.create_index('idx_room_status_type', 'rooms', ['status', 'room_type'])
    
    # Add indexes for bookings table
    op.create_index('idx_booking_user', 'bookings', ['user_id'])
    op.create_index('idx_booking_room', 'bookings', ['room_id'])
    op.create_index('idx_booking_status', 'bookings', ['status'])
    op.create_index('idx_booking_start_date', 'bookings', ['start_date'])
    op.create_index('idx_booking_user_status', 'bookings', ['user_id', 'status'])
    op.create_index('idx_booking_room_dates', 'bookings', ['room_id', 'start_date', 'end_date'])
    op.create_index('idx_booking_dates', 'bookings', ['start_date', 'end_date'])
    
    # Add indexes for users table
    op.create_index('idx_user_role', 'users', ['role'])
    op.create_index('idx_user_email_role', 'users', ['email', 'role'])


def downgrade():
    # Drop indexes for users table
    op.drop_index('idx_user_email_role', 'users')
    op.drop_index('idx_user_role', 'users')
    
    # Drop indexes for bookings table
    op.drop_index('idx_booking_dates', 'bookings')
    op.drop_index('idx_booking_room_dates', 'bookings')
    op.drop_index('idx_booking_user_status', 'bookings')
    op.drop_index('idx_booking_start_date', 'bookings')
    op.drop_index('idx_booking_status', 'bookings')
    op.drop_index('idx_booking_room', 'bookings')
    op.drop_index('idx_booking_user', 'bookings')
    
    # Drop indexes for rooms table
    op.drop_index('idx_room_status_type', 'rooms')
    op.drop_index('idx_room_type', 'rooms')
    op.drop_index('idx_room_status', 'rooms')

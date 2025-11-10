import uuid
from sqlalchemy import Column, Date, Integer, Enum, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from database import Base  

class Booking(Base):
    __tablename__ = 'bookings'

    booking_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True, nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.user_id'), nullable=False, index=True)
    room_id = Column(UUID(as_uuid=True), ForeignKey('rooms.room_id'), nullable=False, index=True)
    start_date = Column(Date, nullable=False, index=True)
    end_date = Column(Date, nullable=False)
    status = Column(Enum('active', 'completed', 'cancelled', name='booking_status'), default='active', nullable=False, index=True)
    total_price = Column(Integer, nullable=False)

    user = relationship("User", back_populates="bookings", lazy="select")
    room = relationship("Room", back_populates="bookings", lazy="select")

    # Composite indexes for common queries
    __table_args__ = (
        Index('idx_booking_user_status', 'user_id', 'status'),
        Index('idx_booking_room_dates', 'room_id', 'start_date', 'end_date'),
        Index('idx_booking_dates', 'start_date', 'end_date'),
    )

    def __repr__(self):
        return f"<Booking(user_id={self.user_id}, room_id={self.room_id}, status={self.status})>"

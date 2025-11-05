import uuid
from sqlalchemy import Column, Date, Integer, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from database import Base  

class Booking(Base):
    __tablename__ = 'bookings'

    booking_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True, nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.user_id'), nullable=False)
    room_id = Column(UUID(as_uuid=True), ForeignKey('rooms.room_id'), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    status = Column(Enum('active', 'completed', 'cancelled', name='booking_status'), default='active', nullable=False)
    total_price = Column(Integer, nullable=False)

    user = relationship("User", back_populates="bookings")
    room = relationship("Room", back_populates="bookings")

    def __repr__(self):
        return f"<Booking(user_id={self.user_id}, room_id={self.room_id}, status={self.status})>"

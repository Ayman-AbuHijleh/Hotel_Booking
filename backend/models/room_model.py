import uuid
from sqlalchemy import Column, String, Integer, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from database import Base 

class Room(Base):
    __tablename__ = 'rooms'

    room_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True, nullable=False)
    room_number = Column(String(10), unique=True, nullable=False)
    room_type = Column(Enum('Single', 'Double', 'Suite', name='room_types'), nullable=False)
    price_per_night = Column(Integer, nullable=False)
    status = Column(Enum('available', 'booked', name='room_status'), default='available', nullable=False)

    bookings = relationship("Booking", back_populates="room")

    def __repr__(self):
        return f"<Room(room_number={self.room_number}, type={self.room_type})>"

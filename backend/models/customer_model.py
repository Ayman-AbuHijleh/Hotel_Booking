import uuid
from sqlalchemy import Column, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from werkzeug.security import generate_password_hash, check_password_hash
from database import Base  

class Customer(Base):
    __tablename__ = 'customers'

    customer_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, unique=True, nullable=False)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    phone = Column(String(20))
    password = Column(String(255), nullable=False)

    bookings = relationship("Booking", back_populates="customer")

    def set_password(self, password):
       
        self.password = generate_password_hash(password)

    def check_password(self, password):
  
        return check_password_hash(self.password, password)

    def __repr__(self):
        return f"<Customer(name={self.name}, email={self.email})>"

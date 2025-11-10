from flask import jsonify, request, g
from models import Booking as B, Room as R
from database import Session
from schemas import BookingSchema
from marshmallow import ValidationError
from utils import cache, logger
import uuid
from sqlalchemy.orm import joinedload

def existing_booking(booking_id):
    session = Session()
    booking = session.query(B).filter_by(booking_id=booking_id).first()
    session.close()
    return booking is not None

def create_booking():
    session = Session()
    schema = BookingSchema()
    try:
        booking_data = schema.load(request.json)

        existing = session.query(B).filter(
            B.room_id == booking_data['room_id'],
            B.status == 'active',
            B.start_date < booking_data['end_date'],
            B.end_date > booking_data['start_date']
        ).first()

        if existing:
            return jsonify({"message": "Room is already booked for this date range"}), 400
        
        total_price = calculate_total_price(session, booking_data['room_id'],
                                            booking_data['start_date'], booking_data['end_date'])
        if total_price is None:
            return jsonify({"message": "Room not found"}), 404

        new_booking = B(
            user_id=g.current_user.user_id,
            room_id=booking_data['room_id'],
            start_date=booking_data['start_date'],
            end_date=booking_data['end_date'],
            total_price=total_price
        )

        session.add(new_booking)
        session.commit()
        cache.clear()
        logger.info(f"Booking created successfully by user {g.current_user.user_id}")

        return jsonify({
            "message": "Booking created successfully",
            "booking_id": str(new_booking.booking_id)
        }), 201

    except ValidationError as ve:
        return jsonify({"message": "Validation Error", "errors": ve.messages}), 400
    except Exception as e:
        session.rollback()
        logger.error(f"Error creating booking: {str(e)}")
        return jsonify({"message": "Server Error", "error": str(e)}), 500
    finally:
        session.close()

def get_booking(booking_id):
    session = Session()
    try:
        booking = session.query(B).options(
            joinedload(B.room),
            joinedload(B.user)
        ).filter_by(booking_id=booking_id).first()
        
        if not booking:
            return jsonify({"message": "Booking not found"}), 404

        schema = BookingSchema()
        logger.info(f"Booking {booking_id} fetched by user {g.current_user.user_id}")
        return schema.dump(booking), 200

    except Exception as e:
        logger.error(f"Error fetching booking {booking_id}: {str(e)}")
        return jsonify({"message": "Server Error", "error": str(e)}), 500
    finally:
        session.close()

def get_all_bookings():
    session = Session()
    try:
        # Get pagination parameters
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        status = request.args.get('status', None, type=str)
        
        # Limit per_page to prevent abuse
        per_page = min(per_page, 100)
        
        # Build query with eager loading
        query = session.query(B).options(
            joinedload(B.room),
            joinedload(B.user)
        )
        
        # Apply filters
        if status:
            query = query.filter_by(status=status)
        
        # Get total count for pagination info
        total_count = query.count()
        
        # Apply pagination
        offset = (page - 1) * per_page
        bookings = query.offset(offset).limit(per_page).all()
        
        schema = BookingSchema(many=True)
        logger.info(f"Admin fetched bookings (page {page})")
        
        return jsonify({
            "data": schema.dump(bookings),
            "pagination": {
                "page": page,
                "per_page": per_page,
                "total": total_count,
                "pages": (total_count + per_page - 1) // per_page
            }
        }), 200
    except Exception as e:
        logger.error(f"Error fetching all bookings: {str(e)}")
        return jsonify({"message": "Server Error", "error": str(e)}), 500
    finally:
        session.close()

def update_booking(booking_id):
    session = Session()
    try:
        booking = session.query(B).filter_by(booking_id=booking_id).first()
        if not booking:
            return jsonify({"message": "Booking not found"}), 404

        if booking.user_id != g.current_user.user_id and g.current_user.role != 'admin':
            return jsonify({"message": "You are not allowed to update this booking"}), 403

        schema = BookingSchema(partial=True)
        booking_data = schema.load(request.json)

        for key, value in booking_data.items():
            setattr(booking, key, value)

        if any(key in booking_data for key in ['start_date', 'end_date', 'room_id']):
            total_price = calculate_total_price(session, booking.room_id,
                                                booking.start_date, booking.end_date)
            if total_price is None:
                return jsonify({"message": "Room not found"}), 404
            booking.total_price = total_price

        session.commit()
        cache.clear()
        logger.info(f"Booking {booking_id} updated by user {g.current_user.user_id}")
        return jsonify({"message": "Booking updated successfully"}), 200

    except ValidationError as ve:
        session.rollback()
        return jsonify({"message": "Validation Error", "errors": ve.messages}), 400
    except Exception as e:
        session.rollback()
        logger.error(f"Error updating booking {booking_id}: {str(e)}")
        return jsonify({"message": "Server Error", "error": str(e)}), 500
    finally:
        session.close()

def delete_booking(booking_id):
    session = Session()
    try:
        booking = session.query(B).filter_by(booking_id=booking_id).first()
        if not booking:
            return jsonify({"message": "Booking not found"}), 404

        if booking.user_id != g.current_user.user_id and g.current_user.role != 'admin':
            return jsonify({"message": "You are not allowed to delete this booking"}), 403

        session.delete(booking)
        session.commit()
        cache.clear()
        logger.info(f"Booking {booking_id} deleted by user {g.current_user.user_id}")
        return jsonify({"message": "Booking deleted successfully"}), 200

    except Exception as e:
        session.rollback()
        logger.error(f"Error deleting booking {booking_id}: {str(e)}")
        return jsonify({"message": "Server Error", "error": str(e)}), 500
    finally:
        session.close()

def cancel_booking(booking_id):
    session = Session()
    try:
        booking = session.query(B).filter_by(booking_id=booking_id).first()
        if not booking:
            return jsonify({"message": "Booking not found"}), 404

        if booking.user_id != g.current_user.user_id and g.current_user.role != 'admin':
            return jsonify({"message": "You are not allowed to cancel this booking"}), 403

        booking.status = 'cancelled'
        session.commit()
        cache.clear()
        logger.info(f"Booking {booking_id} cancelled by user {g.current_user.user_id}")
        return jsonify({"message": "Booking cancelled successfully"}), 200

    except Exception as e:
        session.rollback()
        logger.error(f"Error cancelling booking {booking_id}: {str(e)}")
        return jsonify({"message": "Server Error", "error": str(e)}), 500
    finally:
        session.close()

def get_user_bookings(user_id):
    session = Session()
    try:
        user_id = uuid.UUID(str(user_id))
    except ValueError:
        return jsonify({"message": "Invalid user ID format"}), 400

    try:
        # Check if the user is accessing their own bookings or is an admin
        if g.current_user.user_id != user_id and g.current_user.role != 'admin':
            return jsonify({"message": "You are not allowed to view these bookings"}), 403

        # Get pagination parameters
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        status = request.args.get('status', None, type=str)
        
        # Limit per_page to prevent abuse
        per_page = min(per_page, 100)
        
        # Build query with eager loading
        query = session.query(B).options(
            joinedload(B.room)
        ).filter_by(user_id=user_id)
        
        # Apply filters
        if status:
            query = query.filter_by(status=status)
        
        # Get total count for pagination info
        total_count = query.count()
        
        # Apply pagination
        offset = (page - 1) * per_page
        bookings = query.offset(offset).limit(per_page).all()
        
        schema = BookingSchema(many=True)
        logger.info(f"User {g.current_user.user_id} fetched bookings for user {user_id} (page {page})")
        
        return jsonify({
            "data": schema.dump(bookings),
            "pagination": {
                "page": page,
                "per_page": per_page,
                "total": total_count,
                "pages": (total_count + per_page - 1) // per_page
            }
        }), 200
    except Exception as e:
        logger.error(f"Error fetching bookings for user {user_id}: {str(e)}")
        return jsonify({"message": "Server Error", "error": str(e)}), 500
    finally:
        session.close()

def calculate_total_price(session, room_id, start_date, end_date):
    room = session.query(R).filter_by(room_id=room_id).first()
    if not room:
        return None
    period = (end_date - start_date).days
    if period <= 0:
        return None
    return period * room.price_per_night

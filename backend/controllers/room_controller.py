from flask import jsonify, request, g
from models import Room as R
from database import Session
from schemas import RoomSchema
from marshmallow import ValidationError
import uuid
from utils import cache, logger

def existing_room(room_number):
    session = Session()
    try:
        room = session.query(R).filter_by(room_number=room_number).first()
        return room is not None
    finally:
        session.close()

def get_all_rooms():
    session = Session()
    try:
        schema = RoomSchema(many=True)
        rooms = session.query(R).all()
        logger.info(f"User {g.current_user.user_id} fetched all rooms")
        return schema.dump(rooms), 200
    except Exception as e:
        logger.error(f"Error fetching all rooms: {str(e)}")
        return jsonify({"message": "Server Error", "error": str(e)}), 500
    finally:
        session.close()

def get_room(room_id):
    session = Session()
    schema = RoomSchema()
    try:
        room_id = uuid.UUID(str(room_id))
    except ValueError:
        return jsonify({"message": "Invalid room ID format"}), 400

    try:
        room = session.query(R).get(room_id)
        if room:
            logger.info(f"User {g.current_user.user_id} fetched room {room_id}")
            return schema.dump(room), 200
        else:
            return jsonify({"message": "Room not found"}), 404
    except Exception as e:
        logger.error(f"Error fetching room {room_id}: {str(e)}")
        return jsonify({"message": "Server Error", "error": str(e)}), 500
    finally:
        session.close()

def create_room():
    session = Session()
    schema = RoomSchema()
    try:
        data = schema.load(request.json)

        if existing_room(data['room_number']):
            return jsonify({"message": "Room number already exists"}), 400

        new_room = R(
            room_number=data['room_number'],
            room_type=data['room_type'],
            price_per_night=data['price_per_night'],
            status=data.get('status', 'available')
        )

        session.add(new_room)
        session.commit()
        cache.clear() 
        logger.info(f"User {g.current_user.user_id} created room {new_room.room_number}")

        return schema.dump(new_room), 201

    except ValidationError as err:
        session.rollback()
        return jsonify(err.messages), 400
    except Exception as e:
        session.rollback()
        logger.error(f"Error creating room: {str(e)}")
        return jsonify({"message": "Server Error", "error": str(e)}), 500
    finally:
        session.close()

def update_room(room_id):
    session = Session()
    schema = RoomSchema(partial=True)
    try:
        room_id = uuid.UUID(str(room_id))
    except ValueError:
        return jsonify({"message": "Invalid room ID format"}), 400

    try:
        room = session.query(R).get(room_id)
        if not room:
            return jsonify({"message": "Room not found"}), 404

        data = schema.load(request.json)
        for key, value in data.items():
            setattr(room, key, value)

        session.commit()
        cache.clear()  
        logger.info(f"User {g.current_user.user_id} updated room {room_id}")

        return schema.dump(room), 200

    except ValidationError as err:
        session.rollback()
        return jsonify(err.messages), 400
    except Exception as e:
        session.rollback()
        logger.error(f"Error updating room {room_id}: {str(e)}")
        return jsonify({"message": "Server Error", "error": str(e)}), 500
    finally:
        session.close()

def delete_room(room_id):
    session = Session()
    try:
        room_id = uuid.UUID(str(room_id))
    except ValueError:
        return jsonify({"message": "Invalid room ID format"}), 400

    try:
        room = session.query(R).get(room_id)
        if not room:
            return jsonify({"message": "Room not found"}), 404

        session.delete(room)
        session.commit()
        cache.clear()  
        logger.info(f"User {g.current_user.user_id} deleted room {room_id}")

        return jsonify({"message": "Room deleted successfully"}), 200

    except Exception as e:
        session.rollback()
        logger.error(f"Error deleting room {room_id}: {str(e)}")
        return jsonify({"message": "Server Error", "error": str(e)}), 500
    finally:
        session.close()

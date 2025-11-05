from flask import jsonify, request,g
from models import Room as R
from database import Session
from schemas import RoomSchema
from marshmallow import ValidationError
import jwt
from datetime import datetime, timedelta
from config import Config
import uuid

session=Session()
def existing_room(room_number):
    room=session.query(R).filter_by(room_number=room_number).first()
    return room is not None

def get_all_rooms():
    schema=RoomSchema(many=True)
    rooms=session.query(R).all()
    return schema.dump(rooms),200

def get_room(room_id):
    schema=RoomSchema()
    try:
      room_id = uuid.UUID(str(room_id))
    except ValueError:
      return jsonify({"message": "Invalid room ID format"}), 400
    room=session.query(R).get(room_id)
    if room:
        return schema.dump(room),200
    else:
        return jsonify({"message":"Room not found"}),404
    
def create_room():
    schema=RoomSchema()
    try:
        data=schema.load(request.json)
        if existing_room(data['room_number']):
            return jsonify({"message":"Room number already exists"}),400
        new_room=R(
            room_number=data['room_number'],
            room_type=data['room_type'],
            price_per_night=data['price_per_night'],
            status=data.get('status','available')
        )
        session.add(new_room)
        session.commit()
        return schema.dump(new_room),201
    except ValidationError as err:
        return jsonify(err.messages),400    

def update_room(room_id):
    schema=RoomSchema(partial=True)
    try:
      room_id = uuid.UUID(str(room_id))
    except ValueError:
      return jsonify({"message": "Invalid room ID format"}), 400
    room=session.query(R).get(room_id)
    if not room:
        return jsonify({"message":"Room not found"}),404
    try:
        data=schema.load(request.json)
        for key, value in data.items():
            setattr(room, key, value)
        session.commit()
        return schema.dump(room),200
    except ValidationError as err:
        return jsonify(err.messages),400    


def delete_room(room_id):
    try:
      room_id = uuid.UUID(str(room_id))
    except ValueError:
      return jsonify({"message": "Invalid room ID format"}), 400
    room=session.query(R).get(room_id)
    if not room:
        return jsonify({"message":"Room not found"}),404
    session.delete(room)
    session.commit()
    return jsonify({"message":"Room deleted successfully"}),200
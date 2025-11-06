from flask import jsonify, request, g
from models import User as U
from database import Session
from schemas import (
    UserRegisterSchema,
    UserLoginSchema,
    UserReadSchema,
    UserUpdateSchema
)
from marshmallow import ValidationError
import jwt
from datetime import datetime, timedelta
from config import Config
import uuid
from utils import cache, logger

def check_existing_user(email):
    session = Session()
    try:
        user = session.query(U).filter_by(email=email).first()
        return user is not None
    finally:
        session.close()

def register_user():
    session = Session()
    schema = UserRegisterSchema()
    try:
        data = schema.load(request.json)

        if check_existing_user(data['email']):
            return jsonify({"message": "Email already registered"}), 400

        new_user = U(
            name=data['name'],
            email=data['email'],
            phone=data.get('phone'),
        )
        new_user.set_password(data['password'])

        session.add(new_user)
        session.commit()
        cache.clear() 
        logger.info(f"User registered: {new_user.email}")

        return jsonify(schema.dump(new_user)), 201

    except ValidationError as err:
        session.rollback()
        return jsonify(err.messages), 400
    except Exception as e:
        session.rollback()
        logger.error(f"Error in user registration: {str(e)}")
        return jsonify({"message": "Server Error", "error": str(e)}), 500
    finally:
        session.close()

def login_user():
    session = Session()
    schema = UserLoginSchema()
    try:
        data = schema.load(request.json)
        user = session.query(U).filter_by(email=data['email']).first()

        if user and user.check_password(data['password']):
            token = jwt.encode({
                "user_id": str(user.user_id),
                "exp": datetime.utcnow() + timedelta(hours=1)
            }, Config.SECRET_KEY, algorithm="HS256")

            logger.info(f"User logged in: {user.email}")
            return jsonify({"message": "Login successful", "token": token}), 200
        else:
            return jsonify({"message": "Invalid email or password"}), 401

    except ValidationError as err:
        return jsonify(err.messages), 400
    except Exception as e:
        logger.error(f"Error in user login: {str(e)}")
        return jsonify({"message": "Server Error", "error": str(e)}), 500
    finally:
        session.close()

def get_user(user_id):
    session = Session()
    schema = UserReadSchema()
    current_user = g.current_user

    try:
        user_id = uuid.UUID(str(user_id))
    except ValueError:
        return jsonify({"message": "Invalid user ID format"}), 400

    if current_user.user_id != user_id:
        return jsonify({"message": "Unauthorized access"}), 403

    try:
        user = session.query(U).get(user_id)
        if user:
            logger.info(f"User {user_id} data retrieved by user {current_user.user_id}")
            return jsonify(schema.dump(user)), 200
        else:
            return jsonify({"message": "User not found"}), 404
    except Exception as e:
        logger.error(f"Error fetching user {user_id}: {str(e)}")
        return jsonify({"message": "Server Error", "error": str(e)}), 500
    finally:
        session.close()

def update_user(user_id):
    session = Session()
    schema = UserUpdateSchema()
    current_user = g.current_user

    try:
        user_id = uuid.UUID(str(user_id))
    except ValueError:
        return jsonify({"message": "Invalid user ID format"}), 400

    if current_user.user_id != user_id:
        return jsonify({"message": "Unauthorized access"}), 403

    try:
        user = session.query(U).get(user_id)
        if not user:
            return jsonify({"message": "User not found"}), 404

        data = schema.load(request.json, partial=True)

        if 'name' in data:
            user.name = data['name']
        if 'phone' in data:
            user.phone = data['phone']
        if 'password' in data:
            user.set_password(data['password'])

        session.commit()
        cache.clear()  
        logger.info(f"User {user_id} updated by user {current_user.user_id}")
        return jsonify(schema.dump(user)), 200

    except ValidationError as err:
        session.rollback()
        return jsonify(err.messages), 400
    except Exception as e:
        session.rollback()
        logger.error(f"Error updating user {user_id}: {str(e)}")
        return jsonify({"message": "Server Error", "error": str(e)}), 500
    finally:
        session.close()

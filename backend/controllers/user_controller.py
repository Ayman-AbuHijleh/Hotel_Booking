from flask import jsonify, request,g
from models import User as U
from database import Session
from schemas import UserRegisterSchema, UserLoginSchema, UserReadSchema, UserUpdateSchema
from marshmallow import ValidationError
import jwt
from datetime import datetime, timedelta
from config import Config
import uuid

session=Session()



def check_existing_user(email):
    user=session.query(U).filter_by(email=email).first()
    return user is not None


def register_user():
     schema=UserRegisterSchema()
     try:
        data=schema.load(request.json)
        if check_existing_user(data['email']):
            return jsonify({"message":"Email already registered"}),400
        new_user=U(name=data['name'],email=data['email'], phone=data.get('phone'),)
        new_user.set_password(data['password'])
        session.add(new_user)
        session.commit()
        return schema.dump(new_user),201    
     except ValidationError as err:
        return jsonify(err.messages),400    


def login_user():
    schema=UserLoginSchema()
    try:
        data=schema.load(request.json)
        user=session.query(U).filter_by(email=data['email']).first()
        if user and user.check_password(data['password']):
             token = jwt.encode({
                "user_id":str( user.user_id),
                "exp": datetime.utcnow() + timedelta(hours=1)  # Token expires in 1 hour
            }, Config.SECRET_KEY, algorithm="HS256")
             return jsonify({"message": "Login successful", "token": token}), 200
        else:
            return jsonify({"message":"Invalid email or password"}),401

    except ValidationError as err:
        return jsonify(err.messages),400
    


def get_user(user_id):
    schema=UserReadSchema()
    current_user=g.current_user
    try:
     user_id = uuid.UUID(str(user_id))
    except ValueError:
      return jsonify({"message": "Invalid user ID format"}), 400
    if current_user.user_id !=user_id :
        return jsonify({"message":"Unauthorized access"}),403
    user=session.query(U).get(user_id)
    if user:
      return jsonify(schema.dump(user)),200
    else:
       return jsonify({"message":"user not found"}),404   
    
def update_user(user_id):
    schema=UserUpdateSchema()
    current_user=g.current_user
    try:
      user_id = uuid.UUID(str(user_id))
    except ValueError:
      return jsonify({"message": "Invalid user ID format"}), 400
    if current_user.user_id !=user_id :
        return jsonify({"message":"Unauthorized access"}),403
    user=session.query(U).get(user_id)
    if not user:
        return jsonify({"message":"user not found"}),404
    try:
        data=schema.load(request.json,partial=True)
        if 'name' in data:
            user.name=data['name']
        if 'phone' in data:
            user.phone=data['phone']
        if 'password' in data:
            user.set_password(data['password'])
        session.commit()
        return jsonify(schema.dump(user)),200
    except ValidationError as err:
        return jsonify(err.messages),400    
    


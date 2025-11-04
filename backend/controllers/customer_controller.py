from flask import jsonify, request,g
from models import Customer as C
from database import Session
from schemas import CustomerRegisterSchema, CustomerLoginSchema, CustomerReadSchema, CustomerUpdateSchema
from marshmallow import ValidationError
import jwt
from datetime import datetime, timedelta
from config import Config
import uuid

session=Session()



def check_existing_customer(email):
    customer=session.query(C).filter_by(email=email).first()
    return customer is not None


def register_customer():
     schema=CustomerRegisterSchema()
     try:
        data=schema.load(request.json)
        if check_existing_customer(data['email']):
            return jsonify({"message":"Email already registered"}),400
        new_customer=C(name=data['name'],email=data['email'], phone=data.get('phone'),)
        new_customer.set_password(data['password'])
        session.add(new_customer)
        session.commit()
        return schema.dump(new_customer),201    
     except ValidationError as err:
        return jsonify(err.messages),400    


def login_customer():
    schema=CustomerLoginSchema()
    try:
        data=schema.load(request.json)
        customer=session.query(C).filter_by(email=data['email']).first()
        if customer and customer.check_password(data['password']):
             token = jwt.encode({
                "customer_id":str( customer.customer_id),
                "exp": datetime.utcnow() + timedelta(hours=1)  # Token expires in 1 hour
            }, Config.SECRET_KEY, algorithm="HS256")
             return jsonify({"message": "Login successful", "token": token}), 200
        else:
            return jsonify({"message":"Invalid email or password"}),401

    except ValidationError as err:
        return jsonify(err.messages),400
    


def get_customer(customer_id):
    schema=CustomerReadSchema()
    current_customer=g.current_customer
    try:
      customer_id = uuid.UUID(str(customer_id))
    except ValueError:
      return jsonify({"message": "Invalid customer ID format"}), 400
    if current_customer.customer_id !=customer_id :
        return jsonify({"message":"Unauthorized access"}),403
    customer=session.query(C).get(customer_id)
    if customer:
      return jsonify(schema.dump(customer)),200
    else:
       return jsonify({"message":"customer not found"}),404   
    
def update_customer(customer_id):
    schema=CustomerUpdateSchema()
    current_customer=g.current_customer
    try:
      customer_id = uuid.UUID(str(customer_id))
    except ValueError:
      return jsonify({"message": "Invalid customer ID format"}), 400
    if current_customer.customer_id !=customer_id :
        return jsonify({"message":"Unauthorized access"}),403
    customer=session.query(C).get(customer_id)
    if not customer:
        return jsonify({"message":"customer not found"}),404
    try:
        data=schema.load(request.json,partial=True)
        if 'name' in data:
            customer.name=data['name']
        if 'phone' in data:
            customer.phone=data['phone']
        if 'password' in data:
            customer.set_password(data['password'])
        session.commit()
        return jsonify(schema.dump(customer)),200
    except ValidationError as err:
        return jsonify(err.messages),400    
    


import uuid
from functools import wraps
from flask import request, jsonify, g
import jwt
from config import Config
from models import Customer
from database import Session

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get("Authorization", None)
        if not token:
            return jsonify({"message": "Token is missing"}), 401

        try:
            parts = token.split()
            if len(parts) != 2 or parts[0].lower() != "bearer":
                return jsonify({"message": "Invalid token header format"}), 401

            token = parts[1]
            data = jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"])
            
 
            try:
                customer_uuid = uuid.UUID(data["customer_id"])
            except (ValueError, AttributeError):
                return jsonify({"message": "Invalid token data"}), 401

        except jwt.ExpiredSignatureError:
            return jsonify({"message": "Token has expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"message": "Token is invalid"}), 401

        session = Session()
        current_customer = session.query(Customer).get(customer_uuid)
        session.close()

        if not current_customer:
            return jsonify({"message": "User not found"}), 401

        g.current_customer = current_customer
        return f(*args, **kwargs)

    return decorated

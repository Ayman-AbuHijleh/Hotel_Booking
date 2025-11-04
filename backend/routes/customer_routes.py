from flask import Blueprint, request, jsonify, g
from controllers import register_customer, login_customer, get_customer, update_customer
from utils import token_required
from utils import cache

customer_bp = Blueprint('user', __name__)


@customer_bp.route('/customer/register', methods=['POST'])
def register_route():
    return register_customer()


@customer_bp.route('/customer/login', methods=['POST'])
def login_route():
    return login_customer()


@customer_bp.route('/customer/<uuid:customer_id>')
@token_required
@cache.cached(timeout=15, key_prefix=lambda: f"user_{g.current_customer.customer_id}")
def get_customer_route(customer_id):
    return get_customer(customer_id)

@customer_bp.route('/customer/update/<uuid:customer_id>',methods=['PUT'])
@token_required
def update_customer_route(customer_id):
    return update_customer(customer_id)
from flask import Blueprint, request, jsonify, g
from controllers import register_user, login_user, get_user, update_user
from utils import token_required
from utils import cache

user_bp = Blueprint('user', __name__)


@user_bp.route('/user/register', methods=['POST'])
def register_route():
    return register_user()


@user_bp.route('/user/login', methods=['POST'])
def login_route():
    return login_user()


@user_bp.route('/user/<uuid:user_id>')
@token_required
@cache.cached(timeout=15, key_prefix=lambda: f"user_{g.current_user.user_id}")
def get_user_route(user_id):
    return get_user(user_id)

@user_bp.route('/user/update/<uuid:user_id>',methods=['PUT'])
@token_required
def update_user_route(user_id):
    return update_user(user_id)
from flask import Blueprint, request, jsonify, g
from controllers import get_all_rooms, get_room, create_room, update_room, delete_room
from utils import token_required, admin_required, limiter, cache

room_bp = Blueprint('room', __name__)

@room_bp.route('/rooms')
@token_required
@cache.cached(timeout=15, key_prefix=lambda: f"user_{g.current_user.user_id}_rooms")
@limiter.limit("10 per hour")
def get_all_rooms_route():
    return get_all_rooms()

@room_bp.route('/room/<uuid:room_id>')
@token_required
@cache.cached(timeout=15, key_prefix=lambda: f"user_{g.current_user.user_id}_room_{request.view_args.get('room_id')}")
@limiter.limit("10 per hour")
def get_room_route(room_id):
    return get_room(room_id)

@room_bp.route('/room', methods=['POST'])
@token_required
@admin_required
@limiter.exempt
def create_room_route():
    return create_room()    

@room_bp.route('/room/<uuid:room_id>', methods=['PUT'])
@token_required
@admin_required
@limiter.exempt
def update_room_route(room_id):
    return update_room(room_id)

@room_bp.route('/room/<uuid:room_id>', methods=['DELETE'])
@token_required
@admin_required
@limiter.exempt
def delete_room_route(room_id):
    return delete_room(room_id)

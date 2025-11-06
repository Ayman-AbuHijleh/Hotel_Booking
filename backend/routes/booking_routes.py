from flask import Blueprint, request, jsonify, g
from controllers import (
    get_all_bookings, get_booking,
    create_booking, update_booking,
    delete_booking, cancel_booking
)
from utils import token_required, admin_required, cache, limiter

booking_bp = Blueprint('booking', __name__)

@booking_bp.route('/bookings', methods=['GET'])
@token_required
@admin_required
@cache.cached(timeout=20)
def get_all_bookings_route():
    return get_all_bookings()

@booking_bp.route('/booking/<uuid:booking_id>', methods=['GET'])
@token_required
@cache.cached(
    timeout=20,
    key_prefix=lambda: f"user_{g.current_user.user_id}_booking_{request.view_args.get('booking_id')}"
)
def get_booking_route(booking_id):
    return get_booking(booking_id)

@booking_bp.route('/booking', methods=['POST'])
@token_required
@limiter.limit("2/30minutes")
def create_booking_route():
    return create_booking()

@booking_bp.route('/booking/<uuid:booking_id>', methods=['PUT'])
@token_required
@limiter.limit("2/30minutes")
def update_booking_route(booking_id):
    return update_booking(booking_id)

@booking_bp.route('/booking/<uuid:booking_id>', methods=['DELETE'])
@token_required
@limiter.limit("2/30minutes")
def delete_booking_route(booking_id):
    return delete_booking(booking_id)

@booking_bp.route('/booking/<uuid:booking_id>/cancel', methods=['POST'])
@token_required
@limiter.limit("2/30minutes")
 
def cancel_booking_route(booking_id):
    return cancel_booking(booking_id)

from marshmallow import Schema, fields, validate

class BookingSchema(Schema):
    booking_id = fields.UUID(dump_only=True)
    user_id = fields.UUID(required=True)
    room_id = fields.UUID(required=True)
    start_date = fields.Date(required=True)
    end_date = fields.Date(required=True)
    status = fields.Str(
        validate=validate.OneOf(['active', 'completed', 'cancelled']),
        load_default='active'
    )
    total_price = fields.Int(required=True)

    class Meta:
        ordered = True

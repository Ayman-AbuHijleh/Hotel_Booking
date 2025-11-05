from marshmallow import Schema, fields, validate

class RoomSchema(Schema):
    room_id = fields.UUID(dump_only=True)
    room_number = fields.Str(required=True, validate=validate.Length(max=10))
    room_type = fields.Str(required=True, validate=validate.OneOf(['Single', 'Double', 'Suite']))
    price_per_night = fields.Int(required=True)
    status = fields.Str(validate=validate.OneOf(['available', 'booked']), load_default='available')

    class Meta:
        ordered = True

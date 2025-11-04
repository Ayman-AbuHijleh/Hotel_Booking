from marshmallow import Schema, fields, validate, EXCLUDE


class CustomerBaseSchema(Schema):
    customer_id = fields.UUID(dump_only=True)
    name = fields.Str(validate=validate.Length(min=3))
    email = fields.Email()
    phone = fields.Str(validate=validate.Length(min=10, max=15))
    password = fields.Str(validate=validate.Length(min=6))

    class Meta:
        unknown = EXCLUDE
        ordered = True



class CustomerRegisterSchema(CustomerBaseSchema):
    name = fields.Str(required=True, validate=validate.Length(min=3))
    email = fields.Email(required=True)
    phone = fields.Str(required=True, validate=validate.Length(min=10, max=15))
    password = fields.Str(required=True, validate=validate.Length(min=6))


class CustomerLoginSchema(CustomerBaseSchema):
    email = fields.Email(required=True)
    password = fields.Str(required=True, validate=validate.Length(min=6))

    class Meta(CustomerBaseSchema.Meta):
        fields = ("email", "password")


class CustomerReadSchema(CustomerBaseSchema):
    class Meta(CustomerBaseSchema.Meta):
        exclude = ("password",)


# 🔹 Update Schema — كل شيء ما عدا الإيميل
class CustomerUpdateSchema(CustomerBaseSchema):
    email = fields.Email(dump_only=True)




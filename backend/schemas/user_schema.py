from marshmallow import Schema, fields, validate, EXCLUDE


class UserBaseSchema(Schema):
    user_id = fields.UUID(dump_only=True)
    name = fields.Str(validate=validate.Length(min=3))
    email = fields.Email()
    phone = fields.Str(validate=validate.Length(min=10, max=15))
    password = fields.Str(validate=validate.Length(min=6))

    class Meta:
        unknown = EXCLUDE
        ordered = True



class UserRegisterSchema(UserBaseSchema):
    name = fields.Str(required=True, validate=validate.Length(min=3))
    email = fields.Email(required=True)
    phone = fields.Str(required=True, validate=validate.Length(min=10, max=15))
    password = fields.Str(required=True, validate=validate.Length(min=6))


class UserLoginSchema(UserBaseSchema):
    email = fields.Email(required=True)
    password = fields.Str(required=True, validate=validate.Length(min=6))

    class Meta(UserBaseSchema.Meta):
        fields = ("email", "password")


class UserReadSchema(UserBaseSchema):
    class Meta(UserBaseSchema.Meta):
        exclude = ("password",)


# 🔹 Update Schema — كل شيء ما عدا الإيميل
class UserUpdateSchema(UserBaseSchema):
    email = fields.Email(dump_only=True)




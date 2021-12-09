from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.validators import MaxLengthValidator, MinLengthValidator
from django.db import transaction
from rest_framework import serializers

from trcustoms.models import User


class UserSerializer(serializers.ModelSerializer):
    has_picture = serializers.SerializerMethodField(read_only=True)
    old_password = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = (
            "id",
            "username",
            "has_picture",
            "first_name",
            "last_name",
            "email",
            "old_password",
            "password",
            "bio",
            "date_joined",
            "last_login",
            "is_active",
        )

    username = serializers.CharField(
        required=True,
        validators=[
            MinLengthValidator(3),
            MaxLengthValidator(26),
        ],
    )

    email = serializers.EmailField(
        required=True,
        validators=[
            MinLengthValidator(3),
            MaxLengthValidator(64),
        ],
    )

    password = serializers.CharField(write_only=True, required=True)

    first_name = serializers.CharField(
        required=False, validators=[MaxLengthValidator(30)], allow_blank=True
    )
    last_name = serializers.CharField(
        required=False, validators=[MaxLengthValidator(150)], allow_blank=True
    )
    bio = serializers.CharField(
        required=False, validators=[MaxLengthValidator(5000)], allow_blank=True
    )

    def validate_username(self, value):
        if (
            user := User.objects.filter(username=value).first()
        ) and user != self.instance:
            raise serializers.ValidationError(
                "Another account exists with this name."
                if user.is_active
                else (
                    "An account with this name "
                    "is currently awaiting activation."
                )
            )

        return value

    def validate_email(self, value):
        if (
            user := User.objects.filter(email=value).first()
        ) and user != self.instance:
            raise serializers.ValidationError(
                "Another account exists with this email."
                if user.is_active
                else (
                    "An account with this email "
                    "is currently awaiting activation."
                )
            )

        return value

    @transaction.atomic
    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)

        super().update(instance, validated_data)

        if password:
            try:
                validate_password(password, user=instance)
            except ValidationError as ex:
                raise serializers.ValidationError(
                    {"password": list(ex.messages)}
                )

            if not instance.check_password(validated_data["old_password"]):
                raise serializers.ValidationError(
                    {"old_password": "Password does not match."}
                )

        if password:
            instance.set_password(password)
            instance.save()
        return instance

    @transaction.atomic
    def create(self, validated_data):
        user = User(
            username=validated_data["username"],
            first_name=validated_data["first_name"],
            last_name=validated_data["last_name"],
            email=validated_data["email"],
            bio=validated_data["bio"],
            is_active=False,
        )

        try:
            validate_password(validated_data["password"], user=user)
        except ValidationError as ex:
            raise serializers.ValidationError({"password": list(ex.messages)})

        user.set_password(validated_data["password"])
        user.save()

        return user

    def get_has_picture(self, instance: User) -> bool:
        return instance.picture is not None


class UserPictureSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["picture"]

    def validate_picture(self, file):
        max_file_size = 300 * 1024
        if file.size > max_file_size:
            raise serializers.ValidationError(
                f"Maximum allowed size: {max_file_size/1024:.02f} KB"
            )
        return file

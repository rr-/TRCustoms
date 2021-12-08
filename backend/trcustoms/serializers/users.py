from typing import Optional

from django.contrib.auth.password_validation import validate_password
from django.core.validators import MaxLengthValidator, MinLengthValidator
from rest_framework import serializers

from trcustoms.models import User


class UserSerializer(serializers.ModelSerializer):
    avatar_url = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = User
        fields = (
            "username",
            "avatar_url",
            "first_name",
            "last_name",
            "email",
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

    password = serializers.CharField(
        write_only=True, required=True, validators=[validate_password]
    )

    first_name = serializers.CharField(
        required=False, validators=[MaxLengthValidator(30)], allow_null=True
    )
    last_name = serializers.CharField(
        required=False, validators=[MaxLengthValidator(150)], allow_null=True
    )
    bio = serializers.CharField(
        required=False, validators=[MaxLengthValidator(5000)], allow_null=True
    )

    def validate_username(self, value):
        print(value)
        if User.objects.filter(username=value, is_active=False).exists():
            raise serializers.ValidationError(
                "An account with this name is currently awaiting activation."
            )
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError(
                "Another account exists with this name."
            )
        return value

    def validate_email(self, value):
        if User.objects.filter(email=value, is_active=False).exists():
            raise serializers.ValidationError(
                "An account with this email is currently awaiting activation."
            )
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "Another account exists with this email."
            )
        return value

    def create(self, validated_data):
        user = User.objects.create(
            username=validated_data["username"],
            first_name=validated_data["first_name"] or "",
            last_name=validated_data["last_name"] or "",
            email=validated_data["email"],
            bio=validated_data["bio"],
            is_active=False,
        )

        user.set_password(validated_data["password"])
        user.save()

        return user

    def get_avatar_url(self, instance: User) -> Optional[str]:
        if not instance.avatar:
            return None
        return instance.avatar.url

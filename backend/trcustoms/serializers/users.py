"""User serializers."""
from django.contrib.auth.password_validation import validate_password
from django.core.validators import MaxLengthValidator, MinLengthValidator
from rest_framework import serializers
from rest_framework.validators import UniqueValidator

from trcustoms.models import User


class UserSerializer(serializers.ModelSerializer):
    """Main user serializer."""

    class Meta:
        """Serializer settings."""

        model = User
        fields = (
            "username",
            "first_name",
            "last_name",
            "email",
            "password",
            "bio",
        )

    username = serializers.CharField(
        required=True,
        validators=[
            MinLengthValidator(3),
            MaxLengthValidator(26),
            UniqueValidator(queryset=User.objects.all()),
        ],
    )

    email = serializers.EmailField(
        required=True,
        validators=[
            MinLengthValidator(3),
            MaxLengthValidator(64),
            UniqueValidator(queryset=User.objects.all()),
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

    def create(self, validated_data):
        """Create user account."""

        user = User.objects.create(
            username=validated_data["username"],
            first_name=validated_data["first_name"] or "",
            last_name=validated_data["last_name"] or "",
            email=validated_data["email"],
            bio=validated_data["bio"],
        )

        user.set_password(validated_data["password"])
        user.save()

        return user

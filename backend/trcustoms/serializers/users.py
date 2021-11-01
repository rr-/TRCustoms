"""User serializers."""
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.validators import MaxLengthValidator, MinLengthValidator
from rest_framework import serializers
from rest_framework.validators import UniqueValidator


class UserSerializer(serializers.ModelSerializer):
    """Main user serializer."""

    class Meta:
        """Serializer settings."""

        model = User
        fields = (
            "username",
            "password",
            "email",
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

    def create(self, validated_data):
        """Create user account."""

        user = User.objects.create(
            username=validated_data["username"],
            email=validated_data["email"],
        )

        user.set_password(validated_data["password"])
        user.save()

        return user

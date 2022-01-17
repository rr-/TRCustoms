from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.validators import MaxLengthValidator, MinLengthValidator
from django.db import transaction
from rest_framework import serializers

from trcustoms.models import UploadedFile, User


class UserLiteSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name"]


class UserSerializer(serializers.ModelSerializer):
    has_picture = serializers.SerializerMethodField(read_only=True)
    old_password = serializers.CharField(write_only=True, required=False)
    authored_level_count = serializers.SerializerMethodField(read_only=True)
    reviewed_level_count = serializers.SerializerMethodField(read_only=True)

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
            "authored_level_count",
            "reviewed_level_count",
            "picture",
            "permissions",
            "trle_reviewer_id",
            "trle_author_id",
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
            (user := User.objects.filter(username__iexact=value).first())
            and user != self.instance
            and user.source == User.Source.trcustoms
        ):
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
            user := User.objects.filter(email__iexact=value).first()
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

        if (
            instance.picture
            and instance.picture.upload_type
            != UploadedFile.UploadType.USER_PICTURE
        ):
            raise serializers.ValidationError(
                {"picture": "Invalid upload type."}
            )

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
        user = (
            User.objects.filter(
                username__iexact=validated_data["username"],
                is_active=False,
            )
            .exclude(source=User.Source.trcustoms)
            .first()
        )

        if not user:
            user = User(
                username=validated_data["username"],
                source=User.Source.trcustoms,
                is_active=False,
            )

        user.first_name = validated_data.get("first_name") or ""
        user.last_name = validated_data.get("last_name") or ""
        user.email = validated_data.get("email") or ""
        user.bio = validated_data.get("bio") or ""

        try:
            validate_password(validated_data["password"], user=user)
        except ValidationError as ex:
            raise serializers.ValidationError({"password": list(ex.messages)})

        user.set_password(validated_data["password"])
        user.save()

        return User.objects.with_counts().get(pk=user.pk)

    def get_has_picture(self, instance: User) -> bool:
        return bool(instance.picture)

    def get_authored_level_count(self, instance: User) -> int:
        return instance.authored_level_count

    def get_reviewed_level_count(self, instance: User) -> int:
        return instance.reviewed_level_count

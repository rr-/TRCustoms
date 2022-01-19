from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.validators import MaxLengthValidator, MinLengthValidator
from django.db import transaction
from rest_framework import serializers

from trcustoms.models import UploadedFile, User
from trcustoms.serializers.uploaded_files import UploadedFileNestedSerializer


class UserNestedSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "first_name", "last_name"]


class UserListingSerializer(serializers.ModelSerializer):
    trle_reviewer_id = serializers.ReadOnlyField()
    trle_author_id = serializers.ReadOnlyField()
    permissions = serializers.ReadOnlyField()
    is_active = serializers.ReadOnlyField()
    picture = UploadedFileNestedSerializer(read_only=True)
    authored_level_count = serializers.SerializerMethodField(read_only=True)
    reviewed_level_count = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "first_name",
            "last_name",
            "email",
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
        ]

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

    first_name = serializers.CharField(
        required=False, validators=[MaxLengthValidator(30)], allow_blank=True
    )
    last_name = serializers.CharField(
        required=False, validators=[MaxLengthValidator(150)], allow_blank=True
    )
    bio = serializers.CharField(
        required=False, validators=[MaxLengthValidator(5000)], allow_blank=True
    )

    def get_authored_level_count(self, instance: User) -> int:
        return instance.authored_level_count

    def get_reviewed_level_count(self, instance: User) -> int:
        return instance.reviewed_level_count


class UserDetailsSerializer(UserListingSerializer):
    old_password = serializers.CharField(write_only=True, required=False)
    password = serializers.CharField(write_only=True, required=True)

    picture_id = serializers.PrimaryKeyRelatedField(
        write_only=True,
        required=False,
        allow_null=True,
        source="picture",
        queryset=UploadedFile.objects.filter(
            upload_type=UploadedFile.UploadType.USER_PICTURE
        ),
    )

    def validate_username(self, value):
        if (
            user := User.objects.filter(username__iexact=value).first()
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

    def validate_password(self, value):
        try:
            validate_password(value, user=self.instance)
        except ValidationError as ex:
            raise serializers.ValidationError(list(ex.messages))
        return value

    def validate(self, data):
        validated_data = super().validate(data)

        if (
            validated_data.get("password")
            and self.instance
            and not self.instance.check_password(
                validated_data.get("old_password")
            )
            and (
                self.instance.is_active
                or self.instance.source != User.Source.trle
            )
        ):
            raise serializers.ValidationError(
                {"old_password": "Password does not match."}
            )

        return validated_data

    @transaction.atomic
    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)

        instance = super().update(instance, validated_data)

        if password:
            instance.set_password(password)
            instance.save()

        return User.objects.with_counts().get(pk=instance.pk)

    @transaction.atomic
    def create(self, validated_data):
        password = validated_data.pop("password", None)

        instance = super().create(validated_data)

        if password:
            instance.set_password(password)
        instance.is_active = False
        instance.save()

        return User.objects.with_counts().get(pk=instance.pk)

    class Meta:
        model = User
        fields = UserListingSerializer.Meta.fields + [
            "old_password",
            "password",
            "picture_id",
        ]

from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.validators import MaxLengthValidator, MinLengthValidator
from django.db import transaction
from django.utils import timezone
from rest_framework import serializers
from rest_framework_simplejwt.exceptions import TokenError

from trcustoms.awards.serializers import UserAwardSerializer
from trcustoms.common.fields import CustomCharField
from trcustoms.common.models import Country
from trcustoms.common.serializers import CountryNestedSerializer
from trcustoms.mails import send_email_confirmation_mail
from trcustoms.permissions import get_permissions
from trcustoms.uploads.consts import UploadType
from trcustoms.uploads.models import UploadedFile
from trcustoms.uploads.serializers import UploadedFileNestedSerializer
from trcustoms.users.consts import UserSource
from trcustoms.users.models import (
    ConfirmEmailToken,
    PasswordResetToken,
    User,
    UserPermission,
)
from trcustoms.users.validators import UsernameValidator


class UserNestedSerializer(serializers.ModelSerializer):
    picture = UploadedFileNestedSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "first_name",
            "last_name",
            "picture",
        ]


class UserListingSerializer(serializers.ModelSerializer):
    trle_reviewer_id = serializers.ReadOnlyField()
    trle_author_id = serializers.ReadOnlyField()
    permissions = serializers.SerializerMethodField(read_only=True)
    date_joined = serializers.ReadOnlyField()
    last_login = serializers.ReadOnlyField()
    played_level_count = serializers.ReadOnlyField()
    authored_level_count = serializers.ReadOnlyField()
    authored_walkthrough_count = serializers.ReadOnlyField()
    rated_level_count = serializers.ReadOnlyField()
    reviewed_level_count = serializers.ReadOnlyField()
    is_active = serializers.ReadOnlyField()
    is_pending_activation = serializers.ReadOnlyField()
    picture = UploadedFileNestedSerializer(read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "first_name",
            "last_name",
            "bio",
            "date_joined",
            "last_login",
            "is_active",
            "is_banned",
            "is_pending_activation",
            "played_level_count",
            "authored_level_count",
            "authored_walkthrough_count",
            "rated_level_count",
            "reviewed_level_count",
            "picture",
            "permissions",
            "trle_reviewer_id",
            "trle_author_id",
        ]

    username = CustomCharField(
        required=True,
        validators=[
            UsernameValidator(),
            MinLengthValidator(2),
            MaxLengthValidator(26),
        ],
    )

    first_name = CustomCharField(
        required=False, validators=[MaxLengthValidator(30)], allow_blank=True
    )
    last_name = CustomCharField(
        required=False, validators=[MaxLengthValidator(150)], allow_blank=True
    )
    bio = serializers.CharField(
        required=False, validators=[MaxLengthValidator(5000)], allow_blank=True
    )

    def get_permissions(self, instance: User) -> list[str]:
        return sorted(perm.value for perm in get_permissions(instance))


class CustomEmailField(serializers.EmailField):
    def __init__(self) -> None:
        super().__init__(
            required=True,
            validators=[
                MinLengthValidator(3),
                MaxLengthValidator(64),
            ],
        )

    def get_attribute(self, instance):
        request = self.context.get("request")
        if not request.user:
            return ""
        if (
            not request.user.is_staff
            and request.user.id != instance.id
            and UserPermission.EDIT_USERS not in get_permissions(request.user)
        ):
            return ""
        return instance.email


class UserDetailsSerializer(UserListingSerializer):
    is_superuser = serializers.ReadOnlyField()
    is_staff = serializers.ReadOnlyField()
    country = CountryNestedSerializer(read_only=True)
    old_password = serializers.CharField(write_only=True, required=False)
    password = serializers.CharField(write_only=True, required=True)

    email = CustomEmailField()
    awards = UserAwardSerializer(read_only=True, many=True)

    picture_id = serializers.PrimaryKeyRelatedField(
        write_only=True,
        required=False,
        allow_null=True,
        source="picture",
        queryset=UploadedFile.objects.filter(
            upload_type=UploadType.USER_PICTURE
        ),
    )

    country_code = serializers.SlugRelatedField(
        required=False,
        allow_null=True,
        write_only=True,
        source="country",
        slug_field="code",
        queryset=Country.objects.all(),
    )

    def validate_username(self, value):
        user = User.objects.filter(username__iexact=value).first()
        if user:
            if user != self.instance:
                raise serializers.ValidationError(
                    "Another account exists with this name."
                    if user.is_active
                    else (
                        "An account with this name "
                        "is currently awaiting activation."
                    )
                )

            if user.is_placeholder:
                # don't let people change capitalization for acquired accounts
                return user.username

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

    def validate_donation_url(self, value):
        if not value:
            return value
        if "paypal.com" not in value and "ko-fi.com" not in value:
            raise serializers.ValidationError(
                "Currently, only Paypal and Ko-Fi links are allowed."
            )
        return value

    def validate(self, data):
        validated_data = super().validate(data)
        self._raise_if_password_dont_match(validated_data)
        if self.instance and self.instance.is_placeholder:
            validated_data["is_pending_activation"] = True
        return validated_data

    def _raise_if_password_dont_match(self, validated_data):
        # only validate the password if the user supplied something
        if not validated_data.get("password"):
            return

        # only compare if there is an old password
        if not self.instance:
            return

        # only reject if the passwords are not the same
        if self.instance.check_password(validated_data.get("old_password")):
            return

        # allow wrong password if this is about claming a placeholder account
        if self.instance.is_placeholder:
            return

        raise serializers.ValidationError(
            {"old_password": "Password does not match."}
        )

    @transaction.atomic
    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        old_email = instance.email
        is_acquiring = self.instance.is_placeholder

        instance = super().update(instance, validated_data)

        if password:
            instance.set_password(password)
            instance.save()

        if instance.email != old_email:
            instance.is_email_confirmed = False
            instance.save()
            send_email_confirmation_mail(instance)

        if is_acquiring:
            instance.date_joined = timezone.now()
            instance.save()

        return instance

    @transaction.atomic
    def create(self, validated_data):
        password = validated_data.pop("password", None)

        instance = super().create(validated_data)

        if password:
            instance.set_password(password)
        instance.is_pending_activation = True
        instance.is_active = False
        instance.source = UserSource.trcustoms
        instance.save()

        send_email_confirmation_mail(instance)

        return instance

    class Meta:
        model = User
        fields = UserListingSerializer.Meta.fields + [
            "email",
            "country",
            "country_code",
            "website_url",
            "donation_url",
            "old_password",
            "password",
            "picture_id",
            "is_staff",
            "is_superuser",
            "awards",
        ]


class UserBanSerializer(serializers.Serializer):
    reason = CustomCharField(max_length=500)


class UsernameSerializer(serializers.Serializer):
    username = CustomCharField(max_length=200)


class UserConfirmEmailSerializer(serializers.Serializer):
    token = serializers.CharField()
    token_class = ConfirmEmailToken

    def validate(self, attrs):
        ret = super().validate(attrs)
        try:
            token = self.token_class(attrs["token"])
        except TokenError as ex:
            raise serializers.ValidationError({"detail": str(ex)})
        return {**ret, "token": token}


class UserRequestPasswordResetSerializer(serializers.Serializer):
    email = CustomEmailField()


class UserCompletePasswordResetSerializer(serializers.Serializer):
    password = serializers.CharField(write_only=True, required=True)
    token = serializers.CharField()
    token_class = PasswordResetToken

    def validate(self, attrs):
        ret = super().validate(attrs)
        try:
            token = self.token_class(attrs["token"])
        except TokenError as ex:
            raise serializers.ValidationError({"detail": str(ex)})
        return {**ret, "token": token}

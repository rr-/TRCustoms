import factory

from trcustoms.users.models import User


class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User
        django_get_or_create = ("username",)

    username = "john_doe"
    email = "jdoe@example.com"
    password = factory.PostGenerationMethodCall("set_password", "1234")
    source = "trcustoms"
    is_email_confirmed = True

import factory

from trcustoms.users.models import User


class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User
        django_get_or_create = ("username",)
        skip_postgeneration_save = True

    username = "john_doe"
    email = "jdoe@example.com"
    source = "trcustoms"
    is_email_confirmed = True

    @factory.post_generation
    def password(self, create, extracted, **kwargs):
        # pylint: disable=no-member
        if create and extracted:
            self.set_password(extracted)
            self.save(update_fields=["password"])

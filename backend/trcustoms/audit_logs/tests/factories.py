import factory
from django.contrib.contenttypes.models import ContentType

from trcustoms.audit_logs.consts import ChangeType
from trcustoms.audit_logs.models import AuditLog
from trcustoms.users.models import User


class AuditLogFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = AuditLog

    object_id = factory.Faker("pystr", max_chars=6)
    object_name = factory.Faker("word")
    object_type = factory.LazyFunction(
        lambda: ContentType.objects.get_for_model(User)
    )
    change_type = ChangeType.CREATE
    change_author = None
    is_action_required = True
    changes = factory.LazyFunction(lambda: ["created"])
    meta = factory.LazyFunction(dict)

import pytest

from trcustoms.audit_logs.consts import ChangeType
from trcustoms.audit_logs.models import AuditLog
from trcustoms.users.logic import confirm_user_email
from trcustoms.users.tests.factories import UserFactory
from trcustoms.users.views import UserViewSet


@pytest.mark.django_db
def test_confirm_inactive_user_email_logs_update_with_email() -> None:
    user = UserFactory(
        is_active=False, is_email_confirmed=False, email="karen@example.com"
    )

    confirm_user_email(user, request=None)

    logs = AuditLog.objects.all()
    assert logs.count() == 1
    audit = logs.first()
    assert audit.change_type == ChangeType.CREATE
    assert audit.is_action_required
    assert audit.changes == ["Created (karen@example.com)"]


@pytest.mark.django_db
def test_confirm_active_user_email_logs_update_with_email() -> None:
    user = UserFactory(
        is_active=True, is_email_confirmed=False, email="karen@example.com"
    )

    confirm_user_email(user, request=None)

    logs = AuditLog.objects.all()
    assert logs.count() == 1
    audit = logs.first()
    assert audit.change_type == ChangeType.UPDATE
    assert not audit.is_action_required
    assert audit.changes == ["Confirmed email (karen@example.com)"]


@pytest.mark.django_db
def test_log_addition_records_created_with_email() -> None:
    user = UserFactory(email="karen@example.com")

    viewset = UserViewSet()
    viewset.log_addition(request=None, obj=user, message="")

    logs = AuditLog.objects.all()
    assert logs.count() == 1
    audit = logs.first()
    assert audit.change_type == ChangeType.CREATE
    assert audit.changes == ["Created (karen@example.com)"]

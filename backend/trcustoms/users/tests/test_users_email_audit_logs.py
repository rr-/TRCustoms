import pytest

from trcustoms.audit_logs.consts import ChangeType
from trcustoms.audit_logs.models import AuditLog
from trcustoms.users.logic import confirm_user_email
from trcustoms.users.tests.factories import UserFactory
from trcustoms.users.views import UserViewSet


@pytest.mark.django_db
def test_confirm_user_email_logs_update_with_email() -> None:
    """Confirming email for an active user should record an audit log update
    with email.
    """
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
    """Admin log_addition should record creation audit log with the user's
    email.
    """
    user = UserFactory(email="karen@example.com")

    # No logs initially
    assert AuditLog.objects.count() == 0

    viewset = UserViewSet()
    viewset.log_addition(request=None, obj=user, message="")

    logs = AuditLog.objects.all()
    assert logs.count() == 1
    audit = logs.first()
    assert audit.change_type == ChangeType.CREATE
    assert audit.changes == ["Created (karen@example.com)"]

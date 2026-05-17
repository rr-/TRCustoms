import pytest
from django.core import mail
from rest_framework import status
from rest_framework.test import APIClient

from trcustoms.audit_logs.consts import ChangeType
from trcustoms.audit_logs.models import AuditLog
from trcustoms.levels.tests.factories import LevelFactory
from trcustoms.reviews.models import Review
from trcustoms.reviews.tests.factories import ReviewFactory
from trcustoms.users.tests.factories import UserFactory


@pytest.mark.django_db
def test_review_deletion_updates_level_review_count(
    staff_api_client: APIClient,
) -> None:
    level = LevelFactory()
    review = ReviewFactory(level=level)

    response = staff_api_client.delete(
        f"/api/reviews/{review.id}/",
        data={"reason": "Off-topic content."},
        format="json",
    )
    level.refresh_from_db()

    assert response.status_code == status.HTTP_204_NO_CONTENT, response.content
    assert level.reviews.count() == 0  # pylint: disable=no-member
    assert level.review_count == 0


@pytest.mark.django_db
def test_review_deletion_updates_position(
    staff_api_client: APIClient,
) -> None:
    level = LevelFactory()
    review1 = ReviewFactory(
        level=level, author=UserFactory(username="foo"), position=1
    )
    review2 = ReviewFactory(
        level=level, author=UserFactory(username="bar"), position=2
    )
    review3 = ReviewFactory(
        level=level, author=UserFactory(username="qux"), position=3
    )
    review1_last_updated = review1.last_updated
    review3_last_updated = review3.last_updated

    staff_api_client.delete(
        f"/api/reviews/{review2.id}/",
        data={"reason": "Duplicate review."},
        format="json",
    )
    review1.refresh_from_db()
    review3.refresh_from_db()

    assert review1.position == 1
    assert review3.position == 2
    assert review1.last_updated == review1_last_updated
    assert review3.last_updated == review3_last_updated
    assert not Review.objects.filter(pk=review2.pk).exists()


@pytest.mark.django_db
def test_review_deletion_requires_reason(
    staff_api_client: APIClient,
) -> None:
    review = ReviewFactory()

    response = staff_api_client.delete(
        f"/api/reviews/{review.id}/",
        data={},
        format="json",
    )

    assert (
        response.status_code == status.HTTP_400_BAD_REQUEST
    ), response.content
    assert Review.objects.filter(pk=review.pk).exists()


@pytest.mark.django_db
def test_review_deletion_sends_reason_email(
    staff_api_client: APIClient,
) -> None:
    review = ReviewFactory(
        author=UserFactory(email="reviewer@example.com", username="reviewer")
    )

    response = staff_api_client.delete(
        f"/api/reviews/{review.id}/",
        data={"reason": "Contains harassment."},
        format="json",
    )

    assert response.status_code == status.HTTP_204_NO_CONTENT, response.content
    assert len(mail.outbox) == 1
    assert mail.outbox[0].subject == "[TRCustoms] Review removed"
    assert mail.outbox[0].to == ["reviewer@example.com"]
    assert "Contains harassment." in mail.outbox[0].body
    assert review.level.name in mail.outbox[0].body


@pytest.mark.django_db
def test_review_deletion_creates_audit_log(
    staff_api_client: APIClient,
) -> None:
    review = ReviewFactory()

    response = staff_api_client.delete(
        f"/api/reviews/{review.id}/",
        data={"reason": "Spam."},
        format="json",
    )

    audit_log = AuditLog.objects.first()

    assert response.status_code == status.HTTP_204_NO_CONTENT, response.content
    assert audit_log
    assert audit_log.change_type == ChangeType.DELETE
    assert audit_log.object_id == str(review.id)
    assert audit_log.object_name == review.level.name

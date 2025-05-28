import threading
from unittest.mock import patch

import pytest
from django.contrib.auth import get_user_model
from django.db import IntegrityError, connections

from trcustoms.awards.logic import update_awards, update_user_award_tier
from trcustoms.awards.models import UserAward
from trcustoms.awards.specs.base import AwardSpec
from trcustoms.users.tests.factories import UserFactory

User = get_user_model()


@pytest.fixture(name="tmp_award_spec")
def fixture_tmp_award_spec() -> AwardSpec:
    tmp_award_spec = AwardSpec(
        code="Dummy",
        tier=0,
        title="Dummy award",
        description="Dummy award",
        guide_description=None,
        can_be_removed=False,
        requirement=lambda user: True,
    )

    # The award catalogue contains *only* our dummy spec.
    with patch("trcustoms.awards.logic.ALL_AWARD_SPECS", [tmp_award_spec]):
        yield tmp_award_spec


@pytest.mark.django_db(transaction=True)
def test_update_awards_race_condition_raises_integrity_error(
    tmp_award_spec: AwardSpec,
) -> None:
    """
    Two simultaneous update_awards() calls race to INSERT the same
    (user, code) row.  By patching the manager so that it *never* falls
    back to UPDATE, the second INSERT violates the UNIQUE(user, code)
    constraint and Django raises IntegrityError.
    """
    # Boiler-plate objects
    user = UserFactory()

    # Fake get_max_eligible_spec so eligibility logic is irrelevant.
    def fake_get_max_eligible_spec(_u, _g):
        return tmp_award_spec.tier, tmp_award_spec

    # Skip the real eligibility helper.
    patch_helper = patch(
        "trcustoms.awards.logic.get_max_eligible_spec",
        fake_get_max_eligible_spec,
    )

    # Force update_or_create() to *always* do a plain INSERT.
    real_create = UserAward.objects.create

    def pure_insert(*, defaults=None, **kwargs):
        # merge kwargs & defaults the way update_or_create would
        params = {**kwargs, **(defaults or {})}
        return real_create(**params), True

    patch_uoc = patch.object(
        UserAward.objects, "update_or_create", pure_insert
    )

    # All patches live for the duration of the race.
    with patch_helper, patch_uoc:
        barrier = threading.Barrier(2)
        errors: list[IntegrityError] = []

        def worker():
            # Each thread needs an independent connection so both commits
            # happen.
            connections.close_all()
            barrier.wait()  # ← *strike together*
            try:
                update_awards(user, update_rarity=False)
            except IntegrityError as exc:
                errors.append(exc)

        t1, t2 = (threading.Thread(target=worker) for _ in range(2))
        t1.start()
        t2.start()
        t1.join()
        t2.join()

    # Assertions
    assert errors, "Expected IntegrityError not raised by the race"
    assert (
        UserAward.objects.filter(user=user, code=tmp_award_spec.code).count()
        == 1
    )


@pytest.mark.django_db
def test_update_user_award_tier_retries_once(
    tmp_award_spec: AwardSpec,
) -> None:
    user = UserFactory()

    # save a handle to the original bound method *before* patching
    real_uoc = UserAward.objects.update_or_create

    def side_effect(*args, **kwargs):
        """Raise on the first call, delegate to the real method afterwards."""
        if not hasattr(side_effect, "called"):
            side_effect.called = True
            raise IntegrityError()
        return real_uoc(*args, **kwargs)

    with patch.object(
        UserAward.objects, "update_or_create", side_effect=side_effect
    ) as mock_uoc:
        update_user_award_tier(user, tmp_award_spec.code, tmp_award_spec)

    # The retry loop should call the method twice …
    assert mock_uoc.call_count == 2
    # … and exactly one award row should exist now.
    assert (
        UserAward.objects.filter(user=user, code=tmp_award_spec.code).count()
        == 1
    )

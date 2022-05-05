import pytest

from trcustoms.conftest import LevelFactory, WalkthroughFactory
from trcustoms.levels.models import Level
from trcustoms.walkthroughs.models import WalkthroughType


@pytest.mark.django_db
class TestVideoOnlyWalkthroughsQueryset:
    def test_no_walkthroughs(self) -> None:
        LevelFactory()
        assert Level.objects.with_video_only_walkthroughs().count() == 0
        assert Level.objects.with_text_only_walkthroughs().count() == 0
        assert Level.objects.with_both_walkthroughs().count() == 0
        assert Level.objects.with_no_walkthroughs().count() == 1

    def test_unapproved_text(self) -> None:
        level = LevelFactory()
        WalkthroughFactory(
            level=level,
            walkthrough_type=WalkthroughType.TEXT,
            is_approved=False,
        )
        assert Level.objects.with_video_only_walkthroughs().count() == 0
        assert Level.objects.with_text_only_walkthroughs().count() == 0
        assert Level.objects.with_both_walkthroughs().count() == 0
        assert Level.objects.with_no_walkthroughs().count() == 1

    def test_unapproved_video(self) -> None:
        level = LevelFactory()
        WalkthroughFactory(
            level=level,
            walkthrough_type=WalkthroughType.LINK,
            is_approved=False,
        )
        assert Level.objects.with_video_only_walkthroughs().count() == 0
        assert Level.objects.with_text_only_walkthroughs().count() == 0
        assert Level.objects.with_both_walkthroughs().count() == 0
        assert Level.objects.with_no_walkthroughs().count() == 1

    def test_approved_text(self) -> None:
        level = LevelFactory()
        WalkthroughFactory(
            level=level,
            walkthrough_type=WalkthroughType.TEXT,
            is_approved=True,
        )
        assert Level.objects.with_video_only_walkthroughs().count() == 0
        assert Level.objects.with_text_only_walkthroughs().count() == 1
        assert Level.objects.with_both_walkthroughs().count() == 0
        assert Level.objects.with_no_walkthroughs().count() == 0

    def test_approved_video(self) -> None:
        level = LevelFactory()
        WalkthroughFactory(
            level=level,
            walkthrough_type=WalkthroughType.LINK,
            is_approved=True,
        )
        assert Level.objects.with_video_only_walkthroughs().count() == 1
        assert Level.objects.with_text_only_walkthroughs().count() == 0
        assert Level.objects.with_both_walkthroughs().count() == 0
        assert Level.objects.with_no_walkthroughs().count() == 0

    def test_approved_text_unapproved_video(self) -> None:
        level = LevelFactory()
        WalkthroughFactory(
            level=level,
            walkthrough_type=WalkthroughType.LINK,
            is_approved=False,
        )
        WalkthroughFactory(
            level=level,
            walkthrough_type=WalkthroughType.TEXT,
            is_approved=True,
        )
        assert Level.objects.with_video_only_walkthroughs().count() == 0
        assert Level.objects.with_text_only_walkthroughs().count() == 1
        assert Level.objects.with_both_walkthroughs().count() == 0
        assert Level.objects.with_no_walkthroughs().count() == 0

    def test_approved_video_unapproved_text(self) -> None:
        level = LevelFactory()
        WalkthroughFactory(
            level=level,
            walkthrough_type=WalkthroughType.LINK,
            is_approved=True,
        )
        WalkthroughFactory(
            level=level,
            walkthrough_type=WalkthroughType.TEXT,
            is_approved=False,
        )
        assert Level.objects.with_video_only_walkthroughs().count() == 1
        assert Level.objects.with_text_only_walkthroughs().count() == 0
        assert Level.objects.with_both_walkthroughs().count() == 0
        assert Level.objects.with_no_walkthroughs().count() == 0

    def test_approved_both(self) -> None:
        level = LevelFactory()
        WalkthroughFactory(
            level=level,
            walkthrough_type=WalkthroughType.LINK,
            is_approved=True,
        )
        WalkthroughFactory(
            level=level,
            walkthrough_type=WalkthroughType.TEXT,
            is_approved=True,
        )
        assert Level.objects.with_video_only_walkthroughs().count() == 0
        assert Level.objects.with_text_only_walkthroughs().count() == 0
        assert Level.objects.with_both_walkthroughs().count() == 1
        assert Level.objects.with_no_walkthroughs().count() == 0
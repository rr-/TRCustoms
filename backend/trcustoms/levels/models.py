from django.db import models
from django.db.models import F, UniqueConstraint, Value
from django.db.models.functions import Coalesce, Lower

from trcustoms.audit_logs import registry
from trcustoms.common.models import DatesInfo, RatingClass
from trcustoms.engines.models import Engine
from trcustoms.genres.models import Genre
from trcustoms.tags.models import Tag
from trcustoms.uploads.models import UploadedFile
from trcustoms.users.models import User
from trcustoms.walkthroughs.consts import WalkthroughStatus, WalkthroughType


@registry.register_model(name_getter=lambda instance: instance.name)
class LevelDuration(DatesInfo):
    name = models.CharField(max_length=100)
    position = models.IntegerField()

    class Meta:
        ordering = ["position"]
        constraints = [
            UniqueConstraint(Lower("name"), name="duration_name_unique"),
        ]
        default_permissions = []

    def __str__(self) -> str:
        return f"{self.name} (id={self.pk})"


@registry.register_model(name_getter=lambda instance: instance.name)
class LevelDifficulty(DatesInfo):
    name = models.CharField(max_length=100)
    position = models.IntegerField()

    class Meta:
        verbose_name_plural = "Level difficulties"
        ordering = ["position"]
        constraints = [
            UniqueConstraint(Lower("name"), name="difficulty_name_unique"),
        ]
        default_permissions = []

    def __str__(self) -> str:
        return f"{self.name} (id={self.pk})"


class LevelQuerySet(models.QuerySet):
    def downloadable(self) -> models.QuerySet:
        return self.filter(is_approved=True).exclude(files__isnull=True)

    def with_rating_values(self) -> models.QuerySet:
        return self.annotate(
            rating_value=Coalesce(
                F("rating_class__position"),
                Value(-0.5),
                output_field=models.FloatField(),
            )
        )

    def with_video_only_walkthroughs(self) -> models.QuerySet:
        return self.filter(
            walkthroughs__walkthrough_type=WalkthroughType.LINK,
            walkthroughs__status=WalkthroughStatus.APPROVED,
        ).exclude(
            id__in=Level.objects.filter(
                walkthroughs__walkthrough_type=WalkthroughType.TEXT,
                walkthroughs__status=WalkthroughStatus.APPROVED,
            )
        )

    def with_text_only_walkthroughs(self) -> models.QuerySet:
        return self.filter(
            walkthroughs__walkthrough_type=WalkthroughType.TEXT,
            walkthroughs__status=WalkthroughStatus.APPROVED,
        ).exclude(
            id__in=Level.objects.filter(
                walkthroughs__walkthrough_type=WalkthroughType.LINK,
                walkthroughs__status=WalkthroughStatus.APPROVED,
            )
        )

    def with_both_walkthroughs(self) -> models.QuerySet:
        return self.filter(
            walkthroughs__walkthrough_type=WalkthroughType.TEXT,
            walkthroughs__status=WalkthroughStatus.APPROVED,
        ).filter(
            walkthroughs__walkthrough_type=WalkthroughType.LINK,
            walkthroughs__status=WalkthroughStatus.APPROVED,
        )

    def with_no_walkthroughs(self) -> models.QuerySet:
        return self.exclude(walkthroughs__status=WalkthroughStatus.APPROVED)


@registry.register_model(name_getter=lambda instance: instance.name)
class Level(DatesInfo):
    objects = LevelQuerySet.as_manager()
    name = models.CharField(max_length=100)
    description = models.TextField(max_length=5000, null=True, blank=True)
    genres = models.ManyToManyField(Genre)
    tags = models.ManyToManyField(Tag, blank=True)
    engine = models.ForeignKey(Engine, on_delete=models.PROTECT)
    uploader = models.ForeignKey(
        User,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="uploaded_levels",
    )
    authors = models.ManyToManyField(User, related_name="authored_levels")
    trle_id = models.IntegerField(blank=True, null=True)

    difficulty = models.ForeignKey(
        LevelDifficulty, blank=True, null=True, on_delete=models.SET_NULL
    )
    duration = models.ForeignKey(
        LevelDuration, blank=True, null=True, on_delete=models.SET_NULL
    )

    cover = models.ForeignKey(
        UploadedFile, blank=True, null=True, on_delete=models.SET_NULL
    )

    is_pending_approval = models.BooleanField(default=True)
    is_approved = models.BooleanField(default=False)
    rejection_reason = models.CharField(max_length=500, null=True, blank=True)

    rating_class = models.ForeignKey(
        RatingClass, blank=True, null=True, on_delete=models.SET_NULL
    )

    # denormalized fields for faster db lookups
    review_count = models.PositiveIntegerField(default=0)
    download_count = models.IntegerField(default=0)
    last_file = models.OneToOneField(
        "LevelFile",
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name="+",
    )

    class Meta:
        ordering = ["-created"]
        default_permissions = []

    def __str__(self) -> str:
        return f"{self.name} (id={self.pk})"

    def update_review_count(self) -> None:
        review_count = self.reviews.count()
        if review_count != self.review_count:
            self.review_count = review_count
            self.save(update_fields=["review_count"])

    def update_download_count(self) -> None:
        download_count = sum(
            list(self.files.values_list("download_count", flat=True)) + [0]
        )
        if download_count != self.download_count:
            self.download_count = download_count
            self.save(update_fields=["download_count"])

    def update_last_file(self) -> None:
        last_file = self.files.active().order_by("-version").first()
        if last_file != self.last_file:
            self.last_file = last_file
            self.save()


class LevelScreenshot(DatesInfo):
    level = models.ForeignKey(
        Level, on_delete=models.CASCADE, related_name="screenshots"
    )

    file = models.ForeignKey(
        UploadedFile, blank=True, null=True, on_delete=models.SET_NULL
    )
    position = models.IntegerField(default=1)

    class Meta:
        ordering = ["position"]
        default_permissions = []

    def __str__(self) -> str:
        return f"{self.level.name} (screenshot id={self.pk})"


class LevelFileQuerySet(models.QuerySet):
    def active(self):
        return self.filter(is_active=True)


class LevelFile(DatesInfo):
    objects = LevelFileQuerySet.as_manager()

    level = models.ForeignKey(
        Level, on_delete=models.CASCADE, related_name="files"
    )

    file = models.ForeignKey(
        UploadedFile, blank=True, null=True, on_delete=models.SET_NULL
    )

    is_active = models.BooleanField(default=True)
    version = models.IntegerField()
    download_count = models.IntegerField(default=0)

    class Meta:
        ordering = ["version"]
        constraints = [
            UniqueConstraint(
                "level", "version", name="level_file_version_unique"
            ),
        ]
        default_permissions = []

    def __str__(self) -> str:
        return f"{self.level.name} (file id={self.pk})"


class LevelExternalLink(DatesInfo):
    class LinkType(models.TextChoices):
        SHOWCASE = ("sh", "Showcase")
        MAIN = ("ma", "Main")

    level = models.ForeignKey(
        Level, on_delete=models.CASCADE, related_name="external_links"
    )
    url = models.URLField(max_length=256)
    position = models.IntegerField()
    link_type = models.CharField(
        choices=LinkType.choices,
        max_length=2,
    )

    class Meta:
        ordering = ["level", "position"]
        constraints = [
            UniqueConstraint(
                "level", Lower("url"), name="level_external_link_unique"
            ),
        ]
        default_permissions = []

    def __str__(self) -> str:
        return f"{self.url} (level_id={self.level.pk})"


class FeaturedLevel(DatesInfo):
    class FeatureType(models.TextChoices):
        NEW_RELEASE = ("new", "New release")
        MONTHLY_HIDDEN_GEM = ("gem", "Monthly hidden gem")
        LEVEL_OF_THE_DAY = ("lod", "Level of the day")
        BEST_IN_GENRE = ("big", "Best in genre")

    class Meta:
        default_permissions = []

    level = models.ForeignKey(
        Level, on_delete=models.CASCADE, related_name="+"
    )
    feature_type = models.CharField(choices=FeatureType.choices, max_length=3)

    chosen_genre = models.ForeignKey(
        Genre,
        on_delete=models.CASCADE,
        related_name="+",
        null=True,
        blank=True,
    )

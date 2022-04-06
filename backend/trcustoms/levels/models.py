from django.db import models
from django.db.models import UniqueConstraint
from django.db.models.functions import Lower

from trcustoms.audit_logs import registry
from trcustoms.common.models import DatesInfo, RatingClass
from trcustoms.engines.models import Engine
from trcustoms.genres.models import Genre
from trcustoms.tags.models import Tag
from trcustoms.uploads.models import UploadedFile
from trcustoms.users.models import User


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


@registry.register_model(name_getter=lambda instance: instance.name)
class Level(DatesInfo):
    name = models.CharField(max_length=100)
    description = models.TextField(max_length=5000, null=True, blank=True)
    genres = models.ManyToManyField(Genre)
    tags = models.ManyToManyField(Tag)
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
    rejection_reason = models.CharField(max_length=200, null=True, blank=True)

    rating_class = models.ForeignKey(
        RatingClass, blank=True, null=True, on_delete=models.SET_NULL
    )

    # denormalized fields for faster db lookups
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

    def update_download_count(self) -> None:
        download_count = max(
            self.files.values_list("download_count", flat=True)
        )
        if download_count != self.download_count:
            self.download_count = download_count
            self.save(update_fields=["download_count"])

    def update_last_file(self) -> None:
        last_file = self.files.order_by("-version").first()
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


class LevelFile(DatesInfo):
    level = models.ForeignKey(
        Level, on_delete=models.CASCADE, related_name="files"
    )

    file = models.ForeignKey(
        UploadedFile, blank=True, null=True, on_delete=models.SET_NULL
    )

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

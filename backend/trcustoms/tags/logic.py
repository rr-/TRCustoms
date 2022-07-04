from rest_framework.request import Request

from trcustoms.audit_logs.utils import track_model_update
from trcustoms.levels.models import Level
from trcustoms.tags.models import Tag


def split_tag(
    source: str, targets: list[str], request: Request | None
) -> None:
    source_tag = Tag.objects.get(name=source)
    with track_model_update(
        obj=source_tag,
        request=request,
        changes=[f"Split to {', '.join(targets)}"],
    ):
        existing_tags = Tag.objects.filter(name__in=targets)
        missing_tags = [
            Tag(name=name)
            for name in targets
            if name not in set(tag.name for tag in existing_tags)
        ]
        Tag.objects.bulk_create(missing_tags)

        target_tags = Tag.objects.filter(name__in=targets)
        for level in Level.objects.filter(tags__name=source).iterator():
            for target_tag in target_tags:
                level.tags.add(target_tag)


def merge_tags(source: str, target: str, request: Request | None) -> None:
    source_tag = Tag.objects.get(name=source)
    target_tag = Tag.objects.get(name=target)
    with track_model_update(
        obj=source_tag,
        request=request,
        changes=[f"Merged to {target_tag.name}"],
    ):
        levels = (
            Level.objects.filter(tags=source_tag)
            .exclude(tags=target_tag)
            .values("id")
        )
        through_model_cls = Level.tags.through
        through_model_cls.objects.bulk_create(
            [
                through_model_cls(level_id=level["id"], tag_id=target_tag.pk)
                for level in levels
            ]
        )
    source_tag.delete()

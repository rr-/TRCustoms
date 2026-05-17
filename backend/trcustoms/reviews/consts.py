from django.db import models


class ReviewType(models.TextChoices):
    TRLE = ("le", "Legacy (TRLE.net)")
    TRC = ("mo", "Modern (TRCustoms)")


class ReviewVoteType(models.IntegerChoices):
    DOWNVOTE = (-1, "Downvote")
    UPVOTE = (1, "Upvote")

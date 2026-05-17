from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("reviews", "0008_alter_review_last_user_content_updated"),
    ]

    operations = [
        migrations.AddField(
            model_name="review",
            name="downvote_count",
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AddField(
            model_name="review",
            name="upvote_count",
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.CreateModel(
            name="ReviewVote",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "created",
                    models.DateTimeField(auto_now_add=True, null=True),
                ),
                (
                    "last_updated",
                    models.DateTimeField(
                        auto_now=True,
                        db_index=True,
                        null=True,
                    ),
                ),
                (
                    "vote",
                    models.IntegerField(
                        choices=[(-1, "Downvote"), (1, "Upvote")]
                    ),
                ),
                (
                    "review",
                    models.ForeignKey(
                        on_delete=models.deletion.CASCADE,
                        related_name="votes",
                        to="reviews.review",
                    ),
                ),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=models.deletion.CASCADE,
                        related_name="review_votes",
                        to="users.user",
                    ),
                ),
            ],
            options={"default_permissions": []},
        ),
        migrations.AddConstraint(
            model_name="reviewvote",
            constraint=models.UniqueConstraint(
                fields=("review", "user"),
                name="review_vote_review_user_unique",
            ),
        ),
    ]

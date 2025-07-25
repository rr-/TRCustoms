# Generated by Django 4.2.3 on 2024-11-15 11:35

from contextlib import contextmanager

from django.db import migrations


@contextmanager
def suppress_auto_now(model, field_names):
    fields_state = {}
    for field_name in field_names:
        field = model._meta.get_field(field_name)
        fields_state[field] = {
            "auto_now": field.auto_now,
            "auto_now_add": field.auto_now_add,
        }

    for field in fields_state:
        field.auto_now = False
        field.auto_now_add = False
    try:
        yield
    finally:
        for field, state in fields_state.items():
            field.auto_now = state["auto_now"]
            field.auto_now_add = state["auto_now_add"]


def forward_func(apps, schema_editor):
    RatingClass = apps.get_model("common", "RatingClass")
    ReviewTemplateQuestion = apps.get_model(
        "reviews", "ReviewTemplateQuestion"
    )
    RatingTemplateQuestion = apps.get_model(
        "ratings", "RatingTemplateQuestion"
    )
    ReviewTemplateAnswer = apps.get_model("reviews", "ReviewTemplateAnswer")
    RatingTemplateAnswer = apps.get_model("ratings", "RatingTemplateAnswer")
    Review = apps.get_model("reviews", "Review")
    Rating = apps.get_model("ratings", "Rating")

    # Update rating classes
    RatingClass.objects.filter(target="re").update(target="ra")

    # Move review data to ratings.
    # Create mapping for questions and answers
    print("Mapping and creating templates")
    question_mapping = {}
    for question in ReviewTemplateQuestion.objects.all():
        new_question = RatingTemplateQuestion.objects.create(
            id=question.id,
            position=question.position,
            weight=question.weight,
            question_text=question.question_text,
            created=question.created,
            last_updated=question.last_updated,
        )
        question_mapping[question.id] = new_question

    answer_mapping = {}
    for answer in ReviewTemplateAnswer.objects.all():
        new_answer = RatingTemplateAnswer.objects.create(
            id=answer.id,
            question=question_mapping[answer.question_id],
            position=answer.position,
            points=answer.points,
            answer_text=answer.answer_text,
            created=answer.created,
            last_updated=answer.last_updated,
        )
        answer_mapping[answer.id] = new_answer

    print("Mapping reviews")
    # Collect Rating instances to be created
    rating_instances = []
    for review in Review.objects.all():
        rating_instances.append(
            Rating(
                id=review.id,
                position=review.position,
                level_id=review.level_id,
                author_id=review.author_id,
                rating_type=review.review_type,
                trle_score_gameplay=review.trle_rating_gameplay,
                trle_score_enemies=review.trle_rating_enemies,
                trle_score_atmosphere=review.trle_rating_atmosphere,
                trle_score_lighting=review.trle_rating_lighting,
                rating_class_id=review.rating_class_id,
                created=review.created,
                last_updated=review.last_updated,
                last_user_content_updated=review.last_user_content_updated,
            )
        )

    # Bulk create Ratings
    print("Creating reviews")
    with suppress_auto_now(Rating, ["created", "last_updated"]):
        Rating.objects.bulk_create(rating_instances)

    # Set many-to-many relations for answers
    print("Mapping answers")
    through_model = Rating.answers.through
    m2m_relations = []
    for review in Review.objects.prefetch_related("answers").iterator():
        new_rating_id = review.id
        for answer in review.answers.iterator():
            m2m_relations.append(
                through_model(
                    rating_id=new_rating_id,
                    ratingtemplateanswer_id=answer_mapping[answer.id].id,
                )
            )

    # Bulk create the many-to-many relationships
    print("Creating answers")
    through_model.objects.bulk_create(m2m_relations)


def reverse_func(apps, schema_editor):
    RatingClass = apps.get_model("common", "RatingClass")
    RatingTemplateQuestion = apps.get_model(
        "ratings", "RatingTemplateQuestion"
    )
    RatingTemplateAnswer = apps.get_model("ratings", "RatingTemplateAnswer")
    Rating = apps.get_model("ratings", "Rating")

    RatingTemplateAnswer.objects.all().delete()
    RatingTemplateQuestion.objects.all().delete()
    Rating.objects.all().delete()

    RatingClass.objects.filter(target="ra").update(target="re")


class Migration(migrations.Migration):
    dependencies = [
        ("ratings", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(forward_func, reverse_func),
    ]

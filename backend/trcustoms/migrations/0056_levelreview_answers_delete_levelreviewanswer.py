# Generated by Django 4.0 on 2022-01-27 14:39

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("trcustoms", "0055_alter_reviewtemplateanswer_options_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="levelreview",
            name="answers",
            field=models.ManyToManyField(
                related_name="+", to="trcustoms.ReviewTemplateAnswer"
            ),
        ),
        migrations.DeleteModel(
            name="LevelReviewAnswer",
        ),
    ]
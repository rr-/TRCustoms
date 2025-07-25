# Generated by Django 4.2.3 on 2024-11-15 12:11

from django.db import migrations


class Migration(migrations.Migration):
    dependencies = [
        ("users", "0015_user_rated_level_count"),
    ]

    operations = [
        migrations.AlterModelOptions(
            name="user",
            options={
                "default_permissions": [],
                "permissions": [
                    ("delete_levels", "Can delete levels"),
                    ("delete_reviews", "Can delete reviews"),
                    ("delete_ratings", "Can delete ratings"),
                    ("delete_walkthroughs", "Can delete walkthroughs"),
                    ("edit_levels", "Can edit levels"),
                    ("edit_reviews", "Can edit reviews"),
                    ("edit_ratings", "Can edit ratings"),
                    ("edit_walkthroughs", "Can edit walkthroughs"),
                    ("edit_tags", "Can edit tags"),
                    ("edit_news", "Can edit news"),
                    ("edit_users", "Can edit users"),
                    ("manage_users", "Can manage users"),
                    ("list_users", "Can list users"),
                    ("view_users", "Can view users"),
                    ("review_audit_logs", "Can review audit logs"),
                    ("review_levels", "Can review levels"),
                    ("upload_levels", "Can upload levels"),
                    ("post_walkthroughs", "Can post walkthroughs"),
                    ("edit_playlists", "Can edit playlists"),
                ],
                "verbose_name": "user",
                "verbose_name_plural": "users",
            },
        ),
    ]

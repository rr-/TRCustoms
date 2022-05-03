# Generated by Django 4.0.2 on 2022-04-30 22:51

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0010_user_authored_walkthrough_count"),
    ]

    operations = [
        migrations.AlterModelOptions(
            name="user",
            options={
                "default_permissions": [],
                "permissions": [
                    ("delete_levels", "Can delete levels"),
                    ("delete_reviews", "Can delete reviews"),
                    ("delete_walkthroughs", "Can delete walkthroughs"),
                    ("edit_levels", "Can edit levels"),
                    ("edit_reviews", "Can edit reviews"),
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
                ],
                "verbose_name": "user",
                "verbose_name_plural": "users",
            },
        ),
    ]

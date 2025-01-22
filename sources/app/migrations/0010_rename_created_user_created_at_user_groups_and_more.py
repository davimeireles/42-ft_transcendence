# Generated by Django 5.1.5 on 2025-01-22 11:05

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("app", "0009_merge_20250122_1044"),
        ("auth", "0012_alter_user_first_name_max_length"),
    ]

    operations = [
        migrations.RenameField(
            model_name="user",
            old_name="created",
            new_name="created_at",
        ),
        migrations.AddField(
            model_name="user",
            name="groups",
            field=models.ManyToManyField(
                blank=True, related_name="custom_user_set", to="auth.group"
            ),
        ),
        migrations.AddField(
            model_name="user",
            name="is_active",
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name="user",
            name="is_staff",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="user",
            name="is_superuser",
            field=models.BooleanField(
                default=False,
                help_text="Designates that this user has all permissions without explicitly assigning them.",
                verbose_name="superuser status",
            ),
        ),
        migrations.AddField(
            model_name="user",
            name="last_login",
            field=models.DateTimeField(
                blank=True, null=True, verbose_name="last login"
            ),
        ),
        migrations.AddField(
            model_name="user",
            name="updated_at",
            field=models.DateTimeField(auto_now=True),
        ),
        migrations.AddField(
            model_name="user",
            name="user_permissions",
            field=models.ManyToManyField(
                blank=True, related_name="custom_user_set", to="auth.permission"
            ),
        ),
    ]
# Generated by Django 5.1.5 on 2025-01-21 16:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("app", "0006_user_photo"),
    ]

    operations = [
        migrations.AlterField(
            model_name="user",
            name="photo",
            field=models.ImageField(default="photos/default.jpg", upload_to="photos/"),
        ),
    ]

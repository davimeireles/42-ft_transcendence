# Generated by Django 5.1.5 on 2025-01-22 16:17

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("app", "0001_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="user",
            name="nickname",
            field=models.CharField(max_length=128, unique=True),
        ),
        migrations.AlterField(
            model_name="user",
            name="username",
            field=models.CharField(max_length=128, unique=True),
        ),
    ]

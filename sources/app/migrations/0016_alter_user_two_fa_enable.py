# Generated by Django 5.1.5 on 2025-01-27 17:04

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0015_alter_user_two_fa_enable'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='two_fa_enable',
            field=models.BooleanField(default=False),
        ),
    ]

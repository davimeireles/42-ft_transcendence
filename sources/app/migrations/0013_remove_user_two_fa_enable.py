# Generated by Django 5.1.5 on 2025-01-26 18:07

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('app', '0012_user_two_fa_enable'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='user',
            name='two_fa_enable',
        ),
    ]

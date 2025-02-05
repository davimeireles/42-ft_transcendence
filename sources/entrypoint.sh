#!/bin/sh
pyhton manage.py flush
python manage.py makemigrations
python manage.py migrate

echo "from django.contrib.auth import get_user_model; User = get_user_model(); User.objects.create_superuser('admin', 'admin@admin.com', '42Porto!')" | python manage.py shell

exec "$@"
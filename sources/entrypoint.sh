#!/bin/sh
sleep 5
python manage.py makemigrations
python manage.py migrate

echo "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(email='admin@admin.com').exists():
    User.objects.create_superuser('admin', 'admin@admin.com', '42Porto!')
    print('Superuser created.')
else:
    print('Superuser already exists.')
" | python manage.py shell

exec "$@"

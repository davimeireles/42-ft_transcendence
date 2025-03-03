#!/bin/sh
sleep 5
python manage.py makemigrations
python manage.py migrate

echo "
from django.contrib.auth import get_user_model
from app.models import GameType, User

User = get_user_model()

if User.objects.count() == 0:
    User.objects.create_user(username='Player2', password='42Porto!', nickname='player2', email='player2@42porto.com')
    User.objects.create_user(username='EasyAI', password='42Porto!', nickname='EasyAI', email='easyai@42porto.com') 
    User.objects.create_user(username='MediumAI', password='42Porto!', nickname='MediumAI', email='mediumai@42porto.com') 
    User.objects.create_user(username='HardAI', password='42Porto!', nickname='HardAI', email='hardai@42porto.com')
else:
    print('Users already exist.')

if not User.objects.filter(email='admin@admin.com').exists():
    User.objects.create_superuser('admin', 'admin@admin.com', '42Porto!')
    print('Superuser created.')
else:
    print('Superuser already exists.')

if GameType.objects.count() == 0:
    GameType.objects.create(type='localPvP')
    GameType.objects.create(type='localPvAI')
    GameType.objects.create(type='localPvP3D')
    print('GameType table populated.')
else:
    print('GameType table already populated.')

" | python manage.py shell

exec "$@"
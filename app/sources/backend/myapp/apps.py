from django.apps import AppConfig
from django.db.models.signals import post_migrate

class MyappConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'myapp'

    def ready(self):
        post_migrate.connect(inset_initial_data, sender=self)


def inset_initial_data(sender, **kwargs):
    from myapp.models import Games, GameType
    
    Games.objects.get_or_create(name='Pong')
    Games.objects.get_or_create(name='Tetris')
    
    GameType.objects.get_or_create(type='Normal')
    GameType.objects.get_or_create(type='Ranked')
    GameType.objects.get_or_create(type='Tournament')
    GameType.objects.get_or_create(type='Solo')
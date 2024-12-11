# Este arquivo é um ponto de entrada para servidores WSGI compatíveis, como Gunicorn.
# Ele é usado para implantar o projeto Django em um servidor web.

"""
WSGI config for src project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/4.0/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'src.settings')

application = get_wsgi_application()
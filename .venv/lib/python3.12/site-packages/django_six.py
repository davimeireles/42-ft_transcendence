# -*- coding: utf-8 -*-

from optparse import make_option

import django
from django.core.management.base import AppCommand, BaseCommand, CommandError, LabelCommand


# https://github.com/django/django/blob/fc94944183f1f1325824ee0ef1f49d737ec86d4a/django/db/__init__.py#L101-L112
# close_connection is superseded by close_old_connections
# RemovedInDjango18Warning
try:
    from django.db import close_old_connections as close_connection
except ImportError:
    from django.db import close_connection

close_old_connections = close_connection


try:
    from django.utils.deprecation import MiddlewareMixin
except ImportError:
    # Not required for Django <= 1.9, see:
    # https://docs.djangoproject.com/en/1.10/topics/http/middleware/#upgrading-pre-django-1-10-style-middleware
    MiddlewareMixin = object


# ValuesQuerySet and ValuesListQuerySet have been removed.
# https://docs.djangoproject.com/en/1.9/releases/1.9/#miscellaneous
try:
    from django.db.models.query import ValuesQuerySet
    Support_ValuesQuerySet = True
except ImportError:
    ValuesQuerySet = type
    Support_ValuesQuerySet = False
try:
    from django.db.models.query import ValuesListQuerySet
    Support_ValuesListQuerySet = True
except ImportError:
    ValuesListQuerySet = type
    Support_ValuesListQuerySet = False


# https://github.com/django/django/blob/main/docs/releases/4.0.txt#L688
if django.VERSION < (4, 0):
    from django.conf.urls import include, url
    from django.utils.encoding import force_text, smart_text
    from django.utils.translation import ugettext, ugettext_lazy, ugettext_noop, ungettext, ungettext_lazy
    path = re_path = url
    force_str, smart_str = force_text, smart_text
    gettext, gettext_lazy, gettext_noop, ngettext, ngettext_lazy = ugettext, ugettext_lazy, ugettext_noop, ungettext, ungettext_lazy
elif django.VERSION >= (4, 0):
    from django.urls import include, path, re_path
    from django.utils.encoding import force_str, smart_str
    from django.utils.translation import gettext, gettext_lazy, gettext_noop, ngettext, ngettext_lazy
    url = re_path
    force_text, smart_text = force_str, smart_str
    ugettext, ugettext_lazy, ugettext_noop, ungettext, ungettext_lazy = gettext, gettext_lazy, gettext_noop, ngettext, ngettext_lazy


# BaseCommand Series
class ProxyParser(object):
    """Faux parser object that will ferry our arguments into options."""

    def __init__(self, command):
        self.command = command

    def add_argument(self, *args, **kwargs):
        self.command.option_list += (make_option(*args, **kwargs), )


class CompatibilityBaseCommand(BaseCommand):
    """Provides a compatibility between optparse and argparse transition.
    Starting in Django 1.8, argparse is used. In Django 1.9, optparse support will be removed.
    For optparse, you append to the option_list class attribute.
    For argparse, you must define add_arguments(self, parser).
    BaseCommand uses the presence of option_list to decide what course to take.
    """

    def __init__(self, *args, **kwargs):
        if django.VERSION < (1, 8) and hasattr(self, 'add_arguments'):
            self.option_list = BaseCommand.option_list
            parser = ProxyParser(self)
            self.add_arguments(parser)
        super(CompatibilityBaseCommand, self).__init__(*args, **kwargs)


class CompatibilityAppCommand(AppCommand, CompatibilityBaseCommand):
    """AppCommand is a BaseCommand sub-class without its own __init__."""


class CompatibilityLabelCommand(LabelCommand, CompatibilityBaseCommand):
    """LabelCommand is a BaseCommand sub-class without its own __init__."""

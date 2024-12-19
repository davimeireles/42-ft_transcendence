from django.shortcuts import render
from django.http import HttpResponse
from models import User

def index(request):
    return HttpResponse(models.User.objects.all())
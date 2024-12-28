from . import models
import requests
from django.shortcuts import render

def index(request):
    if request.method == 'POST':
        username = request.POST.get("username")
        password = request.POST.get("password")
        nickname = request.POST.get("nickname")
        email = request.POST.get("email")
        new_user_object = models.User(username=username, password=password, nickname=nickname, email=email, created_at=datetime.datetime.now().time(), updated_at=datetime.datetime.now().time())
        new_user_object.save()
    return render(request, 'index.html')
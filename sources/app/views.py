import requests
import datetime
from . import models
from django.contrib import messages
from django.shortcuts import render, redirect
from app.forms import CustomUserForm, LoginForm
from app.models import User
from django.contrib.auth import authenticate, login

def home_page(request):
    return render(request, 'index.html')

def register_user(request):
    action = request.POST.get('action')
    form = CustomUserForm(request.POST)
    print(f"Action {action}")
    print(f"Method {request.method}")
    if request.method == 'POST':
        if action == 'login':
            context = {'form': form}
            return render(request, 'login.html', context)
        elif action == 'register':
            form = CustomUserForm(request.POST)
            if form.is_valid():
                user_object = form.save(commit=False)
                user_object.nickname = form.cleaned_data['nickname']
                user_object.email = form.cleaned_data['email']
                user_object.set_password(form.cleaned_data['password1'])  # Use set_password to hash the password
                user_object.save()
                context = {'form': form}
                return render(request, 'login.html', context)  # Redirect to the appropriate page
    else:
        form = CustomUserForm()
    context = {'form': form}
    return render(request, 'register.html', context)


def login_user(request):
    users = User.objects.all()
    action = request.POST.get('action')
    form = LoginForm(request.POST)
    for user in users:
        print(f"Username: {user.username}, Email: {user.email}")
    if request.method == 'POST':
        if action == 'loginuser':
            username = request.POST.get('username')
            password = request.POST.get('password')
            user = authenticate(request, username=username, password=password)
            context = {'form': form}
            if user is not None:
                print(f'User and password correct')
                return render(request, 'new.html', context)
            else:
                print(f'User or Passoword Wrong')
                return render(request, 'login.html', context)
    else:
        form = LoginForm()
    context = {'form': form}
    return render(request, 'login.html', context)


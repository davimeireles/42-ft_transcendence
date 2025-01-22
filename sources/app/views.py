from django.contrib.auth import authenticate, login, get_user_model
from django.shortcuts import render, redirect
from django.conf import settings
from django.http import HttpResponse
from app.forms import CustomUserForm, LoginForm
from app.models import User
import urllib.parse
import requests
import os, sys

def render_home_page(request):
    action = request.POST.get('action')
    form = CustomUserForm(request.POST)
    if request.method == 'POST':
        context = {'form': form}
        if action == 'login':
            return render(request, 'login.html', context)
        elif action == 'register':
            return render(request, 'register.html, context')   
    return render(request, 'index.html')

def register_user(request):
    form = CustomUserForm(request.POST)
    if form.is_valid():
        user_object = form.save(commit=False)
        user_object.nickname = form.cleaned_data['nickname']
        user_object.email = form.cleaned_data['email']
        user_object.set_password(form.cleaned_data['password1'])  # Use set_password to hash the password
        user_object.save()
        context = {'form': form}
        # login(request, user_object)
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
                login(request, user)
                return render(request, 'new.html', context)
            else:
                print(f'User or Passoword Wrong')
                return render(request, 'login.html', context)
    else:
        form = LoginForm()
    context = {'form': form}
    return render(request, 'login.html', context)

def redirect_42(request):
    client_id = os.getenv('UID')
    redirect_uri = os.getenv('URI')
    authorization_url = 'https://api.intra.42.fr/oauth/authorize'
    params = {
        'client_id': client_id,
        'redirect_uri': redirect_uri,
        'response_type': 'code',
        'scope': 'public',
    }
    url = f"{authorization_url}?{urllib.parse.urlencode(params)}"
    return redirect(url)
def new(request):
    code = request.GET.get('code') #code from the query that 42 gives if the authentication was approved
    if not code: #if 42 does not apporved or user did not accept 
        return HttpResponse('400 ERROR', status=400)
    client_id = os.getenv('UID')
    client_secret = os.getenv('SECRET')
    redirect_uri = os.getenv('URI')
    token_url = 'https://api.intra.42.fr/oauth/token'
    payload = {
        'grant_type': 'authorization_code',
        'client_id': client_id,
        'client_secret': client_secret,
        'code': code,
        'redirect_uri': redirect_uri,
    }
    response = requests.post(token_url, data=payload)
    token_data = response.json()
    if 'access_token' not in token_data:
        return render(request, '404.html', {'error': token_data.get('error_description', 'Unknown error')})
    access_token = token_data['access_token']
    user_info_url = 'https://api.intra.42.fr/v2/me'
    headers = {'Authorization': f'Bearer {access_token}'}
    user_response = requests.get(user_info_url, headers=headers)
    user_data = user_response.json()
    user, created = User.objects.get_or_create(username=user_data['login'])
    if created:
        user.nickname = user_data['displayname']
        user.email = user_data['email']
        user.set_unusable_password()
        user.photo = f'{user_data['login']}.jpg'
        user.save()
    folder_path = settings.MEDIA_ROOT
    if not os.path.exists(folder_path):
        os.makedirs(folder_path)
    image_path = os.path.join(folder_path, f'{user_data["login"]}.jpg')
    with open(image_path, 'wb') as file:
        file.write(requests.get(user_data['image']['versions']['small']).content)
    login(request, user)
    return render(request, 'new.html', {'user': request.user})


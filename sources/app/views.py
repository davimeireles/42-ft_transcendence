from django.contrib.auth import authenticate, login, get_user_model, logout
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect
from django.conf import settings
from django.http import HttpResponse
from django.utils import timezone
from app.forms import CustomUserForm, LoginForm
from app.models import User, TwoFactorAuth
from app.utils.send_email import send_verification_email
from datetime import datetime, timedelta
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
        form = LoginForm(request.POST)
        context = {'form': form}
        # login(request, user_object)
        return redirect('login_user')  # Redirect to the appropriate page
    else:
        form = CustomUserForm()
    context = {'form': form}
    return render(request, 'register.html', context)

def login_user(request):
    users = User.objects.all()
    action = request.POST.get('action')
    form = LoginForm(request.POST)
    for user in users:
            if user.online == True:
                print(f"Username: {user.username}, Email: {user.email}")
    if request.method == 'POST':
        if action == 'loginuser':
            username = request.POST.get('username')
            password = request.POST.get('password')
            user_login = authenticate(request, username=username, password=password)
            context = {'form': form}
            if user_login is not None:
                if user_login.two_fa_enable:
                    tfa = TwoFactorAuth.objects.get(user=user_login)
                    if not tfa.is_verified:
                        send_verification_email(user=user_login)
                        return redirect('verify_2fa')
                login(request, user_login)
                return render(request, 'profile.html', context)
            else:
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

def profile(request):
    code = request.GET.get('code') #code from the query that 42 gives if the authentication was approved
    if not code: #if 42 does not apporved or user did not accept 
        return render(request, '404.html')
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
    return render(request, 'profile.html', {'user': request.user})


def logout_user(request):
    if request.user.is_authenticated:
        request.user.online = False
        logout(request)
    return render(request, 'index.html')

# Using the @login_required means that the view will only be executed if the request coming in is authenticated.
# If the person is not authenticated, they will be redirected - usually to the login page
@login_required
def verify_2fa(request):
    if request.method == 'POST':
        code = request.POST.get('code')
        try:
            tfa = TwoFactorAuth.objects.get(user=request.user)
            if tfa.verification_code == code and timezone.now() < tfa.expiration_time:
                tfa.is_verified = True
                tfa.save()
                return render(request, 'profile.html', {'user': request.user})
            else:
                return HttpResponse('Invalid or expired code')
        except TwoFactorAuth.DoesNotExist:
            return HttpResponse('No verification process found.')
    
    return render(request, 'verify_2fa.html')
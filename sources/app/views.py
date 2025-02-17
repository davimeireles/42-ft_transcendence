import requests
import os, sys
from app.models import User
from pathlib import Path
from django.conf import settings
from django.contrib.auth import login
from django.contrib.auth import authenticate
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.decorators import api_view
from rest_framework.permissions import IsAuthenticated
# from django.shortcuts import render, redirect
from django.http import HttpResponse, JsonResponse
# from django.utils import timezone
# from app.forms import CustomUserForm, LoginForm
# from app.utils.send_email import send_verification_email
import urllib.parse
from django.forms.models import model_to_dict
from rest_framework_simplejwt.tokens import RefreshToken
# from rest_framework_simplejwt.authentication import JWTAuthentication


@api_view(['POST'])
def user_signin(request):
    data = request.data
    username = data.get('username')
    password = data.get('password')
    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user)
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)
        response = Response({"message": "User authenticated successfully", "access_token": access_token, "refresh_token": refresh_token}, status=status.HTTP_200_OK)
        response.set_cookie(
            key="jwt_access",
            value=access_token,
            httponly=True,
            secure=True,
            samesite="Lax"
        )
        response.set_cookie(
            key="jwt_refresh",
            value=str(refresh),
            httponly=True,
            secure=True,
            samesite="Lax"
        )
        return response
    else:
        return Response({"message": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
def user_signup(request):
    try:
        data = request.data
        username = data.get('username')
        password = data.get('password')
        email = data.get('email')
        nickname = data.get('nickname')
        if User.objects.filter(username=username).exists():
            return Response({"message": "Username already taken"}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(email=email).exists():
            return Response({"message": "Email already taken"}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(nickname=nickname).exists():
            return Response({"message": "Nickname already taken"}, status=status.HTTP_400_BAD_REQUEST)
        user = User.objects.create_user(username=username, password=password, email=email, nickname=nickname)
        return Response({
            "message": "Register successful",
            "user": {
                "username": user.username,
                "email": user.email
            }
        }, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({"message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
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
    return JsonResponse({'url': url})

@api_view(['POST'])
def oauth42(request):
    if request.method == 'POST':
        code = request.data.get('code')
        if not code:  
            return Response({"message": "Invalid Code"}, status=status.HTTP_400_BAD_REQUEST)

        # Get credentials from environment variables
        client_id = os.getenv('UID')
        client_secret = os.getenv('SECRET')
        redirect_uri = os.getenv('URI')
        
        # URL for getting the token from 42 API
        token_url = 'https://api.intra.42.fr/oauth/token'
        payload = {
            'grant_type': 'authorization_code',
            'client_id': client_id,
            'client_secret': client_secret,
            'code': code,
            'redirect_uri': redirect_uri,
        }

        # Make the request for the access token
        response = requests.post(token_url, data=payload)
        if response.status_code != 200:
            return Response({'message': 'Error getting token'}, status=status.HTTP_400_BAD_REQUEST)

        # Extract token data from the response
        token_data = response.json()
        if 'access_token' not in token_data:
            return Response({"message": "Invalid credentials"}, status=status.HTTP_400_BAD_REQUEST)

        access_token = token_data['access_token']
        
        # Get user info from 42 API using the access token
        user_info_url = 'https://api.intra.42.fr/v2/me'
        headers = {'Authorization': f'Bearer {access_token}'}
        user_response = requests.get(user_info_url, headers=headers)
        user_data = user_response.json()

        # Check if the user already exists in the database
        if User.objects.filter(username=user_data['login']).exists():
            user = User.objects.get(username=user_data['login'])
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)
            response = Response({"message": "User already exists", "access_token": access_token, "refresh_token": refresh_token}, status=status.HTTP_200_OK)
            response.set_cookie(
                key="jwt_access",
                value=access_token,
                httponly=True,
                secure=True,
                samesite="Lax"
            )
            response.set_cookie(
                key="jwt_refresh",
                value=str(refresh),
                httponly=True,
                secure=True,
                samesite="Lax"
            )
            return response
        else:
            user, created = User.objects.get_or_create(
                username=user_data['login'],
                nickname=user_data['login'],
                email=user_data['email'],
                photo=f'{user_data["login"]}.jpg'
            )
            if created:
                user.set_unusable_password()
                user.save()
                folder_path = settings.MEDIA_ROOT
                if not os.path.exists(folder_path):
                    os.makedirs(folder_path)
                image_path = os.path.join(folder_path, f'{user_data["login"]}.jpg')
                with open(image_path, 'wb') as file:
                    file.write(requests.get(user_data['image']['versions']['small']).content)
                refresh = RefreshToken.for_user(user)
                access_token = str(refresh.access_token)
                refresh_token = str(refresh)
                response = Response({"message": "User created", "access_token": access_token, "refresh_token": refresh_token}, status=status.HTTP_200_OK)
                response.set_cookie(
                    key="jwt_access",
                    value=access_token,
                    httponly=True,
                    secure=True,
                    samesite="Lax"
                )
                response.set_cookie(
                    key="jwt_refresh",
                    value=str(refresh),
                    httponly=True,
                    secure=True,
                    samesite="Lax"
                )
                return response
    return Response({"message": "Invalid request"}, status=status.HTTP_400_BAD_REQUEST)

# @api_view(['POST'])
# @permission_classes([IsAuthenticated])
def return_user(request):
    query = request.GET.get('q', '')
    if query:
        users = User.objects.filter(username__icontains=query)[:10]
        results = [{'username': user.username, 'email': user.email} for user in users]
        return JsonResponse(results, safe=False)
    return JsonResponse([], safe=False)

@api_view(['POST'])
def get_user(request, str_user):
    if request.method == 'POST':
        if User.objects.filter(username=str_user).exists():
            user = User.objects.get(username=str_user)
            friends = user.friends.all()
            friends_data = [{"username": friend.username, "email": friend.email, "nickname": friend.nickname} for friend in friends]
            user_data = model_to_dict(user, fields=['nickname', 'username', 'email'])
            user_data['friends'] = friends_data
            if user.photo:
                user_data['photo'] = user.photo.url
            return JsonResponse(user_data)
        else:
            return Response({'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    return Response({'message': 'Error'}, status=status.HTTP_404_NOT_FOUND)
    
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def session_user(request):
    user = request.user
    friends = user.friends.all()
    friends_data = [{"username": friend.username, "email": friend.email, "nickname": friend.nickname} for friend in friends]
    return Response({"email": user.email, "username": user.username, "nickname": user.nickname, "friends": friends_data, "online": user.online})

@api_view(['POST'])
# @permission_classes([IsAuthenticated])
def logout(request):
    try:
        refresh_token = request.data.get("refresh_token")
        if not refresh_token:
            return Response({"message": "No refresh token provided"}, status=status.HTTP_400_BAD_REQUEST)
        token = RefreshToken(refresh_token)
        token.blacklist()
        response = Response({"message": "Successfully logged out"}, status=status.HTTP_200_OK)
        response.delete_cookie("jwt_access")
        response.delete_cookie("jwt_refresh")
        return response
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(["POST"])
def add_user(request):
    if request.method == 'POST':
        profile_username = request.data.get('profileUsername')
        try:
            user = User.objects.get(username=profile_username)
            request.user.add_friend(user)
            return Response({'message': 'User added as a friend'}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    return Response({'message': 'Error'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(["POST"])
def remove_user(request):
    if request.method == 'POST':
        profile_username = request.data.get('profileUsername')
        try:
            user = User.objects.get(username=profile_username)
            if user:
                request.user.remove_friend(user)
                return Response({'message': 'User removed as a friend', "user": user.username}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    return Response({'message': 'Error'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def change_username(request):
    name = request.data.get('user')
    data = request.data.get('username')
    if User.objects.filter(username=data).exists():
        return Response({"message": "Username already taken"}, status=status.HTTP_400_BAD_REQUEST)
    try:
            user = User.objects.get(username=name)
            user.username = data
            user.save()
            return Response({'message': 'Changed Username'}, status=status.HTTP_200_OK)
    except User.DoesNotExist:
            return Response({'message': 'Error'}, status=status.HTTP_404_NOT_FOUND)
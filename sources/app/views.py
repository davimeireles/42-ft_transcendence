import requests
import os
from app.models import User
from django.conf import settings
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


@api_view(['POST'])
def user_signin(request):
    data = request.data
    
    username = data.get('username')
    password = data.get('password')
    
    user = authenticate(request, username=username, password=password)
    
    if user is not None:
        return Response({"message": "User authenticated successfully"}, status=status.HTTP_200_OK)
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
        if not username or not password or not email or not nickname:
            return Response({"message": "Missing fields"}, status=status.HTTP_400_BAD_REQUEST)
        if User.objects.filter(username=username).exists():
            return Response({"message": "Username already taken"}, status=status.HTTP_400_BAD_REQUEST)
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

@api_view(['GET', 'POST'])
def profile(request):
    code = request.GET.get('code')  
    if not code:  
        return JsonResponse({"message": "Invalid Code"}, status=status.HTTP_401_UNAUTHORIZED)

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
        return JsonResponse({"message": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

    access_token = token_data['access_token']
    user_info_url = 'https://api.intra.42.fr/v2/me'
    headers = {'Authorization': f'Bearer {access_token}'}
    user_response = requests.get(user_info_url, headers=headers)
    user_data = user_response.json()

    # user, created = User.objects.get_or_create(username=user_data['login'], defaults={
    #     "email": user_data['email']
    # })
    try:
        user = User.objects.filter(username=user_data['login']).first()
        created = False
    except Exception as e:
        created = True
    
    if created:
        user.username = user_data['login']
        user.set_unusable_password()
        user.photo = f'{user_data["login"]}.jpg'
        user.save()

        folder_path = settings.MEDIA_ROOT
        if not os.path.exists(folder_path):
            os.makedirs(folder_path)

        image_path = os.path.join(folder_path, f'{user_data["login"]}.jpg')
        with open(image_path, 'wb') as file:
            file.write(requests.get(user_data['image']['versions']['small']).content)

        return JsonResponse({"message": "User Created", "redirect": "/profile"}, status=status.HTTP_200_OK)

    return JsonResponse({"message": "User already exists", "redirect": "/profile"}, status=status.HTTP_200_OK)


# @api_view(['GET', 'POST'])
# # @permission_classes([IsAuthenticated])
# def profile(request):
#     code = request.GET.get('code')  # code from the query that 42 gives if the authentication was approved
#     if not code:  # if 42 does not approve or user did not accept
#         return  Response({"message": "Invalid Code"},  status=status.HTTP_401_UNAUTHORIZED)
#     client_id = os.getenv('UID')
#     client_secret = os.getenv('SECRET')
#     redirect_uri = os.getenv('URI')
#     token_url = 'https://api.intra.42.fr/oauth/token'
#     payload = {
#         'grant_type': 'authorization_code',
#         'client_id': client_id,
#         'client_secret': client_secret,
#         'code': code,
#         'redirect_uri': redirect_uri,
#     }
#     response = requests.post(token_url, data=payload)
#     token_data = response.json()
#     if 'access_token' not in token_data:
#         return  Response({"message": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
    
#     access_token = token_data['access_token']
#     user_info_url = 'https://api.intra.42.fr/v2/me'
#     headers = {'Authorization': f'Bearer {access_token}'}
#     user_response = requests.get(user_info_url, headers=headers)
#     user_data = user_response.json()

#     try:
#         user = User.objects.filter(username=user_data['login']).first()
#         created = False
#     except Exception as e:
#         created = True
#     if created:
#         user = User.objects.create(username=user_data['login'])
#         user.username = user_data['login']
#         user.email = user_data['email']
#         user.set_unusable_password()
#         user.photo = f'{user_data["login"]}.jpg'
#         user.save()
#         folder_path = settings.MEDIA_ROOT
#         if not os.path.exists(folder_path):
#             os.makedirs(folder_path)
        
#         image_path = os.path.join(folder_path, f'{user_data["login"]}.jpg')
#         with open(image_path, 'wb') as file:
#             file.write(requests.get(user_data['image']['versions']['small']).content)

#         # user_info = {
#         #     "username": user.username,
#         #     "email": user.email,
#         #     "photo": user.photo.url if user.photo else None,
#         # }
#         return  Response({"message": "User Created"}, status=status.HTTP_200_OK)
#     else:
#         return  Response({"message": "User already exists"}, status=status.HTTP_401_UNAUTHORIZED)
#     return  Response({"message": "Unknown Error"}, status=status.HTTP_401_UNAUTHORIZED)

# # def logout_user(request):
# #     if request.user.is_authenticated:
# #         request.user.online = False
# #         logout(request)
# #     return render(request, 'index.html')

# # # Using the @login_required means that the view will only be executed if the request coming in is authenticated.
# # # If the person is not authenticated, they will be redirected - usually to the login page
# # @login_required
# # def verify_2fa(request):
# #     if request.method == 'POST':
# #         code = request.POST.get('code')
# #         try:
# #             tfa = TwoFactorAuth.objects.get(user=request.user)
# #             if tfa.verification_code == code and timezone.now() < tfa.expiration_time:
# #                 tfa.is_verified = True
# #                 tfa.save()
# #                 return render(request, 'profile.html', {'user': request.user})
# #             else:
# #                 return HttpResponse('Invalid or expired code')
# #         except TwoFactorAuth.DoesNotExist:
# #             return HttpResponse('No verification process found.')
    
# #     return render(request, 'verify_2fa.html')
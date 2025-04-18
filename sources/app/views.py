import os
import io
import json
import math
import pyotp
import qrcode
import base64
import requests
import random
import urllib.parse
from app.api.serializers import UserSerializer
from datetime import timedelta, date, datetime
from django.conf import settings
from django.db import transaction
from django.http import JsonResponse
from django.contrib.auth import login
from django.contrib.auth import authenticate
from django.forms.models import model_to_dict
from django.db.models import Count
from django.db.models.functions import TruncMonth
from django.shortcuts import get_object_or_404
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.core.paginator import Paginator
from faker import Faker
from rest_framework import status
from rest_framework import status, serializers
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework.decorators import api_view, permission_classes
from rest_framework_simplejwt.tokens import AccessToken, RefreshToken
from app.models import User, Match, MatchParticipant, GameType, Tournament, TournamentMatches, TournamentParticipant
import logging

# Configure logging
logger = logging.getLogger(__name__)

@api_view(['POST'])
def user_signin(request):
    data = request.data
    username = data.get('username')
    password = data.get('password')
    user = authenticate(request, username=username, password=password)
    if user is not None:
        login(request, user)
        user.online = True
        user.save()
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
            user.photo = True
            user.online=True
            user.save()
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
                photo=True,
                online=True
            )
            if created:
                user.set_unusable_password()
                user.save()
                if not os.path.exists(settings.MEDIA_ROOT):
                    os.makedirs(settings.MEDIA_ROOT)

                new_filename = f"{user_data['login']}.jpg"
                file_path = os.path.join(settings.MEDIA_ROOT, new_filename)
                with open(file_path, 'wb') as file:
                    file.write(requests.get(user_data['image']['versions']['large']).content)
                file_url = f"{settings.MEDIA_URL}{new_filename}"
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
        users = User.objects.filter(nickname__icontains=query)[:10]
        results = [{'nickname': user.nickname, 'email': user.email} for user in users]
        return JsonResponse(results, safe=False)
    return JsonResponse([], safe=False)

@api_view(['GET'])
def get_user_by_id(request, search_name):
    user = User.objects.get(nickname=search_name)
    serializer = UserSerializer(user)
    return Response(serializer.data)

@api_view(['POST'])
def get_user(request, str_user):
    if request.method == 'POST':
        if User.objects.filter(nickname=str_user).exists():
            user = User.objects.get(nickname=str_user)
            friends = user.friends.all()
            friends_data = [{"username": friend.username, "email": friend.email, "nickname": friend.nickname, 'photo': friend.photo} for friend in friends]
            user_data = model_to_dict(user, fields=['nickname', 'username', 'email', 'photo', 'online'])
            user_data['friends'] = friends_data
            return JsonResponse(user_data)
        else:
            return Response({'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    return Response({'message': 'Error'}, status=status.HTTP_404_NOT_FOUND)
    
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def session_user(request):
    user = request.user
    friends = user.friends.all()
    friends_data = [{"username": friend.username, "email": friend.email, "nickname": friend.nickname, "online": friend.online} for friend in friends]
    return Response({
        "id": user.id,
        "email": user.email,
        "username": user.username,
        "nickname": user.nickname,
        "friends": friends_data,
        "online": user.online,
        "photo": user.photo,
        "two_fa_enable": user.two_fa_enable,
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
# @permission_classes([IsAuthenticated])
def logout(request):
    try:
        refresh_token = request.data.get("refresh_token")
        if not refresh_token:
            return Response({"message": "No refresh token provided"}, status=status.HTTP_400_BAD_REQUEST)
        request.user.online=False
        request.user.save()
        token = RefreshToken(refresh_token)
        token.blacklist()
        response = Response({"message": "Successfully logged out"}, status=status.HTTP_200_OK)
        response.delete_cookie("jwt_access")
        response.delete_cookie("jwt_refresh")
        return response
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(["POST", "GET"])
def add_userS(request):

    if request.method == 'POST':
        to_add = request.data.get('toAdd')
        adder = request.data.get('adder')
        try:
            user = User.objects.get(username=to_add)
            adder_obj = User.objects.get(username=adder)
            adder_obj.add_friend(user)
            return Response({'message': 'User added as a friend'}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({'message': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
    return Response({'message': 'Error'}, status=status.HTTP_400_BAD_REQUEST)

@api_view(["POST"])
def remove_userS(request):
    if request.method == 'POST':
        to_remove = request.data.get('toAdd')
        remover = request.data.get('adder')
        try:
            user = User.objects.get(username=to_remove)
            remover_obj = User.objects.get(username=remover)
            remover_obj.remove_friend(user)
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
        old_filename = f"{name}.jpg"
        old_file_path = os.path.join(settings.MEDIA_ROOT, old_filename)
        new_filename = f"{data}.jpg"
        new_file_path = os.path.join(settings.MEDIA_ROOT, new_filename)
        if os.path.exists(old_file_path):
            try:
                os.rename(old_file_path, new_file_path)
            except Exception as e:
                return Response({'message': f'Error renaming file: {str(e)}'}, status=status.HTTP_404_NOT_FOUND)
        return Response({'message': 'Changed Username'}, status=status.HTTP_200_OK)
    except User.DoesNotExist:
        return Response({'message': 'Error: User not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
def change_nick(request):
    name = request.data.get('user')
    data = request.data.get('nick')
    if User.objects.filter(nickname=data).exists():
        return Response({"message": "Username already taken"}, status=status.HTTP_400_BAD_REQUEST)
    try:
            user = User.objects.get(username=name)
            user.nickname = data
            user.save()
            return Response({'message': 'Changed Username'}, status=status.HTTP_200_OK)
    except User.DoesNotExist:
            return Response({'message': 'Error'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['POST'])
def upload_photo(request):
    uploaded_file = request.FILES.get('file')

    if not uploaded_file:
        return Response({"error": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST)

    username = request.user.username 
    request.user.photo = True
    request.user.save()
    if not os.path.exists(settings.MEDIA_ROOT):
        os.makedirs(settings.MEDIA_ROOT)

    new_filename = f"{username}.jpg"
    file_path = os.path.join(settings.MEDIA_ROOT, new_filename)

    with open(file_path, "wb") as f:
        for chunk in uploaded_file.chunks():
            f.write(chunk)

    if not os.path.exists(file_path):
        return Response({"error": "File was not saved"}, status=400)

    file_url = f"{settings.MEDIA_URL}{new_filename}"

    return JsonResponse({"message": "File uploaded successfully", "file_url": file_url})

@api_view(['POST'])
def change_password(request):
    psw = request.data.get('password')
    
    if not psw:
        return Response({'message': 'Password is required'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        user = User.objects.get(username=request.user.username)
        user.set_password(psw)
        user.save()
        return Response({'message': 'Password changed successfully'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'message': 'Error changing password', 'error': str(e)}, status=status.HTTP_401_UNAUTHORIZED)
    
@api_view(['POST'])
def check_token(request):
    try:
        access_token = AccessToken(request.data.get('token'))
        return Response({"valid": True}, status=status.HTTP_200_OK)
    except TokenError:
        return Response({"valid": False}, status=401)
    
@api_view(['POST'])
def new_session(request):
    user = request.user
    if not user:
        return Response({"message": "User not valid"}, status=status.HTTP_400_BAD_REQUEST)
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

@api_view(['POST'])
def setup_2fa(request):
    user = request.user

    user.two_fa_secret = pyotp.random_base32()
    user.save()
    
    otp_uri = pyotp.totp.TOTP(user.two_fa_secret).provisioning_uri(
        name=user.username,
        issuer_name='app'
    )
    
    qr = qrcode.make(otp_uri)
    buffer = io.BytesIO()
    qr.save(buffer, format='PNG')
    
    buffer.seek(0)
    qr_code = base64.b64encode(buffer.getvalue()).decode("utf-8")
    
    qr_code_data_uri = f"data:image/png;base64,{qr_code}"
    
    return JsonResponse({"qrcode": qr_code_data_uri, "secret": user.two_fa_secret})

@api_view(['POST'])
def verify_2fa_first_time(request):
    data = json.loads(request.body)
    otp_code = data.get('otp')
    if not otp_code:
        return JsonResponse({'message': 'OTP code is required'}, status=400)
    
    user = request.user
    totp = pyotp.TOTP(user.two_fa_secret)
    if totp.verify(otp_code):
        user.two_fa_enable = True
        user.save()
        return JsonResponse({'message': '2FA verification successful'}, status=status.HTTP_200_OK)
    else:
        return JsonResponse({'message': 'Invalid OTP code'}, status=400)

@api_view(['POST'])
def verify_2fa(request):
    if not request.user.is_authenticated:
        return JsonResponse({'message': 'User not authenticated'}, status=401)
    try:
        user = request.user
        if user.two_fa_enable:
            data = json.loads(request.body)
            otp_code = data.get('otp')
            if not otp_code:
                return JsonResponse({'message': 'OTP code is required'}, status=400)
            
            totp = pyotp.TOTP(user.two_fa_secret)
            if totp.verify(otp_code):
                user.two_fa_enable = True
                user.save()
                return JsonResponse({'message': '2FA verification successful'}, status=status.HTTP_200_OK)
            else:
                return JsonResponse({'message': 'Invalid OTP code'}, status=400)
    except User.DoesNotExist:
        return JsonResponse({'message': 'User not found'}, status=404)
    except Exception as e:
        return JsonResponse({'message': 'Error', 'error': str(e)}, status=400)
    return JsonResponse({'message': 'Error'}, status=400)

@api_view(['POST'])
def get_match_details(request):
    game_type_id = request.data.get('game_type_id')
    match_winner = request.data.get('match_winner')
    player1_score = request.data.get('p1_score')
    player2_score = request.data.get('p2_score')
    p1_username = request.data.get('p1_username')
    p2_username = request.data.get('p2_username')

    try:
        with transaction.atomic():
            game_type = get_object_or_404(GameType, id=game_type_id)
            logger.info("Game type found: %s", game_type)

            if match_winner == p1_username:
                winner = User.objects.get(username=p1_username)
            elif match_winner == p2_username:
                winner = User.objects.get(username=p2_username)
            else:
                logger.error("Invalid winner identifier")
                return Response({'error': 'Invalid winner identifier.'}, status=400)

            logger.info("Match winner: %s", winner)

            match = Match.objects.create(gameTypeID=game_type, matchWinner=winner)
            logger.info("Match created: %s", match)

            player1 = User.objects.get(username=p1_username)
            player2 = User.objects.get(username=p2_username)
            logger.info("Players found: %s, %s", player1, player2)

            MatchParticipant.objects.create(matchID=match, userID=player1, score=player1_score)
            MatchParticipant.objects.create(matchID=match, userID=player2, score=player2_score)
            logger.info("Match participants created")

            return Response({'message': 'Match details saved successfully.'}, status=201)

    except GameType.DoesNotExist:
        logger.error("GameType not found")
        return Response({'error': 'GameType not found.'}, status=404)
    except User.DoesNotExist:
        logger.error("One or more users not found")
        return Response({'error': 'One or more users not found.'}, status=404)
    except Exception as e:
        logger.error("Error: %s", str(e))
        return Response({'error': str(e)}, status=400)

@api_view(['GET'])
def match_history_page(request, user_id, page_num):
    max_results_per_page = 5
    all_matches = MatchParticipant.objects.filter(userID=user_id).select_related('matchID').order_by('-id')
    paginator = Paginator(all_matches, max_results_per_page)
    matches = paginator.get_page(page_num)

    history = []

    for participant in matches:
        match = participant.matchID
        participants = MatchParticipant.objects.filter(matchID=match)

        if len(participants) < 2:
            continue  # Skip if the match is incomplete

        user1 = participants[0]
        user2 = participants[1]

        history.append({
            "User1": user1.userID.nickname,
            "User2": user2.userID.nickname,
            "Winner": match.matchWinner.id,
            "User1Score": user1.score,
            "User2Score": user2.score,
            "matchId": match.id,
        })

    return Response({
            'history': history,
        },  status=status.HTTP_200_OK)

@api_view(['GET'])
def tournament_history_page(request, user_id, page_num):
    tournaments = Tournament.objects.filter(createdBy=user_id, finished=True).order_by('-id')
    results_per_page = 5
    paginator = Paginator(tournaments, results_per_page)
    paged_tournaments = paginator.get_page(page_num)

    history = []

    for entry in paged_tournaments:
        tourney_data = {
            'entry': {
                'name': entry.name,
                'id': entry.id,
            }
        }
        history.append(tourney_data)

    return Response({
        'history': history
    },  status=status.HTTP_200_OK)

@api_view(['GET'])
def get_tournament_by_id(request, tourney_id):
    tourney = get_object_or_404(Tournament, id=tourney_id)
    data = {
            "id": tourney.id,
            "name": tourney.name,
            "winner": tourney.winner,
            "createdBy": tourney.createdBy.nickname,
            "created_at": tourney.created_at,
            "finished": tourney.finished
        }
    return JsonResponse(data)

@api_view(['GET'])
def get_match_info(request, match_id):
    participants = MatchParticipant.objects.filter(matchID=match_id)
    match = Match.objects.get(id=match_id)
    user1 = participants[0]
    user2 = participants[1]
    
    game_info = ({
            "User1": user1.userID.nickname,
            "User2": user2.userID.nickname,
            "User1Score": user1.score,
            "User2Score": user2.score,
            "matchDate": match.createdAt
    })

    return Response({
        'game_info': game_info,
    }, status=status.HTTP_200_OK)

@api_view(['GET'])
def count_user_games(request, user_id):
    game_count = MatchParticipant.objects.filter(userID=user_id).count()
    total_wins = Match.objects.filter(matchWinner=user_id).count()
    total_tourneys = Tournament.objects.filter(createdBy=user_id, finished=True).count()

    return Response(
        {
            'total_games': game_count,
            'total_wins': total_wins,
            'total_tournaments': total_tourneys,
        },  status=status.HTTP_200_OK)

@api_view(['POST'])
def get_tournament_details(request):
    name = request.data.get('_name')
    created_by = request.data.get('_created_by')
    competitors = request.data.get('_competitors')

    try:
        with transaction.atomic():
            creator = User.objects.get(username=created_by)
            tournament = Tournament.objects.create(name=name, createdBy=creator)
            logger.info("Tournament created: %s", tournament)
            if (len(competitors) % 2):
                size = len(competitors)
            else:
                size = len(competitors) - 1
            for i in range(0, size):
                match = TournamentMatches.objects.create(tournament=tournament, tournament_leg=math.log(size - i, 2))
                logger.info("Tournament match created: %s", match)
                if (i * 2) + 1 <= size + 1:
                    for nickname in competitors[i * 2 : (i * 2) + 2]:
                        participant = TournamentParticipant.objects.create(nickname=nickname, match=match)
                        logger.info("Tournament participant created: %s", participant)
            return Response({'message': 'Tournament details saved successfully.'}, status=201)
    except Exception as e:
        logger.error("Error: %s", str(e))
        return Response({'error': str(e)}, status=400)

@api_view(['POST'])
def get_tournament(request):
    created_by = request.data.get('username')
    creator = User.objects.get(username=created_by)
    if request.method == 'POST':
        if Tournament.objects.filter(createdBy=creator, finished=False).exists():
            tournament = Tournament.objects.get(createdBy=creator, finished=False)
            if (tournament.winner):
                winner = tournament.winner.nickname
            else:
                winner = None
            data = {
                "id": tournament.id,
                "name": tournament.name,
                "winner": winner,
                "createdBy": created_by,
                "created_at": tournament.created_at,
                "finished": tournament.finished
            }
            return JsonResponse(data)
        else:
            return JsonResponse({'message': 'No tournament'})
    return Response({'message': 'Error'}, status=status.HTTP_400_NOT_FOUND)

@api_view(['GET'])
def get_matches(request, tournament_id):
    matches = TournamentMatches.objects.filter(tournament=tournament_id).values()
    if not matches.exists():
        return Response({'message': 'Match not found'}, status=status.HTTP_404_NOT_FOUND)
    return JsonResponse({"matches": list(matches)})

@api_view(['GET'])
def get_players(request, match_id):

    players = TournamentParticipant.objects.filter(match=match_id).values()
    if not players.exists():
        return Response({'message': 'Match not found'}, status=status.HTTP_404_NOT_FOUND)
        
    return JsonResponse({"players": list(players)})

@api_view(['POST'])
def update_match(request):
    coming_match = request.data.get('match')
    tournament_id = coming_match.get("tournament_id")
    tournament_leg = coming_match.get("tournament_leg")
    winner = request.data.get('winner')
    winner_id = winner.get("id")
    winner_nick = winner.get("nickname")
    if request.method == 'POST':
        match = TournamentMatches.objects.get(tournament=tournament_id, tournament_leg=tournament_leg)
        match.winner = TournamentParticipant.objects.get(id=winner_id)
        match.played = True
        match.save()
        if (match.tournament_leg > 0):
            next_match_leg = math.log(int(math.pow(2, tournament_leg)/2), 2)
            next_match = TournamentMatches.objects.get(tournament=tournament_id, tournament_leg=next_match_leg)
            participant = TournamentParticipant.objects.create(nickname=winner_nick, match=next_match)
            return JsonResponse({"message": "Match status saved"})
        else:
            tournament = Tournament.objects.get(id=tournament_id)
            tournament.winner = TournamentParticipant.objects.get(id=winner_id).nickname
            tournament.finished = True
            tournament.save()
            return JsonResponse({"message": tournament_id})
    return Response({'message': 'Error'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def get_playing_habits(request, user_id):
    get_object_or_404(User, id=user_id)

    # Set the date range for the last year
    year = date.today() - timedelta(days=365)

    # Aggregate data by month
    data = (
        MatchParticipant.objects
        .filter(userID=user_id, matchID__createdAt__gte=year)
        .annotate(month=TruncMonth("matchID__createdAt"))
        .values("month")
        .annotate(games_played=Count("matchID_id"))
        .order_by("month")
    )

    # Prepare data for the frontend
    months = [entry['month'].strftime('%b %Y') for entry in data]  # Month labels (e.g., 'Mar 2025')
    games_played = [entry['games_played'] for entry in data]

    return Response({'months': months, 'games_played': games_played}, status=status.HTTP_200_OK)
    
@api_view(['POST'])
def dummy_matches(request):
    try:
        data = json.loads(request.body)
        num_matches = int(data.get("num_matches"))
        user_id = data.get("user_id")

        numbers = [1, 2, 3]
        fake = Faker()
        user = get_object_or_404(User, id=user_id)
        gameType = get_object_or_404(GameType, id=2)

        now = datetime.now()
        one_year_ago = now - timedelta(days=365)

        for _ in range(num_matches):
            date = fake.date_time_between(start_date=one_year_ago, end_date=now)
            match = Match.objects.create(gameTypeID=gameType, matchWinner=user)
            match.createdAt = date
            match.save()

            random.shuffle(numbers)
            user2 = get_object_or_404(User, id=numbers[0])
            MatchParticipant.objects.create(matchID=match, userID=user, score=3)
            MatchParticipant.objects.create(matchID=match, userID=user2, score=2)

        return JsonResponse({
            "message": f"Created {num_matches} matches."
        }, status=201)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)
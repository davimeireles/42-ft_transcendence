from rest_framework.response import Response
from rest_framework.decorators import api_view
from app.models import User, Games, GameType, Tournament, Match, MatchParticipant
from .serializers import UserSerializer, GamesSerializer, GameTypeSerializer, TournamentSerializer, MatchSerializer, MatchParticipantSerializer

@api_view(['GET'])
def getUserData(request):
    users = User.objects.all()
    serializer = UserSerializer(users, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def getGamesData(request):
    games = Games.objects.all()
    serializer = GamesSerializer(games, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def getGameTypeData(request):
    game_types = GameType.objects.all()
    serializer = GameTypeSerializer(game_types, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def getTournamentData(request):
    tournaments = Tournament.objects.all()
    serializer = TournamentSerializer(tournaments, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def getMatchData(request):
    matchs = Match.objects.all()
    serializer = MatchSerializer(matchs, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def getMatchParticipantData(request):
    match_participants = MatchParticipant.objects.all()
    serializer = MatchParticipantSerializer(match_participants, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def addUser(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
    return Response(serializer.data)


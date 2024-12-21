from django.shortcuts import render
from django.http import HttpResponse
from .models import Games, GameType, Tournament, Match, MatchParticipant, User
from rest_framework import viewsets
from .serializers import UserSerializer, GamesSerializer, GameTypeSerializer, TournamentSerializer, MatchSerializer, MatchParticipantSerializer

# Create views

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class GamesViewSet(viewsets.ModelViewSet):
    queryset = Games.objects.all()
    serializer_class = GamesSerializer

class GameTypeViewSet(viewsets.ModelViewSet):
    queryset = GameType.objects.all()
    serializer_class = GameTypeSerializer

class TournamentViewSet(viewsets.ModelViewSet):
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer
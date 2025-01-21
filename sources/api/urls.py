from django.urls import path
from . import views

urlpatterns = [
    path('getUsers/', views.getUserData),
    path('getGames/', views.getGamesData),
    path('getGamesType/', views.getGameTypeData),
    path('getMatchs/', views.getMatchData),
    path('getMatchParticipants/', views.getMatchParticipantData),
    path('getTournaments/', views.getTournamentData),
    path('addUser/', views.addUser),
]
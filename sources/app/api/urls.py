from django.urls import path
from . import views
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('getUsers/', views.getUserData),
    path('getGames/', views.getGamesData),
    path('getGamesType/', views.getGameTypeData),
    path('getMatchs/', views.getMatchData),
    path('getMatchParticipants/', views.getMatchParticipantData),
    path('getTournaments/', views.getTournamentData),
    path('addUser/', views.addUser),
]
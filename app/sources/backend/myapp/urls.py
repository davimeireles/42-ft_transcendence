from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, GamesViewSet, GameTypeViewSet, TournamentViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'games', GamesViewSet)
router.register(r'gametypes', GameTypeViewSet)
router.register(r'tournaments', TournamentViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
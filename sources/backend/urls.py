from django.contrib import admin
from django.urls import path, include
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

import app.views
# from app import views
from django.conf import settings
# import livechat.views


urlpatterns = [
    path('admin/', admin.site.urls),
    path('login/', app.views.user_signin, name='user_signin'),
    path('register/', app.views.user_signup, name='user_signup'),
    path('auth-42/', app.views.redirect_42, name='redirect_42'),
    path('oauth42/', app.views.oauth42),
    path('return_user/', app.views.return_user, name="return_user"),
    path('get_user/<str:str_user>', app.views.get_user, name="get_user"),
    path('session_user/', app.views.session_user, name="session_user"),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('add_user/', app.views.add_user, name='add_user'),
    path('remove_user/', app.views.remove_user, name='remove_user'),
    path('change_username/', app.views.change_username, name='change_username'),
    path('logout/', app.views.logout, name='logout'),
    path('check-2fa-status/', app.views.check_2fa_status, name='check_2fa_status'),
    path('setup-2fa/', app.views.setup_2fa, name='setup_2fa'),
    path('verify-2fa/', app.views.verify_2fa, name='verify_2fa'),
    path('remove-2fa/', app.views.remove_2fa, name='remove_2fa'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
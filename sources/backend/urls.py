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
    path('return_user/<str:str_user>', app.views.return_user, name="return_user"),
    path('session_user/', app.views.session_user, name="session_user"),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('add_user/', app.views.add_user, name='add_user'),
    path('remove_user/', app.views.remove_user, name='remove_user'),
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# urlpatterns = [
#     path('admin/', admin.site.urls),
#     path('', views.render_home_page),
#     path('register/', views.register_user, name='register_user'),
#     path('login/', views.login_user, name='login_user'),
#     path('api/', include('api.urls')),
#     path('chat/', livechat.views.chat, name='chat'),
#     path('logout/', views.logout_user, name='logout_user'),
#     path('verify-2fa/', views.verify_2fa, name='verify_2fa'),
# ] 

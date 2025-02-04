from django.contrib import admin
from django.urls import path, include
from django.conf.urls.static import static
import app.views
# from app import views
# from django.conf import settings
# import livechat.views


urlpatterns = [
    path('admin/', admin.site.urls),
    path('login/', app.views.user_signin, name='user_signin'),
    path('register/', app.views.user_signup, name='user_signup'),
    path('auth-42/', app.views.redirect_42, name='redirect_42'),
    path('profile/', app.views.profile, name='profile'),
]

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
# if settings.DEBUG:
#     urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

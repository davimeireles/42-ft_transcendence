from django.contrib import admin
from django.urls import path, include
from app import views
from django.conf.urls.static import static
from django.conf import settings
import livechat.views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views.render_home_page),
    path('register/', views.register_user, name='register_user'),
    path('login/', views.login_user, name='login_user'),
    path('auth-42/', views.redirect_42, name='redirect_42'),
    path('profile/', views.profile, name='profile'),
    path('api/', include('api.urls')),
    path('chat/', livechat.views.chat, name='chat'),
    path('logout/', views.logout_user, name='logout_user'),
] 
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

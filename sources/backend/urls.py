from django.contrib import admin
from django.urls import path
from app import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('register/', views.register_user, name='register_user'),
    path('login/', views.login_user, name='login_user'),
]

from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models

class UserManager(BaseUserManager):
    def create_user(self, username, password=None, **extra_fields):
        if not username:
            raise ValueError('The Username field must be set')
        user = self.model(username=username, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        return self.create_user(username, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    username = models.CharField(max_length=32, null=False, unique=True)
    password = models.CharField(max_length=128, null=False)
    nickname = models.CharField(max_length=32, null=False, unique=True)
    email = models.CharField(max_length=128, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    photo = models.ImageField(upload_to='photos/', null=True, blank=True)
    
    objects = UserManager()

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email']
    
    def __str__(self):
        return self.username

class Games(models.Model):
    name = models.CharField(max_length=32, null=False, unique=True)

class GameType(models.Model):
    type = models.CharField(max_length=32, null=False, unique=True)
    
class Tournament(models.Model):
    winner = models.ForeignKey(User, on_delete=models.CASCADE)
    
class Match(models.Model):
    gameID = Games.id
    userID = User.id
    gameTypeID = GameType.id
    tournamentID = Tournament.id

class MatchParticipant(models.Model):
    matchID = Match.id
    userID = User.id
    score = models.IntegerField(null=True)
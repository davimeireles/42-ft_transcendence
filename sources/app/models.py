from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    username = models.CharField(max_length=128, null=False, unique=True)
    password = models.CharField(max_length=128, null=False)
    nickname = models.CharField(max_length=128, null=False, unique=True)
    email = models.CharField(max_length=128, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    last_login = models.DateTimeField(blank=True, null=True, verbose_name='last login')
    photo = models.ImageField(upload_to='photos/', null=True, blank=True)
    two_fa_enable = models.BooleanField(default=False) # True for test.
    online = models.BooleanField(default=True)
    friends = models.ManyToManyField(
        'self',
        related_name='friend',
        symmetrical=False,
        blank=True
    )
    def add_friend(self, user):
        """Add friend another user."""
        if user not in self.friends.all():
            self.friends.add(user)
            self.save()

    def remove_friend(self, user):
        """Remove friend another user."""
        if user in self.friends.all():
            self.friends.remove(user)
            self.save()

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
    
class TwoFactorAuth(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    verification_code = models.CharField(max_length=6)
    expiration_time = models.DateTimeField()
    is_verified = models.BooleanField(default=False)
import pyotp
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
    photo = models.BooleanField(default=False)
    two_fa_enable = models.BooleanField(default=False) # True for test.
    two_fa_secret = models.CharField(max_length=32, null=True, blank=True, default=False)
    online = models.BooleanField(default=False)
    friends = models.ManyToManyField(
        'self',
        related_name='friend',
        symmetrical=False,
        blank=True
    )
    otp_secret = models.CharField(max_length=32, default=pyotp.random_base32)
    
    def get_otp_uri(self):
        """Generate the OTP URI for the user."""
        return pyotp.totp.TOTP(self.otp_secret).provisioning_uri(
            name=self.email,
            issuer_name='app'
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
    name = models.CharField(max_length=12, null=False)
    winner = models.CharField(max_length=12, default="")
    createdBy = models.ForeignKey(User, on_delete = models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    finished = models.BooleanField(default=False)
    
class TournamentMatches(models.Model):
    played = models.BooleanField(default=False)
    tournament_leg = models.FloatField()
    winner = models.ForeignKey('TournamentParticipant', null=True, blank=True, on_delete=models.CASCADE)
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE)

class TournamentParticipant(models.Model):
    nickname = models.CharField(max_length=12, null=False)
    match = models.ForeignKey(TournamentMatches, on_delete=models.CASCADE)

class Match(models.Model):
    gameTypeID = models.ForeignKey(GameType, on_delete=models.CASCADE)
    matchWinner = models.ForeignKey(User, on_delete=models.CASCADE)
    tournament= models.ForeignKey(Tournament, on_delete=models.CASCADE, null=True)
    createdAt = models.DateTimeField(auto_now_add=True)

class MatchParticipant(models.Model):
    matchID = models.ForeignKey(Match, on_delete=models.CASCADE)
    userID = models.ForeignKey(User, on_delete=models.CASCADE)
    score = models.IntegerField(null=True)
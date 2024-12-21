from django.db import models

# Create your models here.

class User(models.Model):
    username = models.CharField(max_length=32, null=False, unique=True)
    password = models.CharField(max_length=128, null=False)
    nickname = models.CharField(max_length=32, null=False, unique=True)
    email = models.CharField(max_length=128, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
class Games(models.Model):
    name = models.CharField(max_length=32, null=False, unique=True)

class GameType(models.Model):
    type = models.CharField(max_length=32, null=False, unique=True)
    
class Tournament(models.Model):
    winner = models.ForeignKey(User, on_delete=models.CASCADE)
    
class Match(models.Model):
    gameID = models.ForeignKey(Games, on_delete=models.CASCADE)
    userID = models.ForeignKey(User, on_delete=models.CASCADE)
    gameTypeID = models.ForeignKey(GameType, on_delete=models.CASCADE)
    tournamentID = models.ForeignKey(Tournament, on_delete=models.CASCADE)

class MatchParticipant(models.Model):
    matchID = models.ForeignKey(Match, on_delete=models.CASCADE)
    userID = models.ForeignKey(User, on_delete=models.CASCADE)
    score = models.IntegerField(null=True)
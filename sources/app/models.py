from django.db import models

class User(models.Model):
    username = models.CharField(max_length=32, null=False, unique=True)
    password = models.CharField(max_length=128, null=False)
    nickname = models.CharField(max_length=32, null=False, unique=True)
    email = models.CharField(max_length=128, unique=True)
    created = models.DateTimeField(auto_now_add=True)

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
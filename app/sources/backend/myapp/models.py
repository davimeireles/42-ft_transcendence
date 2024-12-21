from django.db import models
from django.core.serializers import serialize
import json
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
    
    def to_json(self):
        return json.loads(serialize('json', [self]))[0]

class GameType(models.Model):
    type = models.CharField(max_length=32, null=False, unique=True)
    
    def to_json(self):
        return json.loads(serialize('json', [self]))[0]
    
class Tournament(models.Model):
    winner = models.ForeignKey(User, on_delete=models.CASCADE)
    
    def to_json(self):
        return json.loads(serialize('json', [self]))[0]
    
class Match(models.Model):
    gameID = models.ForeignKey(Games, on_delete=models.CASCADE, default=1)
    userID = models.ForeignKey(User, on_delete=models.CASCADE, default=1)
    gameTypeID = models.ForeignKey(GameType, on_delete=models.CASCADE, default=1)
    tournamentID = models.ForeignKey(Tournament, on_delete=models.CASCADE, default=1)
    
    def to_json(self):
        return json.loads(serialize('json', [self]))[0]

class MatchParticipant(models.Model):
    matchID = models.ForeignKey(Match, on_delete=models.CASCADE, default=1)
    userID = models.ForeignKey(User, on_delete=models.CASCADE, default=1)        
    score = models.IntegerField(null=True)

    def to_json(self):
        return json.loads(serialize('json', [self]))[0]
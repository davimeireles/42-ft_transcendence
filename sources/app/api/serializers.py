from rest_framework import serializers
from app.models import User, Games, GameType, Tournament, Match, MatchParticipant

class UserSerializer(serializers.ModelSerializer):
    friends = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'nickname', 'photo', 'friends', 'online']
    
    def get_friends(self, obj):
        # Return a list of dictionaries containing id and username for each friend
        return [{"id": friend.id, "username": friend.username} for friend in obj.friends.all()]

class GamesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Games
        fields = '__all__'
        
class GameTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = GameType
        fields = '__all__'
        
class TournamentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tournament
        fields = '__all__'
        
class MatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Match
        fields = '__all__'
        
class MatchParticipantSerializer(serializers.ModelSerializer):
    class Meta:
        model = MatchParticipant
        fields = '__all__'
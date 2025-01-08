from django.test import TestCase, Client
from django.urls import reverse
from app.models import User, Games, GameType, Tournament, Match, MatchParticipant
import json

class TestViews(TestCase):
    
# The setUp method is called before each test method to
# set up any state that is shared across tests.

# Create a test client instance (self.client) to simulate requests to your application.
# Use the reverse function to get the URL for the register_user and login_user views
# store them in self.register_user and self.login_user.
    
    def setUp(self):
        self.client = Client()
        self.register_user = reverse('register_user')
        self.login_user = reverse('login_user')
    
# This method tests the register_user view:
# It sends a GET request to the register_user URL.
# Asserts that the response status code is 200 (OK).
# Asserts that the response used the index.html template.
    
    def test_register_user_GET(self):    
        response = self.client.get(self.register_user)
        
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'index.html') # change the index.html name
        
# This method tests the login_user view:
# It sends a GET request to the login_user URL.
# Asserts that the response status code is 200 (OK).
# Asserts that the response used the login.html template.
     
    def test_login_user_GET(self):
        response = self.client.get(self.login_user)
        
        self.assertEqual(response.status_code, 200)
        self.assertTemplateUsed(response, 'login.html')
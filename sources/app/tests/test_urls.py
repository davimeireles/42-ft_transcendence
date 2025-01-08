from django.test import SimpleTestCase
from django.urls import reverse, resolve

from app.views import login_user, register_user

class TestUrls(SimpleTestCase):
    
    def test_register_url_is_resolved(self):
        url = reverse('register_user')
        self.assertEqual(resolve(url).func, register_user)
    
    def test_login_url_is_resolved(self):
        url = reverse('login_user')
        self.assertEqual(resolve(url).func, login_user)
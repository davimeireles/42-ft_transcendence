import jwt
from django.conf import settings
from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken

User = get_user_model()

class CookieJWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        token = request.COOKIES.get('jwt_access')  # Read token from cookie
        if not token:
            return None  # No authentication

        try:
            decoded_token = AccessToken(token)  # Decode JWT
            user_id = decoded_token['user_id']
            user = User.objects.get(id=user_id)
        except (jwt.ExpiredSignatureError, jwt.DecodeError, User.DoesNotExist):
            raise AuthenticationFailed('Invalid or expired token')

        return (user, None)  # Django expects a (user, auth) tuple

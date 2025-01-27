import random
import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail
from django.utils import timezone
from datetime import timedelta
from ..models import TwoFactorAuth

def send_verification_email(user):
    code=''.join(random.choices('0123456789', k=6))
    expiration_time=timezone.now() + timedelta(minutes=10)
    
    TwoFactorAuth.objects.update_or_create(
        user=user,
        defaults={'verification_code':code, 'expiration_time':expiration_time}
    )
        
    message = Mail(
        from_email=os.getenv('DEFAULT_EMAIL_SENDER'),
        to_emails=user.email,
        subject='Your Verification Code',
        html_content=f'<p>Your verification code is: <strong>{code}</strong></p>'
    )
    
    try:
        sg = SendGridAPIClient(os.getenv('SENDGRID_API_KEY'))
        sg.send(message)
    except Exception as e:
        print(str(e))
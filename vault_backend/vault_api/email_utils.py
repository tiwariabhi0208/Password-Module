from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from email.mime.image import MIMEImage
import os

def send_otp_email(recipient_email, name, otp_code, email_type):
    if email_type == 'login':
        subject = "Your Secure Vault OTP Verification Code"
        header_title = "Login Verification OTP"
        description = "You have requested to log in to your Secure Vault account with Two-Factor Authentication (2FA). Please find your One-Time Password (OTP) below to proceed:"
    elif email_type == 'password_reset':
        subject = "Your Secure Vault Password Reset Code"
        header_title = "Password Reset OTP"
        description = "You have requested to reset or update your password. Please find your One-Time Password (OTP) below to proceed:"
    elif email_type == 'email_change':
        subject = "Verify Your New Vault Email Address"
        header_title = "Email Change OTP"
        description = "You have requested to change or update your registered email address. Please find your One-Time Password (OTP) below to proceed:"
    else:
        subject = "Secure Vault Security Code"
        header_title = "Security Verification OTP"
        description = "Please find your One-Time Password (OTP) below to proceed:"

    # Context for the template
    context = {
        'name': name,
        'otp_code': otp_code,
        'header_title': header_title,
        'description': description,
    }

    # Render HTML and plain text version
    html_content = render_to_string('vault_api/email_otp.html', context)
    text_content = f"Dear User,\n\n{description}\n\nOTP Code: {otp_code}\n\nValid for 5 minutes only.\n\nThis OTP is valid for 5 minutes. Please do not share this OTP with anyone. If you did not request this, please ignore this email.\n\nSecure Vault Admin"

    # Create EmailMessage with both text and HTML versions
    email = EmailMultiAlternatives(
        subject=subject,
        body=text_content,
        from_email=None,  # Fallback to DEFAULT_FROM_EMAIL in settings
        to=[recipient_email],
    )
    email.attach_alternative(html_content, "text/html")
    email.mixed_subtype = 'related'  # Needed for inline image layout compatibility

    # Attach the school logo image as inline CID if it exists
    logo_path = os.path.join(settings.BASE_DIR.parent, 'images(1).png')
    if os.path.exists(logo_path):
        try:
            with open(logo_path, 'rb') as f:
                logo_data = f.read()
            mime_image = MIMEImage(logo_data)
            mime_image.add_header('Content-ID', '<school_logo>')
            mime_image.add_header('Content-Disposition', 'inline', filename='logo.png')
            email.attach(mime_image)
        except Exception as e:
            print(f"Failed to attach inline logo to email: {str(e)}")

    # Send the email
    email.send(fail_silently=False)

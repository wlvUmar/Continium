import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings


async def send_email(to: str, subject: str, html: str) -> None:
    message = MIMEMultipart("alternative")
    message["Subject"] = subject
    message["From"] = settings.smtp_from
    message["To"] = to
    message.attach(MIMEText(html, "html"))
    await aiosmtplib.send(
        message,
        hostname=settings.smtp_host,
        port=settings.smtp_port,
        username=settings.smtp_user,
        password=settings.smtp_password,
        start_tls=True,
    )


async def send_verification_email(to: str, token: str) -> None:
    link = f"{settings.app_url}/verify?token={token}"
    html = f"""
    <div style="font-family:sans-serif;max-width:480px;margin:auto">
      <h2>Verify your Continium account</h2>
      <p>Click the button below to verify your email. The link expires in <strong>24 hours</strong>.</p>
      <a href="{link}" style="display:inline-block;padding:12px 24px;background:#00BCD4;color:#fff;text-decoration:none;border-radius:6px">Verify Email</a>
      <p style="color:#888;font-size:12px;margin-top:24px">If you didn't create a Continium account, ignore this email.</p>
    </div>
    """
    await send_email(to, "Verify your Continium account", html)


async def send_password_reset_email(to: str, token: str) -> None:
    link = f"{settings.app_url}/reset-password?token={token}"
    html = f"""
    <div style="font-family:sans-serif;max-width:480px;margin:auto">
      <h2>Reset your Continium password</h2>
      <p>Click the button below to set a new password. The link expires in <strong>1 hour</strong>.</p>
      <a href="{link}" style="display:inline-block;padding:12px 24px;background:#00BCD4;color:#fff;text-decoration:none;border-radius:6px">Reset Password</a>
      <p style="color:#888;font-size:12px;margin-top:24px">If you didn't request this, ignore this email.</p>
    </div>
    """
    await send_email(to, "Reset your Continium password", html)
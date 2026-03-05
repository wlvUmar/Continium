import httpx
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)


async def send_email(to: str, subject: str, html: str) -> None:
    if not settings.resend_api_key:
        logger.warning("RESEND_API_KEY not set — skipping email to %s", to)
        return
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "https://api.resend.com/emails",
            headers={"Authorization": f"Bearer {settings.resend_api_key}"},
            json={
                "from": settings.smtp_from,
                "to": [to],
                "subject": subject,
                "html": html,
            },
            timeout=10,
        )
        resp.raise_for_status()
        logger.info("Email sent to %s (id=%s)", to, resp.json().get("id"))


async def send_verification_email(to: str, token: str) -> None:
    link = f"{settings.app_url}/#/verify?token={token}"
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
    link = f"{settings.app_url}/#/reset-password?token={token}"
    html = f"""
    <div style="font-family:sans-serif;max-width:480px;margin:auto">
      <h2>Reset your Continium password</h2>
      <p>Click the button below to set a new password. The link expires in <strong>1 hour</strong>.</p>
      <a href="{link}" style="display:inline-block;padding:12px 24px;background:#00BCD4;color:#fff;text-decoration:none;border-radius:6px">Reset Password</a>
      <p style="color:#888;font-size:12px;margin-top:24px">If you didn't request this, ignore this email.</p>
    </div>
    """
    await send_email(to, "Reset your Continium password", html)
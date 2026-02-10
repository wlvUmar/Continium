"""
Auth service (business logic).

TODO:
- register(): validate email uniqueness, hash password, create user
- login(): verify password, issue access+refresh tokens
- refresh(): validate refresh token, issue new access token (+ maybe rotate refresh)
- logout(): invalidate refresh token (only possible if stored server-side)
- me_get/me_update(): read/update current user
- verify(): mark user verified using verification token
- change_password(): verify identity then update password_hash

NOTES:
- Keep JWT/hashing helpers in core.security
- Use repos.user_repo for DB operations
"""

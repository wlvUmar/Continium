"""
Auth endpoints (HTTP layer only).

TODO endpoints:
- POST /auth/register
- POST /auth/login
- POST /auth/refresh
- POST /auth/logout
- GET  /auth/me
- PUT  /auth/me
- GET  /auth/verify
- POST /auth/change-password

RULE:
- Parse request -> call auth_service -> return schema/HTTP codes
- Do not write SQL here.
"""

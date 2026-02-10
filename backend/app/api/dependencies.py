"""
FastAPI dependencies.

Endpoint instructions:
- Import dependencies from this module (not directly from other layers).
- Use `db: AsyncSession = Depends(get_db)` in endpoints that need DB access.

TODO:
- get_current_user():
  - read Authorization: Bearer <token>
  - decode JWT
  - load user from DB
- Optional: require_verified_user(), require_active_user()
"""

from backend.app.db.session import get_db

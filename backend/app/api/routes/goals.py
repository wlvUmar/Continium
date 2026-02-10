"""
Goals endpoints (HTTP layer only).

TODO endpoints:
- GET    /goals
- POST   /goals
- GET    /goals/{goal_id}
- PUT    /goals/{goal_id} (or PATCH)
- DELETE /goals/{goal_id}

RULE:
- Use get_current_user dependency
- Call goal_service methods
"""

from backend.app.api import get_db

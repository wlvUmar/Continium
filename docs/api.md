# API Endpoints (MVP)

All responses are JSON. Auth uses `Authorization: Bearer <token>`.

| Method | Path | Description |
| --- | --- | --- |
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login and receive tokens |
| GET | `/auth/me` | Get current user |
| GET | `/goals` | List goals |
| POST | `/goals` | Create goal |
| GET | `/goals/{goal_id}` | Get goal by id |
| PUT | `/goals/{goal_id}` | Update goal |
| DELETE | `/goals/{goal_id}` | Delete goal |
| POST | `/stats` | Add goal log entry |
| GET | `/stats/{goal_id}` | List or summarize stats for a goal |
| GET | `/stats/overall` | Overall summary (last 7 days) |

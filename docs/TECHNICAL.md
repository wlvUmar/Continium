# 🛠️ Technical Document

**Project:** Continium — Goal & Time Tracking Application  
**Version:** 1.0  
**Author:** Umar Tolibov  
**Date:** 2026-03-07

> **Live URL:** https://continium.uz  
> **API URL:** http://178.128.37.233:8000/api/v1  
> **Health:** http://178.128.37.233:8000/health

---

## 1. Overview

Continium is a full-stack web application for personal goal and time management. Users create goals, log work sessions against them, and view aggregated statistics to track their progress over time.

---

## 2. Tech Stack

### Backend

| Component | Technology |
|-----------|------------|
| Language | Python 3.12 |
| Framework | FastAPI 0.128.7 |
| ASGI Server | Uvicorn 0.40.0 |
| ORM | SQLAlchemy 2.0.46 (async) |
| Database | SQLite (dev) / PostgreSQL-ready (asyncpg) |
| Auth | PyJWT 2.11.0, Argon2 password hashing (pwdlib 0.3) |
| Validation | Pydantic 2.12.5 |
| Migrations | Alembic |
| Email | aiosmtplib 3.0.1 / Resend HTTP API (switchable) |
| Testing | pytest, pytest-asyncio, anyio |

### Frontend

| Component | Technology |
|-----------|------------|
| Language | Vanilla JavaScript (ES6+) |
| Routing | Custom hash-based router (`js/core/router.js`) |
| HTTP Client | Fetch API with Bearer token auth wrapper |
| State Storage | localStorage (tokens, user data, goal colours) |
| Styling | Plain CSS (no frameworks or build tools) |

### Infrastructure

| Component | Technology |
|-----------|------------|
| Containers | Docker (backend: `python:3.12-slim`, frontend: `nginx:alpine`) |
| Orchestration | Docker Compose (local dev) |
| Production | DigitalOcean Droplet (Ubuntu 24.04), manual Docker |
| CI | GitHub Actions — runs pytest on PR |
| CD | GitHub Actions — builds image, pushes to GHCR, SSH-deploys to droplet |
| HTTPS | Let's Encrypt via Certbot, HSTS headers via Nginx |

---

## 3. Directory Structure

```
Continium/
├── backend/
│   ├── main.py                        Entry point (FastAPI app init, lifespan)
│   ├── Dockerfile
│   ├── pytest.ini
│   └── app/
│       ├── main.py                    App factory (middleware, routers)
│       ├── core/
│       │   ├── config.py              Settings (env vars via pydantic-settings)
│       │   ├── security.py            JWT encode/decode, password hashing
│       │   └── logging_setup.py       Coloured console + file logging
│       ├── api/
│       │   ├── router.py              Aggregates all sub-routers under /api/v1
│       │   ├── dependencies.py        Shared FastAPI dependencies (get_db)
│       │   └── routes/
│       │       ├── auth.py            Auth endpoints
│       │       ├── goals.py           Goal CRUD endpoints
│       │       └── stats.py           Stats logging & aggregation endpoints
│       ├── services/
│       │   ├── auth_service.py        Auth business logic
│       │   ├── goal_service.py        Goal business logic
│       │   └── stat_service.py        Stats aggregation logic
│       ├── db/
│       │   ├── base.py                SQLAlchemy declarative Base
│       │   ├── session.py             Async engine + session factory
│       │   ├── models/
│       │   │   ├── user.py            User ORM model
│       │   │   ├── goal.py            Goal ORM model
│       │   │   └── stats.py           Stats ORM model
│       │   └── dal/                   Data Access Layer
│       │       ├── user.py            User DB queries
│       │       ├── goal.py            Goal DB queries
│       │       └── stats.py           Stats DB queries
│       ├── schemas/                   Pydantic DTOs (request/response shapes)
│       │   ├── user.py                UserCreate, UserOut
│       │   ├── goal.py                GoalCreate, GoalUpdate, GoalOut
│       │   ├── stat.py                StatCreate, StatOut, OverallOut
│       │   └── auth.py                LoginRequest, TokenResponse, etc.
│       └── utils/
│           └── smtp.py                Email sending (verification, reset)
│
├── frontend/
│   ├── index.html                     Single HTML entry point
│   ├── Dockerfile
│   ├── nginx.conf
│   └── js/
│       ├── app.js                     Route registration
│       ├── core/
│       │   ├── api.js                 Fetch wrapper (auth headers, errors)
│       │   ├── router.js              Hash-based router
│       │   └── route-protection.js    Auth guard (redirect to /login)
│       ├── pages/
│       │   ├── goals.js               Goals list (active + completed)
│       │   ├── goal-detail.js         Single goal view + time logging
│       │   ├── add-goal.js            Create goal form
│       │   ├── statistics.js          Stats dashboard with charts
│       │   ├── profile.js             User profile + change password
│       │   └── auth/                  Login, register, verify, reset pages
│       ├── services/
│       │   └── auth.service.js        Login, logout, token management
│       └── components/
│           ├── layout.js              Navbar + logout
│           ├── toast.js               Toast notifications (auto-dismiss)
│           ├── spinner.js             Loading spinner
│           └── error-message.js       Error display block
│
├── .github/workflows/                 CI/CD pipelines
├── docker-compose.yml
├── docs/                              Project documentation
└── README.md
```

---

## 4. Database Schema

### Tables

#### `users`
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PK, AUTOINCREMENT |
| full_name | VARCHAR(200) | NOT NULL |
| email | VARCHAR(255) | NOT NULL, UNIQUE, INDEXED |
| password_hash | VARCHAR(255) | NOT NULL |
| image_url | VARCHAR(500) | NULLABLE |
| is_active | BOOLEAN | DEFAULT TRUE |
| verified | BOOLEAN | DEFAULT FALSE |

#### `goals`
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PK, AUTOINCREMENT |
| user_id | INTEGER | FK → users.id, INDEXED, ON DELETE CASCADE |
| title | VARCHAR(200) | NOT NULL |
| type | VARCHAR(50) | NOT NULL |
| start_date | DATE | NOT NULL |
| deadline | DATE | NOT NULL |
| frequency | ENUM | daily \| weekly \| monthly |
| duration_min | INTEGER | CHECK ≥ 0 |
| is_complete | BOOLEAN | DEFAULT FALSE |

#### `stats`
| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER | PK, AUTOINCREMENT |
| goal_id | INTEGER | FK → goals.id, INDEXED, ON DELETE CASCADE |
| user_id | INTEGER | FK → users.id, INDEXED, ON DELETE CASCADE |
| occurred_at | DATETIME TZ | INDEXED, DEFAULT now() |
| duration_minutes | INTEGER | CHECK ≥ 0 |

### Relationships

```
users  1 ──< goals   (one user has many goals)
users  1 ──< stats   (one user has many stat records)
goals  1 ──< stats   (one goal has many stat records)
```

> **Cascade:** Deleting a user removes all their goals and stats. Deleting a goal removes all its stat records.

---

## 5. API Reference

**Base URL:** `/api/v1`  
**Auth:** `Authorization: Bearer <access_token>` (marked 🔒)

### Auth `/auth`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | — | Register new user; sends verification email |
| POST | `/auth/login` | — | Login; returns access + refresh tokens |
| POST | `/auth/verify` | — | Verify email with token |
| POST | `/auth/forgot-password` | — | Send password reset email |
| POST | `/auth/reset-password` | — | Reset password with token |
| GET | `/auth/me` | 🔒 | Get current user profile |
| POST | `/auth/refresh` | — | Rotate tokens |
| POST | `/auth/change-password` | 🔒 | Change password |

### Goals `/goals`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/goals/` | 🔒 | Create a new goal |
| GET | `/goals/` | 🔒 | List all goals (paginated) |
| GET | `/goals/{goal_id}` | 🔒 | Get a single goal |
| PUT | `/goals/{goal_id}` | 🔒 | Update a goal |
| DELETE | `/goals/{goal_id}` | 🔒 | Delete a goal |
| PATCH | `/goals/{goal_id}/complete` | 🔒 | Toggle completion status |
| GET | `/goals/search?name=` | 🔒 | Search goals by title |
| GET | `/goals/by-date/{date}` | 🔒 | Goals active on a date |
| GET | `/goals/filter-by-completion?is_complete=` | 🔒 | Filter by completion |

### Stats `/stats`

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/stats/goal/{goal_id}` | 🔒 | Log time for a goal |
| GET | `/stats/goal/{goal_id}` | 🔒 | Get all stats for a goal |
| GET | `/stats/{goal_id}/by-date-range` | 🔒 | Stats within date range |
| GET | `/stats/overall` | 🔒 | Total minutes per goal |
| GET | `/stats/overall-by-type?type=` | 🔒 | Total minutes filtered by goal type |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Returns `{ status: "ok" }` |

---

## 6. Key Algorithms & Logic

### 6.1 JWT Authentication Flow

```
Login:
  1. Validate email exists in DB; verify password with Argon2
  2. Generate access token  (TTL: 15 min)  → { sub: user_id, type: "access" }
  3. Generate refresh token (TTL: 30 days) → { sub: user_id, type: "refresh" }
  4. Return both tokens to client

Token Refresh (rotation):
  1. Decode refresh token; validate type == "refresh"
  2. Issue brand-new access + refresh pair
  3. Old refresh token implicitly invalidated

Route Protection (FastAPI dependency):
  1. Extract Bearer token from Authorization header
  2. Decode JWT with HS256 + secret key
  3. Assert type == "access" and not expired
  4. Fetch user from DB by sub (user_id)
  5. Return user or raise HTTP 401/403
```

### 6.2 Stats Daily Aggregation

When a user logs time for a goal (`POST /stats/goal/{id}`):

```
existing = query Stats WHERE goal_id == id
                         AND date(occurred_at) == today
                         AND user_id == current_user

IF existing:
    existing.duration_minutes += new_duration   → UPDATE
ELSE:
    INSERT new Stats record
```

One row per goal per day — repeated logs accumulate rather than creating duplicate rows.

### 6.3 Overall Stats Aggregation

```sql
SELECT goals.title, SUM(stats.duration_minutes)
FROM stats
JOIN goals ON stats.goal_id = goals.id
WHERE stats.user_id = current_user
GROUP BY goals.title
```

Returns: `{ "goal_title": total_minutes, ... }`

### 6.4 Email Delivery

- **Primary:** Resend HTTP API (`RESEND_API_KEY`)
- **Fallback:** SMTP/Gmail (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`)
- Sent via `asyncio.create_task()` — non-blocking background task
- Forgot-password always returns HTTP 200 regardless of email existence (prevents enumeration)

### 6.5 Frontend Routing

- Hash-based: all routes use `#/path` format
- `router.js` parses `window.location.hash`, matches patterns (supports `:id` params)
- `route-protection.js` wraps every protected handler:
  - No `access_token` in localStorage → redirect to `/login`
- On logout: `localStorage.clear()` — synchronous, no API call

---

## 7. Configuration & Environment Variables

| Variable | Default / Example | Description |
|----------|------------------|-------------|
| `DATABASE_URL` | `sqlite+aiosqlite:///./app.db` | DB connection string |
| `JWT_SECRET` | `<random 32+ char string>` | HMAC-SHA256 signing key |
| `JWT_ALG` | `HS256` | JWT algorithm |
| `ACCESS_TOKEN_TTL` | `900` | Access token lifetime (seconds) |
| `REFRESH_TOKEN_TTL` | `2592000` | Refresh token lifetime (seconds) |
| `ENV` | `dev` | `"dev"` or `"prod"` |
| `DEBUG` | `True` | Debug mode flag |
| `CORS_ORIGINS` | `http://localhost:3000,...` | Allowed CORS origins (comma-separated) |
| `SMTP_HOST` | `smtp.gmail.com` | SMTP server host |
| `SMTP_PORT` | `587` | SMTP port |
| `SMTP_USER` | `your@email.com` | SMTP sender address |
| `SMTP_PASSWORD` | `<app password>` | SMTP password |
| `RESEND_API_KEY` | `re_xxxx` | Resend API key (optional) |
| `APP_URL` | `https://continium.uz` | Used in email links |

---

## 8. CI/CD Pipeline

### CI — `.github/workflows/ci.yml`

**Trigger:** Pull request to `dev` or `main`

| Step | Action |
|------|--------|
| 1 | Checkout code |
| 2 | Set up Python 3.12 |
| 3 | `pip install -r requirements.txt` + pytest + anyio |
| 4 | Run `pytest` (asyncio_mode=auto via `pytest.ini`) |

### CD — `.github/workflows/deploy.yml`

**Trigger:** Push to `main`

| Step | Action |
|------|--------|
| 1 | Build Docker image for backend |
| 2 | Push to `ghcr.io/wlvumar/continium-backend` |
| 3 | SSH into DigitalOcean droplet (`178.128.37.233`) |
| 4 | `docker pull` latest image |
| 5 | Stop + remove old container |
| 6 | `docker run` new container (port 8000, `/data` volume for SQLite) |

**Required GitHub Secrets:** `SSH_PRIVATE_KEY`, `SSH_USER`, `SERVER_IP`, `GHCR_TOKEN`

---

## 9. Security Notes

| Area | Implementation |
|------|---------------|
| Password storage | Argon2 (memory-hard, brute-force resistant) |
| Session tokens | JWT HS256; access tokens expire in 15 minutes |
| Token rotation | New access + refresh pair issued on every `/auth/refresh` |
| Ownership checks | Every goal/stats endpoint verifies `user_id == current_user.id` |
| CORS | Restricted to known origins only |
| Transport | HTTPS enforced via Let's Encrypt; HSTS header set in Nginx |
| Email enumeration | Forgot-password always returns 200 |
| Secrets | `.env` excluded from version control (`.gitignore`) |
| Docker | Image excludes `venv/`, `.env`, `__pycache__` (`.dockerignore`) |

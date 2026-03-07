<div align="center">

# Continium

**A full-stack goal & time tracking web application**

[![Live](https://img.shields.io/badge/Live-continium.uz-4CAF50?style=flat)](https://continium.uz)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.128-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=flat&logo=python&logoColor=white)](https://python.org)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat&logo=docker&logoColor=white)](https://docker.com)

🔗 **[continium.uz](https://continium.uz)**

</div>

---

## What it does

Continium lets users create goals, log work sessions against them, and track progress over time. It supports one-time and repeating goals (daily, weekly, monthly), and aggregates time stats by goal, type, or custom date range.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | FastAPI, Python 3.12, Uvicorn |
| **Database** | SQLite + aiosqlite (async), SQLAlchemy 2.0 ORM, Alembic |
| **Auth** | JWT (HS256), Argon2 password hashing, email verification |
| **Email** | Resend API via async httpx |
| **Frontend** | Vanilla JavaScript, custom hash-based SPA router |
| **Web Server** | Nginx — reverse proxy + HTTPS + SPA fallback |
| **Infrastructure** | Docker Compose, GitHub Actions CI/CD, DigitalOcean |

---

## Features

**Authentication**
- Email + password registration with email verification
- Access token (15 min) + refresh token (30 days) with rotation
- Forgot / reset password — email enumeration safe

**Goals**
- Full CRUD with goal types (One Time / Repeating) and frequencies
- Filter by date, completion status, or title search

**Time Tracking & Stats**
- Log work sessions per goal; same-day entries auto-aggregate
- Overall stats per goal, filtered by type or date range

**Frontend**
- Zero-build Vanilla JS SPA with hash routing and JWT route guards
- Toast notifications, loading states, inline error handling

---

## Architecture

Clean, layered backend with full async I/O throughout:

```
FastAPI Routes → Service Layer → DAL → SQLAlchemy (aiosqlite) → SQLite
```

```
continium/
├── backend/
│   └── app/
│       ├── api/routes/        # auth, goals, stats
│       ├── services/          # business logic & authorization
│       ├── db/
│       │   ├── models/        # ORM models (users, goals, stats)
│       │   └── dal/           # data access layer
│       ├── schemas/           # Pydantic request/response schemas
│       └── core/              # JWT, Argon2, config
├── frontend/
│   └── js/
│       ├── core/              # router, API wrapper, route guard
│       ├── pages/             # per-page modules
│       └── components/        # toast, spinner, layout
└── docker-compose.yml
```

---

## API

Base URL: `https://continium.uz/api/v1` · Docs: [`/docs`](https://continium.uz/docs)

<details>
<summary><strong>Auth</strong> — 8 endpoints</summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/register` | Register + send verification email |
| `POST` | `/auth/login` | Login, returns access + refresh tokens |
| `POST` | `/auth/refresh` | Rotate token pair |
| `GET` | `/auth/me` | Current user profile |
| `POST` | `/auth/verify` | Verify email |
| `POST` | `/auth/forgot-password` | Request password reset |
| `POST` | `/auth/reset-password` | Reset with token |
| `POST` | `/auth/change-password` | Change password (authenticated) |

</details>

<details>
<summary><strong>Goals</strong> — 9 endpoints</summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/goals/` | Create goal |
| `GET` | `/goals/` | List goals (paginated) |
| `GET` | `/goals/search?name=` | Search by title |
| `GET` | `/goals/by-date/{date}` | Goals active on date |
| `GET` | `/goals/filter-by-completion` | Filter by completion |
| `GET` | `/goals/{id}` | Get goal |
| `PUT` | `/goals/{id}` | Update goal |
| `DELETE` | `/goals/{id}` | Delete goal |
| `PATCH` | `/goals/{id}/complete` | Toggle completion |

</details>

<details>
<summary><strong>Statistics</strong> — 5 endpoints</summary>

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/stats/goal/{id}` | Log work session |
| `GET` | `/stats/goal/{id}` | Stats for a goal |
| `GET` | `/stats/overall` | Totals per goal |
| `GET` | `/stats/overall-by-type` | Totals by goal type |
| `GET` | `/stats/{id}/by-date-range` | Stats in date range |

</details>

---

## Deployment

Deployed on a DigitalOcean droplet with Docker Compose. GitHub Actions handles CI/CD:

- **On PR** → runs `pytest`
- **On merge to `main`** → builds Docker images, pushes to GHCR, SSH deploys to the droplet

Nginx handles HTTPS (Let's Encrypt), HSTS, and API reverse proxy.

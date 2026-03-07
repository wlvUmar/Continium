# Continium — System Architecture

## 1. System Overview

```mermaid
graph TB
    subgraph Client["🖥️ Client Browser"]
        FE["Frontend\nVanilla JS + CSS\nnginx:alpine container"]
    end

    subgraph Server["☁️ DigitalOcean Droplet (Ubuntu 24.04)"]
        NGINX["Nginx Reverse Proxy\nHTTPS (Let's Encrypt)\nHTSTS Headers"]
        BE["Backend API\nFastAPI + Uvicorn\npython:3.12-slim container"]
        DB[(SQLite\napp.db\npersistent volume)]
    end

    subgraph CICD["⚙️ GitHub Actions"]
        CI["CI Workflow\nrun pytest on PR"]
        CD["CD Workflow\nbuild → push GHCR → SSH deploy"]
    end

    subgraph Email["📧 Email Service"]
        RESEND["Resend HTTP API\n(verification & reset)"]
    end

    FE -- "HTTPS requests\n/api/v1/*" --> NGINX
    NGINX -- "proxy_pass :8000" --> BE
    BE -- "SQLAlchemy async\naiosqlite" --> DB
    BE -- "HTTP API\nasyncio.create_task" --> RESEND

    CD -- "SSH + docker pull" --> Server
    CI -- "pytest" --> BE
```

---

## 2. Backend Layer Architecture

```mermaid
graph LR
    subgraph API["API Layer  /api/v1"]
        AUTH["auth.py\n/auth/*"]
        GOALS["goals.py\n/goals/*"]
        STATS["stats.py\n/stats/*"]
    end

    subgraph Services["Service Layer"]
        AS["auth_service.py"]
        GS["goal_service.py"]
        SS["stat_service.py"]
    end

    subgraph DAL["Data Access Layer"]
        DU["dal/user.py"]
        DG["dal/goal.py"]
        DS["dal/stats.py"]
    end

    subgraph Core["Core"]
        SEC["security.py\nJWT encode/decode\nArgon2 hashing"]
        CFG["config.py\npydantic-settings\n.env vars"]
    end

    DB[(SQLite)]

    AUTH --> AS --> DU
    GOALS --> GS --> DG
    STATS --> SS --> DS
    AS --> SEC
    GS --> SEC
    SS --> SEC
    DU & DG & DS --> DB
```

---

## 3. Database Schema

```mermaid
erDiagram
    USERS {
        int id PK
        varchar full_name
        varchar email UK
        varchar password_hash
        varchar image_url
        bool is_active
        bool verified
    }

    GOALS {
        int id PK
        int user_id FK
        varchar title
        varchar type
        date start_date
        date deadline
        enum frequency
        int duration_min
        bool is_complete
    }

    STATS {
        int id PK
        int goal_id FK
        int user_id FK
        datetime occurred_at
        int duration_minutes
    }

    USERS ||--o{ GOALS : "owns"
    USERS ||--o{ STATS : "logs"
    GOALS ||--o{ STATS : "tracked by"
```

---

## 4. Authentication Flow

```mermaid
sequenceDiagram
    actor User
    participant FE as Frontend
    participant API as FastAPI
    participant DB as Database
    participant Email as Resend

    User->>FE: Register (full_name, email, password)
    FE->>API: POST /auth/register
    API->>DB: INSERT user (Argon2 hashed password)
    API->>Email: Send verification email (JWT token, 24h TTL)
    API-->>FE: UserOut

    User->>FE: Login (email, password)
    FE->>API: POST /auth/login
    API->>DB: Fetch user, verify Argon2 hash
    API-->>FE: access_token (15min) + refresh_token (30d)
    FE->>FE: Store tokens in localStorage

    User->>FE: Access protected page
    FE->>API: GET /goals/ + Authorization: Bearer <token>
    API->>API: Decode JWT, assert type=access, not expired
    API->>DB: Fetch user by sub (user_id)
    API-->>FE: Protected resource
```

---

## 5. CI/CD Pipeline

```mermaid
flowchart LR
    DEV["Developer\npushes code"] --> PR["Pull Request\nto dev/main"]
    PR --> CI["CI Workflow\n① checkout\n② pip install\n③ pytest"]
    CI -->|all tests pass| MERGE["Merge to main"]
    MERGE --> CD["CD Workflow\n① docker build\n② push → ghcr.io\n③ SSH to droplet\n④ docker pull + run"]
    CD --> PROD["🌐 continium.uz\nlive production"]
```

---

## 6. Frontend Routing

```mermaid
flowchart TD
    HASH["window.location.hash\n#/path"] --> ROUTER["router.js\nparse + match pattern"]
    ROUTER --> GUARD["route-protection.js\ncheck localStorage token"]
    GUARD -->|no token| LOGIN["redirect #/login"]
    GUARD -->|token present| HANDLER["Page Handler\nfetch API + render DOM"]
    HANDLER --> API["api.js\nfetch wrapper\nBearer token + error parsing"]
    API --> BACKEND["FastAPI\n/api/v1/*"]
```

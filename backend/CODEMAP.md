# Project Directory Map


- `app/`  
  Main application package containing all source code.

---

- `app/main.py`  
  Application entry point. Initializes the web application and registers routes.

---

- `app/core/`  
  Shared application utilities and configuration.
  - `config.py`  
    Application configuration and environment settings.
  - `security.py`  
    Security-related helpers such as token and password utilities.

---

- `app/api/`  
  HTTP interface layer.
  - `router.py`  
    Central router that aggregates all API routes.
  - `deps.py`  
    Shared dependencies used by API routes.
  - `routes/`  
    Endpoint definitions grouped by domain.
    - `auth.py`  
      Authentication and account-related endpoints.
    - `goals.py`  
      Goal management endpoints.
    - `stats.py`  
      Statistics and reporting endpoints.

---

- `app/services/`  
  Application-level logic and workflows.
  - `auth_service.py`  
    Authentication and account workflows.
  - `goal_service.py`  
    Goal-related operations and coordination.
  - `stat_service.py`  
    Statistics processing and aggregation logic.

---

- `app/repos/`  
  Database access layer.
  - `user_repo.py`  
    User-related data access.
  - `goal_repo.py`  
    Goal-related data access.
  - `stat_repo.py`  
    Statistics-related data access.

---

- `app/db/`  
  Database configuration and models.
  - `session.py`  
    Database engine and session management.
  - `base.py`  
    Base database model definition.
  - `models/`  
    Database table definitions.
    - `user.py`  
      User model.
    - `goal.py`  
      Goal model.
    - `stat.py`  
      Statistics model.

---

- `app/schemas/`  
  Data validation and serialization models.
  - `user.py`  
    User data schemas.
  - `auth.py`  
    Authentication-related schemas.
  - `goal.py`  
    Goal data schemas.
  - `stat.py`  
    Statistics data schemas.



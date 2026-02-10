# Continium

Goal: A lightweight goal-tracking API with authentication, goals CRUD, and analytics logs.

MVP Scope:
- Auth: register, login, me
- Goals: CRUD
- Analytics: add log + overall summary

Process Rules (Lightweight):
- Branches: `main` (stable), `dev` (integration), `feat/*` (features)
- No direct pushes to `main`; all changes via PRs to `dev`
- One feature = one branch = one PR
- Every PR references an issue (e.g., `Closes #12`)

How To Run (Backend):
1. Create and activate a virtual environment.
2. Install dependencies: `pip install -r requirements.txt`
3. Run the API: `uvicorn backend.app.main:app --reload`

Docs:
- MVP scope: `docs/mvp-scope.md`
- API endpoints: `docs/api.md`
- Risk register: `docs/risk-register.md`
- Issue backlog: `docs/issues-backlog.md`
- Checklist board: `docs/board.md`
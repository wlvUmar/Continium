# Contributing

**Project:** Continium — Goal & Time Tracking Application
**Author:** Umar Tolibov

---

## Branch Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Stable, production-ready code |
| `dev` | Integration branch — all PRs target here |
| `feat/*` | Individual feature or fix branches |

No direct pushes to `main`. All changes go through a PR to `dev` first.

---

## Workflow

1. Branch off `dev` using the naming convention `feat/<short-description>`
2. Make focused, atomic commits — one logical change per commit
3. Open a PR to `dev` and link the relevant issue (e.g., `Closes #12`)
4. CI runs `pytest` automatically on every PR — all tests must pass before merge
5. Merges to `main` trigger the CD pipeline and deploy to production

---

## Commit Style

- Use short, imperative subject lines (`Add goal search endpoint`, not `Added...`)
- Keep subject lines at or under 72 characters
- Avoid mega-commits — split unrelated changes into separate PRs

---

## Code Standards

- Backend: follow the existing layered structure — Routes → Services → DAL
- New endpoints must have Pydantic schemas for both request and response
- Secrets and credentials must never be hardcoded or committed

# Requirements Document

**Project:** Continium — Goal & Time Tracking Application 
**Version:** 1.0 
**Author:** Umar Tolibov 
**Date:** 2026-03-07

---

## 1. Project Overview

### 1.1 Purpose

Continium is a personal productivity web application that allows individuals to define goals, track time spent working on them, and analyse their progress through statistics and visualisations.

### 1.2 Problem Statement

People who set personal goals often lack a structured way to:

- Record what they are working toward with deadlines and frequency
- Log the actual time invested per session
- See an honest summary of where their time goes across all goals

Continium solves this by combining goal management with a time-tracking journal and a statistics dashboard in one lightweight web app.

### 1.3 Target Users

| User Type | Description |
|-----------|-------------|
| Students | Managing coursework, projects, and self-study targets |
| Professionals | Tracking side projects or learning goals |
| General | Anyone who wants a simple, private record of personal commitments |

---

## 2. Functional Requirements

### 2.1 User Authentication

| ID | Requirement |
|----|-------------|
| FR-01 | A new user must be able to register with full name, email, and password |
| FR-02 | The system must send an email verification link upon registration |
| FR-03 | A user must verify their email before gaining full access |
| FR-04 | A registered user must be able to log in with email and password and receive an access token and a refresh token |
| FR-05 | A user must be able to request a password reset link via email |
| FR-06 | A user must be able to reset their password using the token from the reset email |
| FR-07 | A logged-in user must be able to change their current password |
| FR-08 | The system must support token refresh to extend a session without re-login |
| FR-09 | A user must be able to log out, which clears all locally stored credentials |

### 2.2 Goal Management

| ID | Requirement |
|----|-------------|
| FR-10 | A logged-in user must be able to create a goal with: title, type (One Time \| Repeating), start date, deadline, frequency (daily \| weekly \| monthly), target duration in minutes |
| FR-11 | A user must be able to view a list of all their goals |
| FR-12 | A user must be able to view the details of a single goal |
| FR-13 | A user must be able to edit any field of an existing goal |
| FR-14 | A user must be able to mark a goal as complete or incomplete (toggle) |
| FR-15 | A user must be able to delete a goal; all associated time records must be deleted automatically |
| FR-16 | A user must be able to search for goals by title (partial match) |
| FR-17 | A user must be able to filter goals by completion status (active \| completed) |
| FR-18 | A user must be able to retrieve goals active on a specific date (`start_date <= date <= deadline`) |

### 2.3 Time Tracking

| ID | Requirement |
|----|-------------|
| FR-19 | A logged-in user must be able to log a work session for a goal, specifying duration in minutes |
| FR-20 | If the user logs time for the same goal on the same calendar day more than once, durations must be summed (no duplicate rows per goal per day) |
| FR-21 | A user must be able to view all time records for a specific goal |
| FR-22 | A user must be able to view time records for a goal within a specified date range |

### 2.4 Statistics & Analytics

| ID | Requirement |
|----|-------------|
| FR-23 | A user must be able to view total minutes logged across all their goals, grouped by goal title |
| FR-24 | A user must be able to filter the overall statistics view by goal type (One Time \| Repeating) |
| FR-25 | The statistics page must display data visually (charts/graphs) |

### 2.5 User Profile

| ID | Requirement |
|----|-------------|
| FR-26 | A logged-in user must be able to view their profile (name, email) |
| FR-27 | Profile data must be updated locally after a password change |

### 2.6 System / Health

| ID | Requirement |
|----|-------------|
| FR-28 | The system must expose a public health-check endpoint that returns a status indicator |
| FR-29 | Database tables must be created automatically on first startup (no manual migration required) |

---

## 3. Non-Functional Requirements

### 3.1 Security

| ID | Requirement |
|----|-------------|
| NFR-01 | Passwords must never be stored in plain text — Argon2 hashing required |
| NFR-02 | All authenticated endpoints must require a valid, non-expired JWT access token |
| NFR-03 | Every goal and stats endpoint must verify the requesting user owns the resource |
| NFR-04 | The forgot-password endpoint must always return HTTP 200 (prevent email enumeration) |
| NFR-05 | The application must enforce HTTPS in production with HSTS headers |
| NFR-06 | CORS must be restricted to explicitly allowed origins only |
| NFR-07 | Secrets must never be committed to version control |

### 3.2 Performance

| ID | Requirement |
|----|-------------|
| NFR-08 | List endpoints must support pagination (`skip`/`limit`) |
| NFR-09 | The backend must handle requests asynchronously (`async/await`) |
| NFR-10 | Email sending must be non-blocking (background task) |

### 3.3 Reliability

| ID | Requirement |
|----|-------------|
| NFR-11 | Cascade deletes must ensure referential integrity |
| NFR-12 | The CI pipeline must run automated tests on every pull request |
| NFR-13 | The CD pipeline must automatically deploy on every successful push to main |

### 3.4 Usability

| ID | Requirement |
|----|-------------|
| NFR-14 | The frontend must be responsive (desktop and mobile) |
| NFR-15 | The application must provide meaningful error messages for validation and auth failures |
| NFR-16 | Loading states must be indicated with a spinner component |

### 3.5 Maintainability

| ID | Requirement |
|----|-------------|
| NFR-17 | The backend must follow a layered architecture: Routes → Services → DAL → DB Models |
| NFR-18 | All API endpoints must have Swagger/OpenAPI documentation |
| NFR-19 | Configuration must be managed through environment variables (never hardcoded) |
| NFR-20 | Database schema changes must be managed through Alembic migration scripts |

### 3.6 Portability / Deployment

| ID | Requirement |
|----|-------------|
| NFR-21 | The backend must be containerised with Docker and runnable with `docker-compose up` |
| NFR-22 | Production backend must run on a Linux server via Docker |
| NFR-23 | The frontend must be served via Nginx with no build step required |

---

## 4. User Stories

| ID | Story |
|----|-------|
| US-01 | As a new user, I want to register an account so that I can start tracking my goals privately |
| US-02 | As a registered user, I want to verify my email so that my account is activated |
| US-03 | As a user who forgot my password, I want to receive a reset link by email so that I can regain access |
| US-04 | As a logged-in user, I want to create a goal with a title, deadline, and type so that I can define what I am working toward |
| US-05 | As a logged-in user, I want to see a list of my active goals so that I can choose which one to work on today |
| US-06 | As a logged-in user, I want to log time against a goal so that I have a record of how much I worked on it |
| US-07 | As a logged-in user, I want the system to add to today's record if I log time twice in one day, so that I don't get duplicate entries |
| US-08 | As a logged-in user, I want to mark a goal as complete so that I can separate it from my active goals list |
| US-09 | As a logged-in user, I want to view statistics showing minutes spent per goal so that I can see where my time actually goes |
| US-10 | As a logged-in user, I want to filter statistics by goal type so that I can compare One Time vs Repeating effort |
| US-11 | As a logged-in user, I want to search for a goal by name so that I can quickly find it without scrolling |
| US-12 | As a logged-in user, I want to delete a goal and have all its time records removed automatically |

---

## 5. System Constraints

- Repository hosted at [github.com/wlvUmar/Continium](https://github.com/wlvUmar/Continium)
- Production database is SQLite (single-file); PostgreSQL migration possible but not required for v1
- Email delivery depends on Gmail SMTP or Resend API key; if unconfigured, email features are unavailable but the rest of the app remains functional
- Frontend is pure Vanilla JS with no build tools — eliminates Node.js build-time dependencies

---

## 6. Out of Scope (V1)

- Mobile native applications (iOS / Android)
- Team or collaborative goal sharing
- Calendar integration (Google Calendar, Outlook)
- Notifications / reminders (push notifications, scheduled emails)
- Social features (leaderboards, public goal sharing)
- Goal templates or categories beyond type/frequency
- Paid plans or subscription management

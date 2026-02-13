
# Mock API Server

This is a lightweight Python mock server 

## ▶️ How to Run

From project root:

```bash
python mock_server.py
```

Server will start at:

```
http://127.0.0.1:8000
```

You should see:

```
Mock API running: http://127.0.0.1:8000
```

---

## Available Endpoints

### Health Check

```
GET /health
```

---

### Auth (Mocked)

```
POST /auth/login
```

Returns:

```json
{
  "access_token": "mock-access-token",
  "refresh_token": "mock-refresh-token",
  "token_type": "bearer"
}
```

```
GET /auth/me
```

Returns user with id=1 (password hash excluded).

---

### Goals

```
GET /goals
GET /goals/{id}
POST /goals
PUT /goals/{id}
DELETE /goals/{id}
```

Filtering supported:

```
GET /goals?user_id=1
```

---

### Stats

```
GET /stats
GET /stats/{id}
POST /stats
PUT /stats/{id}
DELETE /stats/{id}
```

Filtering supported:

```
GET /stats?goal_id=1&user_id=1
```

---

## Data Storage

All data is stored in:

```
mock/db.json
```

Changes persist automatically when:

* Creating goals
* Updating goals
* Deleting goals
* Adding stats


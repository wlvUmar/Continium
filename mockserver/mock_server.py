import json
import os
import re
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import urlparse, parse_qs
from datetime import datetime, timezone, timedelta

DB_PATH = os.environ.get("MOCK_DB", os.path.join("mock", "db.json"))
HOST = os.environ.get("MOCK_HOST", "127.0.0.1")
PORT = int(os.environ.get("MOCK_PORT", "8000"))

TZ_TASHKENT = timezone(timedelta(hours=5))

def load_db():
    with open(DB_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def save_db(db):
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    with open(DB_PATH, "w", encoding="utf-8") as f:
        json.dump(db, f, ensure_ascii=False, indent=2)

def next_id(items):
    if not items:
        return 1
    return max(int(x.get("id", 0)) for x in items) + 1

def now_iso():
    return datetime.now(TZ_TASHKENT).isoformat()

def json_body(handler):
    length = int(handler.headers.get("Content-Length", "0") or "0")
    if length <= 0:
        return {}
    raw = handler.rfile.read(length).decode("utf-8")
    return json.loads(raw) if raw.strip() else {}

def cors_headers(handler):
    handler.send_header("Access-Control-Allow-Origin", "*")
    handler.send_header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS")
    handler.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")

class MockHandler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        # quiet
        return

    def _send(self, code, payload=None):
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        cors_headers(self)
        self.end_headers()
        if payload is not None:
            self.wfile.write(json.dumps(payload, ensure_ascii=False).encode("utf-8"))

    def do_OPTIONS(self):
        self.send_response(204)
        cors_headers(self)
        self.end_headers()

    def do_GET(self):
        db = load_db()
        parsed = urlparse(self.path)
        path = parsed.path.rstrip("/")
        qs = parse_qs(parsed.query)

        # /health
        if path == "/health":
            return self._send(200, {"ok": True})

        m = re.fullmatch(r"/(users|goals|stats)", path)
        if m:
            col = m.group(1)
            items = db.get(col, [])
            # filtering by query params equals match
            # e.g. /goals?user_id=1, /stats?goal_id=1&user_id=1
            filtered = items
            for k, v in qs.items():
                if not v:
                    continue
                val = v[0]
                filtered = [it for it in filtered if str(it.get(k)) == val]
            return self._send(200, filtered)

        # Item endpoints: /goals/1, /users/1, /stats/1
        m = re.fullmatch(r"/(users|goals|stats)/(\d+)", path)
        if m:
            col, sid = m.group(1), int(m.group(2))
            items = db.get(col, [])
            item = next((x for x in items if int(x.get("id", 0)) == sid), None)
            if not item:
                return self._send(404, {"detail": f"{col} #{sid} not found"})
            return self._send(200, item)

        if path == "/auth/me":
            user = next((u for u in db.get("users", []) if u.get("id") == 1), None)
            if not user:
                return self._send(404, {"detail": "user not found"})
            safe = {k: v for k, v in user.items() if k != "password_hash"}
            return self._send(200, safe)

        return self._send(404, {"detail": "not found"})

    def do_POST(self):
        db = load_db()
        parsed = urlparse(self.path)
        path = parsed.path.rstrip("/")
        body = json_body(self)

        if path == "/auth/login":
            return self._send(200, {
                "access_token": "mock-access-token",
                "refresh_token": "mock-refresh-token",
                "token_type": "bearer"
            })

        m = re.fullmatch(r"/(goals|stats)", path)
        if not m:
            return self._send(404, {"detail": "not found"})
        col = m.group(1)
        items = db.get(col, [])
        new_item = dict(body)

        new_item["id"] = next_id(items)

        if col == "goals":
            new_item.setdefault("is_complete", False)
            for req in ["title", "type", "start_date", "deadline", "frequency", "duration_min", "user_id"]:
                new_item.setdefault(req, None)

        if col == "stats":
            new_item.setdefault("occurred_at", now_iso())
            for req in ["goal_id", "user_id", "duration_minutes"]:
                new_item.setdefault(req, None)

        items.append(new_item)
        db[col] = items
        save_db(db)
        return self._send(201, new_item)

    def do_PUT(self):
        db = load_db()
        parsed = urlparse(self.path)
        path = parsed.path.rstrip("/")
        body = json_body(self)

        m = re.fullmatch(r"/(goals|stats)/(\d+)", path)
        if not m:
            return self._send(404, {"detail": "not found"})
        col, sid = m.group(1), int(m.group(2))
        items = db.get(col, [])
        idx = next((i for i, x in enumerate(items) if int(x.get("id", 0)) == sid), None)
        if idx is None:
            return self._send(404, {"detail": f"{col} #{sid} not found"})

        updated = dict(items[idx])
        for k, v in body.items():
            if k == "id":
                continue
            updated[k] = v

        items[idx] = updated
        db[col] = items
        save_db(db)
        return self._send(200, updated)

    def do_DELETE(self):
        db = load_db()
        parsed = urlparse(self.path)
        path = parsed.path.rstrip("/")

        m = re.fullmatch(r"/(goals|stats)/(\d+)", path)
        if not m:
            return self._send(404, {"detail": "not found"})
        col, sid = m.group(1), int(m.group(2))
        items = db.get(col, [])
        before = len(items)
        items = [x for x in items if int(x.get("id", 0)) != sid]
        if len(items) == before:
            return self._send(404, {"detail": f"{col} #{sid} not found"})

        db[col] = items
        save_db(db)
        return self._send(204, None)

def main():
    if not os.path.exists(DB_PATH):
        raise SystemExit(f"DB file not found: {DB_PATH}")

    server = HTTPServer((HOST, PORT), MockHandler)
    print(f"Mock API running: http://{HOST}:{PORT}")
    print(f"DB: {DB_PATH}")
    server.serve_forever()

if __name__ == "__main__":
    main()

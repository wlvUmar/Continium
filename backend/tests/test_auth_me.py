from fastapi.testclient import TestClient
import pytest
from fastapi import HTTPException, Request, status

from app.core.security import current_user
from app.schemas.auth import TokenResponse, UserLoginRequest
from app.services import auth_service
from main import app


client = TestClient(app)


@pytest.mark.asyncio
async def test_login_then_get_me(monkeypatch):
    credentials = {
        "email": "j.foo@gmail.com",
        "password": "morbid1911",
    }
    fake_access_token = "test-access-token"

    async def mock_login(_db, request: UserLoginRequest):
        assert request.email == credentials["email"]
        assert request.password == credentials["password"]
        return TokenResponse(
            access_token=fake_access_token,
            refresh_token="test-refresh-token",
            token_type="bearer",
        )

    async def override_current_user(request: Request):
        auth_header = request.headers.get("Authorization")
        if auth_header != f"Bearer {fake_access_token}":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Not authenticated",
            )
        return {
            "id": 1,
            "full_name": "Test User",
            "email": credentials["email"],
            "image_url": "https://example.com/avatar.png",
            "is_active": True,
            "verified": False,
        }

    monkeypatch.setattr(auth_service, "login", mock_login)
    app.dependency_overrides[current_user] = override_current_user
    try:
        login_response = client.post("/api/v1/auth/login", json=credentials)
        assert login_response.status_code == 200
        access_token = login_response.json()["access_token"]

        response = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {access_token}"},
        )
    finally:
        app.dependency_overrides.pop(current_user, None)

    assert response.status_code == 200
    assert response.json() == {
        "id": 1,
        "full_name": "Test User",
        "email": credentials["email"],
        "image_url": "https://example.com/avatar.png",
        "is_active": True,
        "verified": False,
    }

from __future__ import annotations

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = Field("sqlite+aiosqlite:///./app.db",validation_alias="DATABASE_URL")
    jwt_secret: str = Field("CHANGE_ME", validation_alias="JWT_SECRET")
    jwt_alg: str = Field("HS256", validation_alias="JWT_ALG")
    access_token_ttl: int = Field(900, validation_alias="ACCESS_TOKEN_TTL")
    refresh_token_ttl: int = Field(2_592_000, validation_alias="REFRESH_TOKEN_TTL")
    env: str = Field("dev", validation_alias="ENV")
    debug: bool = Field(True, validation_alias="DEBUG")
    cors_origins: list[str] = Field(
        default_factory=lambda: ["http://localhost:3000"],
        validation_alias="CORS_ORIGINS",
    )
    cors_allow_credentials: bool = Field(True, validation_alias="CORS_ALLOW_CREDENTIALS")
    cors_allow_methods: list[str] = Field(
        default_factory=lambda: ["*"],
        validation_alias="CORS_ALLOW_METHODS",
    )
    cors_allow_headers: list[str] = Field(
        default_factory=lambda: ["*"],
        validation_alias="CORS_ALLOW_HEADERS",
    )
    model_config = SettingsConfigDict(
        env_file=".env",
        env_ignore_empty=True,
        extra="ignore",
    )

    @field_validator("cors_origins", "cors_allow_methods", "cors_allow_headers", mode="before")
    @classmethod
    def _split_csv(cls, value):
        if isinstance(value, str):
            items = [item.strip() for item in value.split(",")]
            return [item for item in items if item]
        return value


settings = Settings()

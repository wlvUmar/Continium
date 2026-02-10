from __future__ import annotations

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = Field("sqlite+aiosqlite:///./app.db",validation_alias="DATABASE_URL")
    jwt_secret: str = Field("CHANGE_ME", validation_alias="JWT_SECRET")
    jwt_alg: str = Field("HS256", validation_alias="JWT_ALG")
    access_token_ttl: int = Field(900, validation_alias="ACCESS_TOKEN_TTL")
    refresh_token_ttl: int = Field(2_592_000, validation_alias="REFRESH_TOKEN_TTL")
    env: str = Field("dev", validation_alias="ENV")
    debug: bool = Field(True, validation_alias="DEBUG")
    model_config = SettingsConfigDict(
        env_file=".env",
        env_ignore_empty=True,
        extra="ignore",
    )


settings = Settings()

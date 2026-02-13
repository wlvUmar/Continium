from __future__ import annotations

import logging
from logging.handlers import RotatingFileHandler
from pathlib import Path
from typing import Optional

try:
    from colorlog import ColoredFormatter
except ModuleNotFoundError: 
    ColoredFormatter = None


LOG_FORMAT_COLORED = (
    "\033[37m%(asctime)s "
    "%(log_color)s[%(levelname)s] "
    "\033[38;5;111m%(name)s:\033[0m "
    "\033[37m%(message)s"
)
LOG_FORMAT_PLAIN = "%(asctime)s [%(levelname)s] %(name)s: %(message)s"
DEFAULT_LEVEL = logging.INFO


def _default_log_path() -> Path:
    # backend/app/core -> backend -> logs/app.log
    return Path(__file__).resolve().parents[2] / "logs" / "app.log"


def setup_logging(log_file: Optional[str | Path] = None, level: int = DEFAULT_LEVEL) -> None:
    log_path = Path(log_file) if log_file else _default_log_path()
    log_path.parent.mkdir(parents=True, exist_ok=True)

    console_handler = logging.StreamHandler()
    console_handler.setLevel(level)
    if ColoredFormatter:
        console_handler.setFormatter(
            ColoredFormatter(
                LOG_FORMAT_COLORED,
                datefmt="%Y-%m-%d %H:%M:%S",
                reset=True,
                log_colors={
                    "DEBUG": "cyan",
                    "INFO": "green",
                    "WARNING": "yellow",
                    "ERROR": "red",
                    "CRITICAL": "bold_red",
                },
            )
        )
    else:
        console_handler.setFormatter(logging.Formatter(LOG_FORMAT_PLAIN))

    file_handler = RotatingFileHandler(str(log_path), maxBytes=5_000_000, backupCount=3)
    file_handler.setFormatter(logging.Formatter(LOG_FORMAT_PLAIN))
    file_handler.setLevel(level)

    root_logger = logging.getLogger()
    root_logger.setLevel(level)
    root_logger.handlers = []
    root_logger.addHandler(console_handler)
    root_logger.addHandler(file_handler)

    for name in [
        "uvicorn",
        "uvicorn.access",
        "uvicorn.error",
        "sqlalchemy",
        "fastapi",
        "asyncio",
        "httpx",
    ]:
        logger = logging.getLogger(name)
        logger.handlers = []
        logger.propagate = True
        logger.setLevel(level)

    logging.getLogger("uvicorn").setLevel(logging.INFO)
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.pool").setLevel(logging.WARNING)
    logging.getLogger("sqlalchemy.orm").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.ERROR)

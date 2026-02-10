"""
Database engine + session + FastAPI dependency.

TODO:
- Create SQLAlchemy engine from DATABASE_URL
- Create SessionLocal (sessionmaker)
- Implement get_db() generator dependency:
    yield db
    finally: db.close()
- If you choose Async SQLAlchemy later, refactor here first.
"""

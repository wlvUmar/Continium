"""
User ORM model.

Fields you listed:
- id
- full_name
- email (unique)
- password_hash
- image_url (nullable)
- is_active (bool)
- verified (bool)
(+ recommended)
- created_at, updated_at

TODO:
- Define __tablename__ = "users"
- Add relationships: goals = relationship("Goal", back_populates="user")
- Add indexes/constraints (unique email)
"""

"""
Stat ORM model (time tracking / progress events).

Fields you listed:
- id (recommended even if not listed)
- timestamp
- goal_id (FK goals.id)
- duration (int)

TODO:
- Define __tablename__ = "stats"
- Relationship: goal = relationship("Goal", back_populates="stats")
- Consider constraints: duration >= 0
"""

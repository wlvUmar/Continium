"""
Goal ORM model.

Fields you listed:
- id
- title
- type (enum/string)
- start_date
- deadline
- frequency (enum: daily/weekly/monthly)
- duration (int minutes? pick a unit)
- is_complete (bool)
- user_id (FK users.id)

TODO:
- Define __tablename__ = "goals"
- Relationship: user = relationship("User", back_populates="goals")
- Relationship: stats = relationship("Stat", back_populates="goal")
"""

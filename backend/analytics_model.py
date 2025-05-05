from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    Numeric,
    Date,
    ForeignKey,
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.schema import FetchedValue
from datetime import datetime
from typing import Optional

# Import the Base from db.py
from db import Base


class ScreenVisitTimeAnalysis(Base):
    __tablename__ = "screen_durations_view"

    # Define this as a view
    __table_args__ = {"info": {"is_view": True}}

    user_id = Column(Integer, nullable=False)
    session_id = Column(String, primary_key=True)  # Part of composite primary key
    screen = Column(Text, primary_key=True)  # Part of composite primary key
    screen_start_time = Column(
        DateTime(timezone=True), primary_key=True
    )  # Part of composite primary key
    screen_end_time = Column(DateTime(timezone=True), nullable=False)
    duration_seconds = Column(Numeric, nullable=False)
    session_start_time = Column(DateTime(timezone=True), nullable=False)
    session_end_time = Column(DateTime(timezone=True), nullable=False)
    visit_date = Column(Date, nullable=False)

    def __repr__(self):
        return f"<ScreenVisit user_id={self.user_id} screen={self.screen}>"

    def to_dict(self):
        return {
            "user_id": self.user_id,
            "session_id": self.session_id,
            "screen": self.screen,
            "screen_start_time": self.screen_start_time.isoformat()
            if self.screen_start_time
            else None,
            "screen_end_time": self.screen_end_time.isoformat()
            if self.screen_end_time
            else None,
            "duration_seconds": float(self.duration_seconds)
            if self.duration_seconds
            else None,
            "session_start_time": self.session_start_time.isoformat()
            if self.session_start_time
            else None,
            "session_end_time": self.session_end_time.isoformat()
            if self.session_end_time
            else None,
            "visit_date": self.visit_date.isoformat() if self.visit_date else None,
        }

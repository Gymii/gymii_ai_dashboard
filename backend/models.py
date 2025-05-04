from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Index
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, backref
from datetime import datetime

# Import the Base from db.py
from db import Base


class User(Base):
    __tablename__ = "user"

    id = Column(Integer, primary_key=True)
    username = Column(String(80), unique=True, nullable=False)
    email = Column(String(120), unique=True, nullable=False)

    def __repr__(self):
        return f"<User {self.username}>"

    def to_dict(self):
        return {"id": self.id, "username": self.username, "email": self.email}


class AdminComment(Base):
    __tablename__ = "admin_comment"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("user.id", ondelete="CASCADE"), nullable=False)
    author_id = Column(
        Integer, ForeignKey("user.id", ondelete="SET NULL"), nullable=True
    )
    text = Column(Text, nullable=False)
    mood = Column(String(20), nullable=True)  # excited, loved, happy, sad, thumbsy
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(
        DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationships
    user = relationship(
        "User",
        foreign_keys=[user_id],
        backref=backref("admin_comments", lazy="dynamic"),
    )
    author = relationship(
        "User",
        foreign_keys=[author_id],
        backref=backref("authored_comments", lazy="dynamic"),
    )

    # Indexes
    __table_args__ = (
        Index("idx_admin_comment_user_id", user_id),
        Index("idx_admin_comment_author_id", author_id),
        Index("idx_admin_comment_mood", mood),
    )

    def __repr__(self):
        return f"<AdminComment {self.id} by author {self.author_id} on user {self.user_id}>"

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "author_id": self.author_id,
            "text": self.text,
            "mood": self.mood,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

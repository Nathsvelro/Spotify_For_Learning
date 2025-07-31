
from sqlalchemy import Column, Integer, String, Text, DateTime, Enum, Float
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import JSONB
from .database import Base
import enum

class LessonStatus(str, enum.Enum):
    queued = "queued"
    processing = "processing"
    done = "done"
    failed = "failed"

class Lesson(Base):
    __tablename__ = "lessons"
    id = Column(Integer, primary_key=True, index=True)
    topic = Column(String(255), nullable=False)
    language = Column(String(5), nullable=False)  # 'es' | 'en'
    level = Column(String(20), nullable=False)    # 'beginner' | 'intermediate' | 'advanced'
    tone = Column(String(20), nullable=False)     # 'neutral' | 'friendly' | 'formal'
    duration_min = Column(Integer, nullable=False, default=5)
    status = Column(Enum(LessonStatus), nullable=False, default=LessonStatus.queued)
    audio_url = Column(Text, nullable=True)
    audio_sec = Column(Float, nullable=True)
    script_tokens = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class LessonScript(Base):
    __tablename__ = "lesson_scripts"
    id = Column(Integer, primary_key=True, index=True)
    lesson_id = Column(Integer, nullable=False, index=True)
    json = Column(JSONB, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

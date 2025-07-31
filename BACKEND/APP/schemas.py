
from pydantic import BaseModel, Field
from typing import Optional, Any

class CreateLessonIn(BaseModel):
    topic: str = Field(..., min_length=3, max_length=200)
    language: str = Field("es", pattern="^(es|en)$")
    level: str = Field("intermediate", pattern="^(beginner|intermediate|advanced)$")
    tone: str = Field("friendly", pattern="^(neutral|friendly|formal)$")
    duration_min: int = Field(5, ge=3, le=8)

class LessonOut(BaseModel):
    id: int
    topic: str
    language: str
    level: str
    tone: str
    duration_min: int
    status: str
    audio_url: Optional[str] = None
    audio_sec: Optional[float] = None
    script_tokens: Optional[int] = None

    class Config:
        from_attributes = True

class ApiMessage(BaseModel):
    message: str

class ScriptJSON(BaseModel):
    # Estructura devuelta por el LLM
    objectives: list[str]
    outline: list[dict]
    script_text: str
    reflection_questions: list[str]
    glossary: list[dict]
    sources: list[str]


import os
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from .config import settings
from .database import Base, engine, get_db
from .models import Lesson, LessonStatus
from .schemas import CreateLessonIn, LessonOut, ApiMessage
from .queue import generation_queue
from .worker_task import process_lesson

app = FastAPI(title="Spotify for Learning API", version="0.1.0")

# CORS para desarrollo
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files (audio)
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")
AUDIO_DIR = os.path.join(STATIC_DIR, "audio")
os.makedirs(AUDIO_DIR, exist_ok=True)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

@app.get("/health", response_model=ApiMessage)
def health():
    return {"message": "ok"}

@app.post("/api/lessons", response_model=LessonOut, status_code=202)
def create_lesson(payload: CreateLessonIn, db: Session = Depends(get_db)):
    lesson = Lesson(
        topic=payload.topic.strip(),
        language=payload.language,
        level=payload.level,
        tone=payload.tone,
        duration_min=payload.duration_min,
        status=LessonStatus.queued,
    )
    db.add(lesson)
    db.commit()
    db.refresh(lesson)

    # Encola trabajo
    generation_queue.enqueue(process_lesson, lesson.id)
    return lesson

@app.get("/api/lessons/{lesson_id}", response_model=LessonOut)
def get_lesson(lesson_id: int, db: Session = Depends(get_db)):
    lesson = db.get(Lesson, lesson_id)
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    return lesson

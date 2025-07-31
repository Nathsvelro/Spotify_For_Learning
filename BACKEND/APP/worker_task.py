
import os, json, math
from sqlalchemy.orm import Session
from .database import SessionLocal
from .models import Lesson, LessonScript, LessonStatus
from .llm import generate_script
from .tts import synthesize_to_mp3
from .config import settings

AUDIO_DIR = os.path.join(os.path.dirname(__file__), "..", "static", "audio")
os.makedirs(AUDIO_DIR, exist_ok=True)

def _estimate_audio_seconds(text: str) -> float:
    # Aproxima 150 wpm -> 2.5 wps; usa longitud para estimación
    words = len(text.split())
    return max(60, min(600, words / 2.5))

def process_lesson(lesson_id: int) -> None:
    db: Session = SessionLocal()
    try:
        lesson = db.get(Lesson, lesson_id)
        if not lesson:
            return
        lesson.status = LessonStatus.processing
        db.commit()

        res = generate_script(lesson.topic, lesson.language, lesson.level, lesson.tone)
        data = res["data"]
        token_count = res.get("token_count")

        # Guarda JSON del guion
        db.add(LessonScript(lesson_id=lesson.id, json=data))
        db.commit()

        # Construye el texto final a locutar: guion + preguntas de reflexión
        script_text = data.get("script_text", "")
        rq = data.get("reflection_questions", [])
        if rq:
            script_text += "\n\nPreguntas de reflexión:\n" if lesson.language == "es" else "\n\nReflection questions:\n"
            for i, q in enumerate(rq, 1):
                script_text += f"{i}. {q}\n"

        audio_bytes = synthesize_to_mp3(script_text, lesson.language)

        # Guarda MP3
        filename = f"lesson_{lesson.id}.mp3"
        file_path = os.path.join(AUDIO_DIR, filename)
        with open(file_path, "wb") as f:
            f.write(audio_bytes)

        # URL pública (servida por FastAPI static)
        audio_url = f"{settings.base_url}/static/audio/{filename}"
        lesson.audio_url = audio_url
        lesson.audio_sec = _estimate_audio_seconds(script_text)
        lesson.script_tokens = token_count
        lesson.status = LessonStatus.done
        db.commit()
    except Exception as e:
        if lesson:
            lesson.status = LessonStatus.failed
            db.commit()
        raise
    finally:
        db.close()

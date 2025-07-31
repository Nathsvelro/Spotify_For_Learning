
import requests, time
from .config import settings

ELEVEN_TTS_URL = "https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"

def pick_voice(language: str) -> str:
    if language == "en" and settings.eleven_voice_id_en:
        return settings.eleven_voice_id_en
    return settings.eleven_voice_id_es or settings.eleven_voice_id_en or ""

def synthesize_to_mp3(text: str, language: str) -> bytes:
    voice_id = pick_voice(language)
    if not voice_id:
        raise RuntimeError("Configura ELEVENLABS_VOICE_ID_ES o ELEVENLABS_VOICE_ID_EN en .env")

    headers = {
        "xi-api-key": settings.eleven_api_key,
        "accept": "audio/mpeg",
        "content-type": "application/json"
    }
    payload = {
        "text": text,
        "model_id": settings.eleven_model_id,
        "voice_settings": {
            "stability": settings.eleven_stability,
            "similarity_boost": settings.eleven_similarity_boost,
            "style": settings.eleven_style,
            "use_speaker_boost": True
        },
        "optimize_streaming_latency": 2
    }
    url = ELEVEN_TTS_URL.format(voice_id=voice_id)
    r = requests.post(url, headers=headers, json=payload, timeout=120)
    r.raise_for_status()
    return r.content

# Spotify for Learning — Starter Kit

Stack:
- **Backend**: Python (FastAPI), RQ (cola), Redis, Postgres, SQLAlchemy, Pydantic, OpenAI (LLM), ElevenLabs (TTS)
- **Frontend**: Next.js
- **Idiomas**: Español e inglés

## Objetivo del PoC

Esta app permite crear un podcast educativo en base a lo que solicite el usuario (tema, nivel, idioma, tono y duración). Actualmente también incluye un botón para **simular** la publicación en Spotify (prueba de concepto).

## Puesta en marcha (local)

1) Copia `.env.example` a `.env` en `BACKEND/` y completa tus claves:
   - `OPENAI_API_KEY`, `ELEVENLABS_API_KEY`
   - `ELEVENLABS_VOICE_ID_ES`, `ELEVENLABS_VOICE_ID_EN`
2) Levanta Postgres y Redis:
   ```bash
   docker compose up -d
   ```
3) Backend:
   ```bash
   cd BACKEND
   python -m venv .venv && source .venv/bin/activate
   pip install -r requirements.txt
   python -m APP.db_init
   uvicorn APP.main:app --reload --port 8000
   ```
4) Worker en otra terminal:
   ```bash
   cd BACKEND
   source .venv/bin/activate
   rq worker -u $REDIS_URL lesson-generation
   ```
5) Frontend:
   ```bash
   cd WEB
   npm install
   npm run dev
   ```

- API: `http://localhost:8000`
- Frontend: `http://localhost:3000`

## Flujo

- `POST /api/lessons` con `{ topic, language, level, tone, duration_min }`.
- El worker genera el guion, sintetiza audio, guarda MP3 local y actualiza estado.
- `GET /api/lessons/{id}` retorna metadatos y `audio_url` cuando está listo.
- Desde la UI, al terminar la generación, se puede pulsar **Publicar en Spotify (PoC)** para simular publicación con un ID ficticio.

## Nota

La integración real con Spotify for Podcasters/API oficial queda pendiente para una siguiente iteración.

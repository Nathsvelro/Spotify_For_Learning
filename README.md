
# Spotify for Learning — Starter Kit

Stack elegido:
- **Backend**: Python (FastAPI), RQ (cola), Redis, Postgres, SQLAlchemy, Pydantic, OpenAI (LLM), ElevenLabs (TTS)
- **Frontend**: Next.js 
- **Idiomas**: Español e inglés

## Requisitos
- Python 3.11+
- Node 20+
- Docker y docker-compose (para Postgres y Redis)

## Puesta en marcha (local)
1) Copia `.env.example` a `.env` en `backend/` y completa tus claves:
   - `OPENAI_API_KEY`, `ELEVENLABS_API_KEY`
   - `ELEVENLABS_VOICE_ID_ES`, `ELEVENLABS_VOICE_ID_EN` (elige voces en ElevenLabs)
2) Levanta Postgres y Redis:
   ```bash
   docker compose up -d
   ```
3) Backend:
   ```bash
   cd backend
   python -m venv .venv && source .venv/bin/activate
   pip install -r requirements.txt
   # Crear tablas
   python -m app.db_init
   # Inicia API
   uvicorn app.main:app --reload --port 8000
   # En otra terminal, inicia el worker
   rq worker -u $REDIS_URL lesson-generation
   ```
4) Frontend:
   ```bash
   cd web
   npm install
   npm run dev
   ```

- API corre en `http://localhost:8000`
- Frontend corre en `http://localhost:3000` (configurado para apuntar al backend via `NEXT_PUBLIC_API_BASE`)

## Flujo
- POST `/api/lessons` con `{ topic, language, level, tone, duration_min }`
- El worker genera el guion con OpenAI, sintetiza audio con ElevenLabs, guarda MP3 en `backend/static/audio/`, y actualiza el estado.
- GET `/api/lessons/{id}` retorna metadatos y `audio_url` cuando esté listo.

## Notas
- Este starter guarda audio localmente para simplificar. Cambia a S3 si lo prefieres.
- Asegura tus claves en `.env` (nunca subas claves a git).
- La estructura está lista para extender con autenticación, RAG, y CDN.

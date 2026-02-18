'use client';

import { useEffect, useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';

type Lesson = {
  id: number;
  topic: string;
  language: 'es' | 'en';
  level: 'beginner' | 'intermediate' | 'advanced';
  tone: 'neutral' | 'friendly' | 'formal';
  duration_min: number;
  status: 'queued' | 'processing' | 'done' | 'failed';
  audio_url?: string;
  audio_sec?: number;
};

type ScriptPreview = {
  title: string;
  intro: string;
  body: string;
  close: string;
  segments: string[];
};

function buildScriptPreview(topic: string, level: Lesson['level'], duration: number, tone: Lesson['tone']): ScriptPreview {
  const levelText =
    level === 'beginner' ? 'nivel inicial' : level === 'intermediate' ? 'nivel intermedio' : 'nivel avanzado';

  return {
    title: `Guía educativa: ${topic}`,
    intro: `Bienvenida al episodio. Hoy aprenderás sobre ${topic} con un tono ${tone} y enfoque para ${levelText}.`,
    body: `En los próximos ${duration} minutos cubriremos definiciones clave, ejemplo práctico y una pregunta de autoevaluación para reforzar el aprendizaje.`,
    close: `Resumen final: repasa los conceptos esenciales de ${topic} y anota una aplicación real para tu próxima clase.`,
    segments: [
      'Apertura y contexto (2 min)',
      `Conceptos clave (${Math.max(duration - 4, 3)} min)`,
      'Ejemplo aplicado (1 min)',
      'Cierre y reto de reflexión (1 min)',
    ],
  };
}

export default function Home() {
  const [topic, setTopic] = useState('Introducción al álgebra lineal');
  const [language, setLanguage] = useState<'es' | 'en'>('es');
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate');
  const [tone, setTone] = useState<'neutral' | 'friendly' | 'formal'>('friendly');
  const [duration, setDuration] = useState(5);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [polling, setPolling] = useState(false);
  const [scriptPreview, setScriptPreview] = useState<ScriptPreview | null>(null);
  const [spotifyStatus, setSpotifyStatus] = useState('');

  const createLesson = async () => {
    setLesson(null);
    setSpotifyStatus('');
    setScriptPreview(buildScriptPreview(topic, level, duration, tone));

    const res = await fetch(`${API_BASE}/api/lessons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, language, level, tone, duration_min: duration }),
    });
    if (!res.ok) {
      alert('Error al crear lección');
      return;
    }
    const data: Lesson = await res.json();
    setLesson(data);
    setPolling(true);
  };

  const publishOnSpotifyPOC = () => {
    if (!lesson || lesson.status !== 'done') {
      setSpotifyStatus('Primero genera el audio y espera a que esté en estado "done".');
      return;
    }

    const fakeSpotifyId = `spotify-poc-${lesson.id}-${Math.random().toString(36).slice(2, 8)}`;
    setSpotifyStatus(`✅ Publicación simulada completada. Episode ID (PoC): ${fakeSpotifyId}`);
  };

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (polling && lesson) {
      timer = setInterval(async () => {
        const res = await fetch(`${API_BASE}/api/lessons/${lesson.id}`);
        if (res.ok) {
          const updated: Lesson = await res.json();
          setLesson(updated);
          if (updated.status === 'done' || updated.status === 'failed') {
            setPolling(false);
          }
        }
      }, 2500);
    }
    return () => clearInterval(timer);
  }, [polling, lesson]);

  return (
    <main style={{ maxWidth: 860, margin: '0 auto' }}>
      <h1>Spotify for Learning</h1>
      <p>Crea podcasts educativos personalizados y publícalos en Spotify (PoC).</p>

      <section style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
        <label style={{ gridColumn: '1 / -1' }}>
          Tema
          <textarea value={topic} onChange={(e) => setTopic(e.target.value)} rows={3} style={{ width: '100%' }} />
        </label>
        <label>
          Idioma
          <select value={language} onChange={(e) => setLanguage(e.target.value as 'es' | 'en')} style={{ width: '100%' }}>
            <option value="es">Español</option>
            <option value="en">English</option>
          </select>
        </label>
        <label>
          Nivel
          <select value={level} onChange={(e) => setLevel(e.target.value as Lesson['level'])} style={{ width: '100%' }}>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </label>
        <label>
          Tono
          <select value={tone} onChange={(e) => setTone(e.target.value as Lesson['tone'])} style={{ width: '100%' }}>
            <option value="friendly">Friendly</option>
            <option value="neutral">Neutral</option>
            <option value="formal">Formal</option>
          </select>
        </label>
        <label>
          Duración (min)
          <input
            type="number"
            min={3}
            max={15}
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value, 10) || 3)}
            style={{ width: '100%' }}
          />
        </label>
      </section>

      <button onClick={createLesson} style={{ marginTop: 16, padding: '10px 16px', fontWeight: 600 }}>
        Generar podcast
      </button>

      {scriptPreview && (
        <section style={{ marginTop: 20, padding: 12, border: '1px solid #ccc', borderRadius: 8 }}>
          <h2 style={{ marginTop: 0 }}>Guion sugerido</h2>
          <p><strong>{scriptPreview.title}</strong></p>
          <p>{scriptPreview.intro}</p>
          <p>{scriptPreview.body}</p>
          <p>{scriptPreview.close}</p>
          <ul>
            {scriptPreview.segments.map((segment) => (
              <li key={segment}>{segment}</li>
            ))}
          </ul>
        </section>
      )}

      <hr style={{ margin: '24px 0' }} />

      {lesson && (
        <div style={{ padding: 12, border: '1px solid #ccc', borderRadius: 8 }}>
          <p><strong>Lección #{lesson.id}</strong></p>
          <p>Estado: {lesson.status}</p>
          {lesson.status === 'done' && lesson.audio_url && (
            <div>
              <audio controls src={lesson.audio_url} style={{ width: '100%' }} />
              <p>{lesson.audio_sec ? `~${Math.round(lesson.audio_sec)}s` : ''}</p>
              <a href={lesson.audio_url} download>
                Descargar MP3
              </a>
            </div>
          )}

          <div style={{ marginTop: 12 }}>
            <button
              onClick={publishOnSpotifyPOC}
              type="button"
              style={{ padding: '10px 16px', fontWeight: 600 }}
            >
              Publicar en Spotify (PoC)
            </button>
            {spotifyStatus && <p style={{ marginTop: 8 }}>{spotifyStatus}</p>}
          </div>
        </div>
      )}
    </main>
  );
}

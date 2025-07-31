
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

export default function Home() {
  const [topic, setTopic] = useState('Introducción al álgebra lineal');
  const [language, setLanguage] = useState<'es'|'en'>('es');
  const [level, setLevel] = useState<'beginner'|'intermediate'|'advanced'>('intermediate');
  const [tone, setTone] = useState<'neutral'|'friendly'|'formal'>('friendly');
  const [duration, setDuration] = useState(5);
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [polling, setPolling] = useState(false);

  const createLesson = async () => {
    setLesson(null);
    const res = await fetch(`${API_BASE}/api/lessons`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, language, level, tone, duration_min: duration })
    });
    if (!res.ok) {
      alert('Error al crear lección');
      return;
    }
    const data: Lesson = await res.json();
    setLesson(data);
    setPolling(true);
  };

  useEffect(() => {
    let timer: any;
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
    <main style={{ maxWidth: 780, margin: '0 auto' }}>
      <h1>Spotify for Learning</h1>
      <p>Genera audios educativos (~5 min) personalizados por IA.</p>

      <section style={{ display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
        <label style={{ gridColumn: '1 / -1' }}>
          Tema
          <textarea value={topic} onChange={e => setTopic(e.target.value)} rows={3} style={{ width: '100%' }} />
        </label>
        <label>
          Idioma
          <select value={language} onChange={e => setLanguage(e.target.value as 'es'|'en')} style={{ width: '100%' }}>
            <option value="es">Español</option>
            <option value="en">English</option>
          </select>
        </label>
        <label>
          Nivel
          <select value={level} onChange={e => setLevel(e.target.value as any)} style={{ width: '100%' }}>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </label>
        <label>
          Tono
          <select value={tone} onChange={e => setTone(e.target.value as any)} style={{ width: '100%' }}>
            <option value="friendly">Friendly</option>
            <option value="neutral">Neutral</option>
            <option value="formal">Formal</option>
          </select>
        </label>
        <label>
          Duración (min)
          <input type="number" min={3} max={8} value={duration} onChange={e => setDuration(parseInt(e.target.value))} style={{ width: '100%' }} />
        </label>
      </section>

      <button onClick={createLesson} style={{ marginTop: 16, padding: '10px 16px', fontWeight: 600 }}>
        Generar audio
      </button>

      <hr style={{ margin: '24px 0' }} />

      {lesson && (
        <div style={{ padding: 12, border: '1px solid #ccc', borderRadius: 8 }}>
          <p><strong>Lección #{lesson.id}</strong></p>
          <p>Estado: {lesson.status}</p>
          {lesson.status === 'done' && lesson.audio_url && (
            <div>
              <audio controls src={lesson.audio_url} style={{ width: '100%' }} />
              <p>{lesson.audio_sec ? `~${Math.round(lesson.audio_sec)}s` : ''}</p>
              <a href={lesson.audio_url} download>Descargar MP3</a>
            </div>
          )}
        </div>
      )}
    </main>
  );
}

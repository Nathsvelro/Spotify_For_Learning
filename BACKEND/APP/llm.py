
from openai import OpenAI
from .config import settings

client = OpenAI(api_key=settings.openai_api_key)

SYSTEM_PROMPT = (
    "Eres un educador experto. Genera un guion claro y motivador para un audio de ~5 minutos "
    "(700–800 palabras; ritmo 150–160 wpm). Devuelve un JSON con claves: "
    "objectives (2–3), outline (lista de secciones con title,gist,key_points,analogy), "
    "script_text (natural, con ejemplos y transiciones), reflection_questions (3), "
    "glossary (5–7 items con término y definición simple), sources (2–4 referencias generales). "
    "Evita alucinaciones; si el tema es sensible, advierte límites."
)

def build_user_prompt(topic: str, language: str, level: str, tone: str) -> str:
    return (
        f"Idioma: {language}. Nivel: {level}. Tono: {tone}.\n"
        f"Tema: {topic}.\n"
        "No excedas 800 palabras en script_text. Contesta únicamente en JSON válido."
    )

def generate_script(topic: str, language: str, level: str, tone: str) -> dict:
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": build_user_prompt(topic, language, level, tone)},
    ]
    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=messages,
        temperature=0.7,
        response_format={"type": "json_object"},
    )
    content = resp.choices[0].message.content
    import json as _json
    data = _json.loads(content)
    # Añade conteo aproximado de tokens si está disponible
    tokens = getattr(resp, "usage", None)
    total_tokens = (tokens.total_tokens if tokens else None)
    return {"data": data, "token_count": total_tokens}


from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    env: str = Field("dev", alias="ENV")
    api_host: str = Field("0.0.0.0", alias="API_HOST")
    api_port: int = Field(8000, alias="API_PORT")
    base_url: str = Field("http://localhost:8000", alias="BASE_URL")

    database_url: str = Field(..., alias="DATABASE_URL")
    redis_url: str = Field("redis://localhost:6379/0", alias="REDIS_URL")

    openai_api_key: str = Field(..., alias="OPENAI_API_KEY")

    eleven_api_key: str = Field(..., alias="ELEVENLABS_API_KEY")
    eleven_model_id: str = Field("eleven_multilingual_v2", alias="ELEVENLABS_MODEL_ID")
    eleven_voice_id_es: str = Field("", alias="ELEVENLABS_VOICE_ID_ES")
    eleven_voice_id_en: str = Field("", alias="ELEVENLABS_VOICE_ID_EN")
    eleven_stability: float = Field(0.4, alias="ELEVENLABS_STABILITY")
    eleven_similarity_boost: float = Field(0.8, alias="ELEVENLABS_SIMILARITY_BOOST")
    eleven_style: float = Field(0.4, alias="ELEVENLABS_STYLE")
    eleven_speaking_rate: float = Field(1.0, alias="ELEVENLABS_SPEAKING_RATE")

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

settings = Settings()

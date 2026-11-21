"""Adaptador para una fuente meteorológica OFICIAL con contrato normalizado (portado de PACHAAGRO).

No se inventa un endpoint: SENAMHI no publica una API documentada. Si una institución habilita un
servicio, basta con exponer este contrato y configurar OFFICIAL_WEATHER_URL (y OFFICIAL_WEATHER_KEY):

GET {OFFICIAL_WEATHER_URL}?lat=-17.97&lon=-67.11      Authorization: Bearer {OFFICIAL_WEATHER_KEY}
{
  "source": {"name": "SENAMHI ...", "url": "https://...", "official": true},
  "updated_at": "2026-11-21T08:00:00-04:00",
  "current": {"temperature_c": 6.4, "weather_code": 2},
  "daily": [{"date": "2026-11-21", "temp_min_c": -1.2, "temp_max_c": 18.0,
             "precipitation_mm": 0.0, "precipitation_probability": 10, "weather_code": 2}]
}
"""
from datetime import datetime, timezone

import httpx
from pydantic import BaseModel, Field, HttpUrl, ValidationError

from app.core.config import get_settings
from app.services.weather.base import STORM_CODES, Block, DailyValue, ProviderError


class _Source(BaseModel):
    name: str = Field(min_length=1)
    url: HttpUrl
    official: bool = True


class _Current(BaseModel):
    temperature_c: float
    weather_code: int


class _Day(BaseModel):
    date: str
    temp_min_c: float
    temp_max_c: float
    precipitation_mm: float = 0.0
    precipitation_probability: float | None = None
    weather_code: int


class OfficialPayload(BaseModel):
    source: _Source
    updated_at: str | None = None
    current: _Current
    daily: list[_Day] = Field(max_length=16)


def fetch_official(lat: float, lon: float, client: httpx.Client) -> Block:
    s = get_settings()
    if not s.official_weather_url:
        raise ProviderError("La fuente meteorológica oficial no está configurada.")
    headers = {"Accept": "application/json"}
    if s.official_weather_key:
        headers["Authorization"] = f"Bearer {s.official_weather_key}"
    try:
        r = client.get(s.official_weather_url, params={"lat": lat, "lon": lon}, headers=headers, timeout=s.weather_timeout_seconds)
    except httpx.HTTPError as e:
        raise ProviderError("No se pudo conectar con la fuente meteorológica oficial.") from e
    if r.status_code != 200:
        raise ProviderError(f"La fuente oficial respondió con estado {r.status_code}.")
    try:
        return parse_official(r.json())
    except (ValueError, ValidationError) as e:
        raise ProviderError("La fuente oficial devolvió un formato no reconocido.") from e


def parse_official(data: dict) -> Block:
    p = OfficialPayload.model_validate(data)
    if not p.daily:
        raise ProviderError("La fuente oficial no incluyó pronóstico diario.")
    return Block(
        available=True, source=p.source.name, kind="pronostico",
        fetched_at=p.updated_at or datetime.now(timezone.utc).isoformat(timespec="seconds"),
        daily=[DailyValue(date=d.date, tmin=d.temp_min_c, tmax=d.temp_max_c, precip_mm=d.precipitation_mm,
                          precip_prob=d.precipitation_probability, weather_code=d.weather_code,
                          storm=d.weather_code in STORM_CODES) for d in p.daily],
        current_temp=p.current.temperature_c,
        extra={"official": p.source.official, "source_url": str(p.source.url)},
    )

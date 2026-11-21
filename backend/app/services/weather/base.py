"""Estructuras normalizadas de datos meteorológicos.

Cada bloque indica su FUENTE y su TIPO de dato:
  - "pronostico"  : salida de modelos numéricos (Open-Meteo)
  - "estimacion"  : reanálisis / satélite para días pasados (NASA POWER)
  - "climatologia": promedios históricos (NASA POWER)
  - "simulado"    : datos inventados para demostración. Nunca se mezclan con los reales.
"""
from dataclasses import asdict, dataclass, field


@dataclass
class DailyValue:
    date: str
    tmin: float | None = None
    tmax: float | None = None
    precip_mm: float | None = None
    precip_prob: float | None = None
    weather_code: int | None = None
    storm: bool = False


@dataclass
class Block:
    available: bool
    source: str
    kind: str
    fetched_at: str | None = None
    error: str | None = None
    daily: list[DailyValue] = field(default_factory=list)
    current_temp: float | None = None
    current_time: str | None = None
    soil_moisture: float | None = None  # m3/m3 (Open-Meteo) o 0-1 (NASA GWETTOP)
    soil_moisture_unit: str | None = None
    extra: dict = field(default_factory=dict)

    def to_dict(self) -> dict:
        return asdict(self)


class ProviderError(Exception):
    pass


# Códigos WMO de tormenta usados por Open-Meteo (95: tormenta, 96/99: tormenta con granizo)
STORM_CODES = {95, 96, 99}

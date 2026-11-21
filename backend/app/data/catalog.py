"""Acceso a datos de referencia (ubicaciones y cultivos) cargados desde JSON."""
import json
from functools import lru_cache
from pathlib import Path

DATA_DIR = Path(__file__).parent


@lru_cache
def locations() -> dict:
    return json.loads((DATA_DIR / "locations.json").read_text(encoding="utf-8"))


@lru_cache
def crops_config() -> dict:
    return json.loads((DATA_DIR / "crops.json").read_text(encoding="utf-8"))


@lru_cache
def _municipality_index() -> dict[str, dict]:
    idx = {}
    for d in locations()["departments"]:
        for m in d["municipalities"]:
            idx[m["id"]] = {**m, "department_id": d["id"], "department_name": d["name"]}
    return idx


def get_municipality(mid: str) -> dict | None:
    return _municipality_index().get(mid)


def department_ids() -> set[str]:
    return {d["id"] for d in locations()["departments"]}


def find_municipality_by_name(text: str) -> dict | None:
    """Busca un municipio mencionado en un texto libre (para el asistente de WhatsApp)."""
    from app.services.textnorm import normalize

    t = f" {normalize(text)} "
    best = None
    for m in _municipality_index().values():
        n = normalize(m["name"])
        if f" {n} " in t or (len(n.split()) > 1 and n.split()[-1] in t.split() and len(n.split()[-1]) > 4):
            if best is None or len(n) > len(normalize(best["name"])):
                best = m
    return best


# Rectángulo aproximado que contiene a Bolivia (para rechazar coordenadas claramente fuera del país).
BOLIVIA_BBOX = (-22.95, -9.6, -69.7, -57.4)  # lat_min, lat_max, lon_min, lon_max
NEAR_KM = 60  # más lejos que esto, el calendario del municipio más cercano puede no aplicar


def in_bolivia(lat: float, lon: float) -> bool:
    a, b, c, d = BOLIVIA_BBOX
    return a <= lat <= b and c <= lon <= d


def nearest_municipality(lat: float, lon: float) -> tuple[dict, float]:
    """Municipio registrado más cercano y su distancia en km (fórmula de haversine)."""
    from math import asin, cos, radians, sin, sqrt

    def km(m):
        dlat, dlon = radians(m["lat"] - lat), radians(m["lon"] - lon)
        h = sin(dlat / 2) ** 2 + cos(radians(lat)) * cos(radians(m["lat"])) * sin(dlon / 2) ** 2
        return 2 * 6371 * asin(sqrt(h))
    best = min(_municipality_index().values(), key=km)
    return best, round(km(best), 1)


def point_location(lat: float, lon: float) -> dict:
    """Ubicación exacta (GPS) que hereda departamento y región del municipio más cercano."""
    m, dist = nearest_municipality(lat, lon)
    return {**m, "id": m["id"], "lat": round(lat, 4), "lon": round(lon, 4), "name": f"Su ubicación (cerca de {m['name']})",
            "gps": True, "nearest_name": m["name"], "distance_km": dist, "far": dist > NEAR_KM}

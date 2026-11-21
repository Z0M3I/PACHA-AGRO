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

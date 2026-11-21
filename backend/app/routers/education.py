import json
from pathlib import Path

from fastapi import APIRouter, HTTPException, Query

router = APIRouter(prefix="/api/education", tags=["educacion"])
DIR = Path(__file__).resolve().parent.parent / "data" / "education"


@router.get("")
def lessons(lang: str = Query("es", pattern="^(es|qu|ay)$")):
    path = DIR / f"{lang}.json"
    if not path.exists():
        raise HTTPException(404, "Idioma no disponible.")
    data = json.loads(path.read_text(encoding="utf-8"))
    langs = [json.loads(p.read_text(encoding="utf-8")) for p in sorted(DIR.glob("*.json"))]
    data["available_languages"] = [{"code": d["language"], "name": d["language_name"], "status": d["review_status"], "lessons": len(d["lessons"])} for d in langs]
    return data

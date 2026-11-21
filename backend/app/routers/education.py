import json
from pathlib import Path

from fastapi import APIRouter, HTTPException, Query

router = APIRouter(prefix="/api/education", tags=["educacion"])
DIR = Path(__file__).resolve().parent.parent / "data" / "education"


def _library() -> dict:
    return json.loads((DIR.parent / "education" / "library.json").read_text(encoding="utf-8"))


@router.get("/library")
def library(crop: str | None = Query(None, max_length=30), department_id: str | None = Query(None, max_length=40),
            type: str | None = Query(None, max_length=30)):
    """Biblioteca filtrable (adaptada de PACHAAGRO). Un recurso sin cultivo/departamento aplica a todos."""
    data = _library()
    items = [i for i in data["items"]
             if (not crop or i["crop"] in (None, crop))
             and (not department_id or i["department_id"] in (None, department_id))
             and (not type or i["type"] == type)]
    return {**{k: v for k, v in data.items() if k != "items"}, "items": items, "total": len(data["items"])}


@router.get("/library/{item_id}")
def library_item(item_id: str):
    item = next((i for i in _library()["items"] if i["id"] == item_id), None)
    if item is None:
        raise HTTPException(404, "Recurso no encontrado.")
    return item


@router.get("")
def lessons(lang: str = Query("es", pattern="^(es|qu|ay)$")):
    path = DIR / f"{lang}.json"
    if not path.exists():
        raise HTTPException(404, "Idioma no disponible.")
    data = json.loads(path.read_text(encoding="utf-8"))
    langs = [json.loads(p.read_text(encoding="utf-8")) for p in sorted(DIR.glob("*.json")) if p.stem in ("es", "qu", "ay")]
    data["available_languages"] = [{"code": d["language"], "name": d["language_name"], "status": d["review_status"], "lessons": len(d["lessons"])} for d in langs]
    return data

from fastapi import APIRouter, HTTPException, Query

from app.data.catalog import crops_config, get_municipality, locations
from app.services.weather.service import get_weather

router = APIRouter(prefix="/api", tags=["catalog"])


@router.get("/locations")
def list_locations():
    return locations()


@router.get("/crops")
def list_crops():
    cfg = crops_config()
    return {
        "disclaimer": cfg["disclaimer"], "status_labels": cfg["status_labels"],
        "crops": [{"id": k, "name": v["name"], "emoji": v["emoji"], "varieties": v["varieties"], "regions": v.get("regions", {})}
                  for k, v in cfg["crops"].items()],
        "config": {"weights": cfg["weights"], "critical_criteria": cfg["critical_criteria"], "aggregation": cfg["aggregation"]},
        "calendars": [{"crop": c["crop"], "department_id": c["department_id"]} for c in cfg["calendars"]],
    }


@router.get("/weather")
def weather(municipality_id: str = Query(max_length=60), mode: str = Query("real", pattern="^(real|simulado)$")):
    m = get_municipality(municipality_id)
    if not m:
        raise HTTPException(404, "Municipio no encontrado.")
    return get_weather(m, mode)

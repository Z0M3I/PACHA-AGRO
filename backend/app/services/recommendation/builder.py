"""Convierte la salida del servicio meteorológico en la vista que usa el motor."""
from app.services.recommendation.engine import WeatherView


def weather_view(wx: dict, hail_reports: int = 0, frost_reports: int = 0) -> WeatherView:
    f, r, c = wx["forecast"], wx["recent"], wx["climatology"]
    soil, soil_kind, soil_src = None, None, None
    if f["available"] and f.get("soil_moisture") is not None:
        soil, soil_kind, soil_src = f["soil_moisture"], "open_meteo_m3m3", f["source"]
    elif r["available"] and r.get("soil_moisture") is not None:
        soil, soil_kind, soil_src = r["soil_moisture"], "nasa_gwettop", r["source"]
    return WeatherView(
        mode=wx["mode"], forecast_available=f["available"], forecast_source=f["source"], forecast_kind=f["kind"],
        daily=f["daily"], soil_model=soil, soil_model_kind=soil_kind, soil_model_source=soil_src,
        recent_daily=r["daily"] if r["available"] else [], recent_source=r["source"] if r["available"] else None,
        frost_days_month=c.get("frost_days_month") if c.get("available") else None,
        community_hail_reports=hail_reports, community_frost_reports=frost_reports,
    )

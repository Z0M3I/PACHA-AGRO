"""Detección de intención por reglas (palabras clave en español sencillo).
Preparado para reemplazarse por un clasificador entrenado cuando existan conversaciones reales etiquetadas."""
from app.services.textnorm import normalize

CROPS = {"quinua": "quinua", "quinoa": "quinua", "papa": "papa", "papas": "papa", "maiz": "maiz", "choclo": "maiz",
         "haba": "haba", "habas": "haba", "cebada": "cebada"}
OBS_KINDS = {"granizo": "granizo", "granizada": "granizo", "helada": "helada", "helo": "helada", "congelo": "helada",
             "inundacion": "lluvia_fuerte", "sequia": "sequia"}


def detect(text: str) -> dict:
    t = normalize(text)
    words = set(t.split())
    crop = next((CROPS[w] for w in words if w in CROPS), None)

    if t in ("si", "sii", "si voy", "voy", "asistire", "confirmo"):
        return {"intent": "yes"}
    if t in ("no", "no voy", "no puedo"):
        return {"intent": "no"}
    if t in ("baja", "stop", "parar", "darme de baja"):
        return {"intent": "opt_out"}
    if t in ("alta", "suscribir", "quiero recibir avisos"):
        return {"intent": "opt_in"}
    if t in ("hola", "buenas", "buenos dias", "buenas tardes", "menu", "ayuda", "inicio", "0"):
        return {"intent": "menu"}

    first = t.split()[0] if t else ""
    if first in ("avisos", "aviso", "alertas", "alerta") or t == "5":
        return {"intent": "notices"}
    if first in ("guias", "guia", "contenido", "contenidos", "educacion", "biblioteca") or t == "6":
        return {"intent": "library", "crop": crop}
    if first in ("cultivos", "cultivo", "mis") and ("cultivo" in t):
        return {"intent": "my_crops"}

    report_words = {"cayo", "avisar", "reportar", "reporto", "aviso", "cae", "esta cayendo", "hubo"}
    kind = next((OBS_KINDS[w] for w in words if w in OBS_KINDS), None)
    if kind and (words & report_words or "en mi zona" in t):
        return {"intent": "report", "kind": kind}
    if words & {"reunion", "reuniones", "asamblea", "convocatoria"}:
        return {"intent": "meeting"}
    if words & {"sembrar", "siembra", "siembro", "sembramos", "plantar"} or (crop and "cuando" in words) or t == "1":
        return {"intent": "sowing", "crop": crop}
    if words & {"helada", "heladas", "frio", "clima", "tiempo", "lluvia", "llover", "llovera", "granizo", "temperatura"} or t == "2":
        return {"intent": "weather", "tomorrow": "manana" in words}
    if t == "3":
        return {"intent": "meeting"}
    if t == "4":
        return {"intent": "report", "kind": None}
    if crop:
        return {"intent": "sowing", "crop": crop}
    return {"intent": "unknown"}

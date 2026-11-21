"""Plantillas de WhatsApp (contratos adaptados de PACHAAGRO: services/whatsapp/templates.ts).

Los mensajes iniciados por AgroBolivia deben usar plantillas APROBADAS por Meta. Aquí se define el
contrato (nombre, cuerpo con {{n}} y parámetros) para registrarlas en Meta, y la vista previa que
se guarda en el historial. Todas recuerdan cómo darse de baja."""
from app.core.config import get_settings

BAJA = "Responda BAJA para no recibir más mensajes."


def _name(key: str, default: str) -> str:
    return getattr(get_settings(), f"whatsapp_template_{key}", "") or default


def meeting_template(title: str, community: str, when: str, place: str) -> dict:
    return {
        "name": _name("meeting", "recordatorio_reunion"),
        "parameters": [title, community, when, place],
        "preview": f"Recordatorio AgroBolivia\nReunión: {title}\nComunidad: {community}\nDía: {when}\nLugar: {place}\n"
                   f"¿Va a asistir? Responda SI o NO.\n{BAJA}",
    }


def regional_notice_template(title: str, summary: str, scope: str) -> dict:
    return {
        "name": _name("notice", "aviso_regional"),
        "parameters": [title, summary, scope],
        "preview": f"AgroBolivia · Aviso de la plataforma (no oficial)\n{title}\n{summary}\nPara: {scope}\n{BAJA}",
    }


TEMPLATE_CONTRACTS = [
    {"name": "recordatorio_reunion", "category": "UTILITY", "language": "es",
     "body": "Recordatorio AgroBolivia\nReunión: {{1}}\nComunidad: {{2}}\nDía: {{3}}\nLugar: {{4}}\n¿Va a asistir? Responda SI o NO.\n" + BAJA,
     "parameters": ["título", "comunidad", "fecha y hora", "lugar"]},
    {"name": "aviso_regional", "category": "UTILITY", "language": "es",
     "body": "AgroBolivia · Aviso de la plataforma (no oficial)\n{{1}}\n{{2}}\nPara: {{3}}\n" + BAJA,
     "parameters": ["título", "resumen", "alcance"]},
]

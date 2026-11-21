"""Canales de mensajería.

* SimulatorChannel: NO envía nada. Registra los mensajes como 'simulado'. Es el canal por defecto.
* CloudAPIChannel: WhatsApp Business Platform (Cloud API oficial de Meta). Solo se activa si
  WHATSAPP_ENABLED=true y existen credenciales en variables de entorno.

Reglas de la plataforma oficial que respeta esta arquitectura:
  * Mensajes iniciados por la organización (recordatorios, avisos) => solo con PLANTILLAS aprobadas
    por Meta y a usuarios que dieron su consentimiento (opt-in).
  * Respuestas de texto libre => solo dentro de la ventana de 24 h desde el último mensaje del usuario.
  * El usuario puede darse de baja escribiendo BAJA.
"""
import logging

import httpx

from app.core.config import get_settings

logger = logging.getLogger("agrobolivia.whatsapp")


class SimulatorChannel:
    name = "simulador"
    connected = False

    def send_text(self, to: str, text: str) -> dict:
        return {"status": "simulado", "id": None}

    def send_template(self, to: str, template: str, params: list[str]) -> dict:
        return {"status": "simulado", "id": None}


class CloudAPIChannel:
    name = "whatsapp_cloud_api"
    connected = True

    def __init__(self):
        s = get_settings()
        self.url = f"https://graph.facebook.com/{s.whatsapp_api_version}/{s.whatsapp_phone_number_id}/messages"
        self.headers = {"Authorization": f"Bearer {s.whatsapp_token}"}

    def _post(self, payload: dict) -> dict:
        """Devuelve el estado y el id de mensaje de Meta (para cruzarlo luego con los estados del webhook)."""
        try:
            r = httpx.post(self.url, json=payload, headers=self.headers, timeout=15)
        except httpx.HTTPError:
            logger.exception("Error enviando a WhatsApp Cloud API")
            return {"status": "fallido", "id": None}
        if r.status_code != 200:
            return {"status": "fallido", "id": None}
        try:
            mid = r.json()["messages"][0]["id"]
        except (ValueError, KeyError, IndexError):
            mid = None
        return {"status": "enviado", "id": mid}

    def send_text(self, to: str, text: str) -> dict:
        return self._post({"messaging_product": "whatsapp", "to": to.lstrip("+"), "type": "text", "text": {"body": text[:4096]}})

    def send_template(self, to: str, template: str, params: list[str]) -> dict:
        return self._post({"messaging_product": "whatsapp", "to": to.lstrip("+"), "type": "template",
                           "template": {"name": template, "language": {"code": "es"},
                                        "components": [{"type": "body", "parameters": [{"type": "text", "text": p} for p in params]}]}})


def get_channel():
    s = get_settings()
    if s.whatsapp_enabled and s.whatsapp_token and s.whatsapp_phone_number_id:
        return CloudAPIChannel()
    return SimulatorChannel()

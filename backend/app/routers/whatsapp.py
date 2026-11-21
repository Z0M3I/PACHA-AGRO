import hashlib
import hmac
import json
import logging

from fastapi import APIRouter, Depends, HTTPException, Query, Request, Response
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.ratelimit import chat_limiter, client_key
from app.db import get_db
from app.deps import current_user, optional_user
from app.models import OutboundMessage, User
from app.schemas import ChatIn
from app.services.whatsapp import assistant
from app.services.whatsapp.channels import get_channel

router = APIRouter(prefix="/api/whatsapp", tags=["whatsapp"])
logger = logging.getLogger("agrobolivia.whatsapp")


@router.get("/status")
def status():
    ch = get_channel()
    return {"channel": ch.name, "connected": ch.connected,
            "message": "WhatsApp Business conectado." if ch.connected else
            "SIMULADOR: WhatsApp no está conectado. Las conversaciones y recordatorios son simulados."}


@router.post("/simulate")
def simulate(body: ChatIn, request: Request, mode: str = Query("real", pattern="^(real|simulado)$"),
             user: User | None = Depends(optional_user), db: Session = Depends(get_db)):
    chat_limiter.check(client_key(request))
    key = f"user:{user.id}" if user else f"anon:{client_key(request)}:{body.session_id}"
    replies = assistant.handle(db, key, body.text, user, mode)
    return {"channel": "simulador", "connected": False, "replies": replies}


@router.get("/inbox")
def inbox(user: User = Depends(current_user), db: Session = Depends(get_db)):
    rows = db.scalars(select(OutboundMessage).where(OutboundMessage.user_id == user.id).order_by(OutboundMessage.id.desc()).limit(20))
    return [{"id": m.id, "template": m.template, "body": m.body, "status": m.status, "channel": m.channel,
             "created_at": m.created_at.isoformat(timespec="minutes")} for m in rows]


# ---- Webhook oficial de WhatsApp Cloud API (inactivo sin credenciales) ----

@router.get("/webhook")
def verify(mode: str = Query("", alias="hub.mode"), token: str = Query("", alias="hub.verify_token"),
           challenge: str = Query("", alias="hub.challenge")):
    s = get_settings()
    if s.whatsapp_verify_token and mode == "subscribe" and hmac.compare_digest(token, s.whatsapp_verify_token):
        return Response(content=challenge, media_type="text/plain")
    raise HTTPException(403, "Verificación fallida.")


@router.post("/webhook")
async def receive(request: Request, db: Session = Depends(get_db)):
    s = get_settings()
    if not (s.whatsapp_enabled and s.whatsapp_app_secret):
        raise HTTPException(503, "WhatsApp no está configurado en este servidor.")
    raw = await request.body()
    expected = "sha256=" + hmac.new(s.whatsapp_app_secret.encode(), raw, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, request.headers.get("X-Hub-Signature-256", "")):
        raise HTTPException(401, "Firma inválida.")
    payload = json.loads(raw)
    channel = get_channel()
    for entry in payload.get("entry", []):
        for change in entry.get("changes", []):
            for msg in change.get("value", {}).get("messages", []):
                if msg.get("type") != "text":
                    continue
                phone = "+" + msg["from"]
                user = db.scalar(select(User).where(User.phone == phone, User.is_active.is_(True)))
                for reply in assistant.handle(db, f"wa:{phone}", msg["text"]["body"], user):
                    channel.send_text(phone, reply)
    return {"ok": True}

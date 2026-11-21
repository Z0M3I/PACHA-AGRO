from fastapi import Depends, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import decode_token
from app.db import get_db
from app.models import Community, Membership, User


def optional_user(request: Request, db: Session = Depends(get_db)) -> User | None:
    auth = request.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None
    uid = decode_token(auth[7:])
    if uid is None:
        return None
    user = db.get(User, uid)
    return user if user and user.is_active else None


def current_user(user: User | None = Depends(optional_user)) -> User:
    if user is None:
        raise HTTPException(status_code=401, detail="Necesita ingresar con su cuenta.")
    return user


def admin_user(user: User = Depends(current_user)) -> User:
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Solo un administrador puede hacer esto.")
    return user


def get_approved_community(db: Session, community_id: int) -> Community:
    c = db.get(Community, community_id)
    if c is None or c.status != "approved":
        raise HTTPException(status_code=404, detail="Comunidad no encontrada.")
    return c


def membership_of(db: Session, user: User, community_id: int) -> Membership | None:
    return db.scalar(select(Membership).where(Membership.user_id == user.id, Membership.community_id == community_id))


def require_member(db: Session, user: User, community_id: int) -> Membership | None:
    """Miembro aprobado (o administrador)."""
    m = membership_of(db, user, community_id)
    if user.role == "admin":
        return m
    if m is None or m.status != "approved":
        raise HTTPException(status_code=403, detail="Debe ser miembro aprobado de esta comunidad.")
    return m


def require_representative(db: Session, user: User, community_id: int) -> None:
    if user.role == "admin":
        return
    m = membership_of(db, user, community_id)
    if m is None or m.status != "approved" or m.role != "representative":
        raise HTTPException(status_code=403, detail="Solo el representante de la comunidad puede hacer esto.")

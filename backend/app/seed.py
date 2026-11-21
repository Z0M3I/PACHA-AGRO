"""Datos iniciales. Las cuentas y la comunidad de demostración son FICTICIAS y están marcadas is_demo=True."""
from datetime import datetime, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.security import hash_password
from app.models import Community, Meeting, Membership, Notice, User

DEMO_PASSWORD = "demo1234"
DEMO_USERS = [
    ("+59170000001", "Representante Demo", "representative"),
    ("+59170000002", "Agricultora Demo", "member"),
]


def seed(db: Session) -> None:
    s = get_settings()
    if s.admin_password and not db.scalar(select(User).where(User.phone == s.admin_phone)):
        db.add(User(full_name="Administrador", phone=s.admin_phone, password_hash=hash_password(s.admin_password), role="admin"))
        db.commit()
    if not s.seed_demo or db.scalar(select(User).where(User.is_demo.is_(True))):
        return
    users = []
    for phone, name, _ in DEMO_USERS:
        u = User(full_name=name, phone=phone, password_hash=hash_password(DEMO_PASSWORD), is_demo=True,
                 whatsapp_opt_in=True, whatsapp_opt_in_at=datetime.now(), default_municipality_id="or-challapata")
        db.add(u)
        users.append(u)
    db.flush()
    c = Community(name="Comunidad Demo Challapata", department_id="oruro", municipality_id="or-challapata", status="approved",
                  is_demo=True, created_by=users[0].id, description="Comunidad FICTICIA para demostrar el prototipo.")
    db.add(c)
    db.flush()
    for u, (_, _, role) in zip(users, DEMO_USERS):
        db.add(Membership(user_id=u.id, community_id=c.id, role=role, status="approved"))
    start = (datetime.now() + timedelta(days=3)).replace(hour=10, minute=0, second=0, microsecond=0)
    db.add(Meeting(community_id=c.id, title="Planificación de siembra de quinua", place="Sede de la comunidad",
                   description="Revisaremos el pronóstico y organizaremos la siembra.", starts_at=start, created_by=users[0].id))
    db.add(Notice(community_id=c.id, title="Bienvenidos a la comunidad demo", category="general", author_id=users[0].id,
                  body="Este es un aviso de demostración. Aquí el representante publica información para todos."))
    db.commit()

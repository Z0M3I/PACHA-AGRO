from sqlalchemy.orm import Session

from app.models import ActivityLog


def log(db: Session, action: str, detail: str = "", user_id: int | None = None, community_id: int | None = None) -> None:
    db.add(ActivityLog(action=action, detail=detail[:500], user_id=user_id, community_id=community_id))

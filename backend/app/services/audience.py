"""Segmentación de avisos regionales (portado de PACHAAGRO: lib/announcements-audience.ts).

Un aviso es relevante para una persona si su alcance coincide con su ubicación o sus cultivos."""
from dataclasses import dataclass, field


@dataclass
class AudienceContext:
    department_id: str | None = None
    municipality_id: str | None = None
    crops: list[str] = field(default_factory=list)


def notice_matches(scope: str, department_id: str | None, municipality_id: str | None, crop_id: str | None,
                   ctx: AudienceContext) -> bool:
    if scope == "nacional":
        return True
    if scope == "departamento":
        return bool(department_id and department_id == ctx.department_id)
    if scope == "municipio":
        return bool(municipality_id and municipality_id == ctx.municipality_id)
    if scope == "cultivo":
        return bool(crop_id and crop_id in ctx.crops)
    return False

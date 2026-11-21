import re
import unicodedata


def normalize(text: str) -> str:
    t = unicodedata.normalize("NFKD", text.lower())
    t = "".join(c for c in t if not unicodedata.combining(c))
    t = re.sub(r"[^a-z0-9ñ\s]", " ", t)
    return re.sub(r"\s+", " ", t).strip()

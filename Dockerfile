# Imagen única: compila el frontend y lo sirve junto con la API FastAPI.
# Usada por Render (render.yaml) y por cualquier servicio compatible con Docker.

# --- Etapa 1: frontend ---
FROM node:20-alpine AS web
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
# Verifica que las dependencias quedaron instaladas (npm puede fallar sin devolver error).
RUN npm ci --no-audit --no-fund && test -x node_modules/.bin/vite
COPY frontend/ ./
RUN npm run build

# --- Etapa 2: backend ---
FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PIP_NO_CACHE_DIR=1
WORKDIR /app/backend
COPY backend/requirements.txt .
RUN pip install -r requirements.txt
COPY backend/app ./app
COPY --from=web /app/frontend/dist /app/frontend/dist
RUN useradd --create-home agro && chown -R agro /app
USER agro
EXPOSE 8000
# Render define $PORT. --proxy-headers para obtener la IP real del cliente detrás del proxy de Render
# (la usan los límites de intentos de inicio de sesión y registro).
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000} --proxy-headers --forwarded-allow-ips='*'"]

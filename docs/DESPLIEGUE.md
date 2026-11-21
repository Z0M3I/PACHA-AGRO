# Despliegue en Vercel

Arquitectura en Vercel:
- **Frontend** (`frontend/dist`) → CDN de Vercel.
- **Backend FastAPI** → una función Python (`api/index.py`) que atiende `/api/*`.
- **Base de datos** → **PostgreSQL** (recomendado: Neon, gratuito, desde el Marketplace de Vercel).

> ⚠️ Sin `DATABASE_URL` la función usa SQLite en `/tmp`: los datos se borran y **no se comparten entre instancias** (un usuario puede "desaparecer" entre una petición y otra). Úselo solo para una prueba rápida.

Configuración ya incluida en el repositorio: `vercel.json`, `api/index.py`, `requirements.txt` (raíz), `.vercelignore`.

## Pasos

1. Entre a <https://vercel.com> e inicie sesión con GitHub.
2. **Add New… → Project** → importe `mvjg2005/PACHA-AGRO`.
3. En la pantalla de configuración deje *Framework Preset: Other* y **no cambie** los comandos (los toma de `vercel.json`).
4. Abra **Environment Variables** y agregue:

   | Variable | Valor |
   |---|---|
   | `SECRET_KEY` | un texto largo y aleatorio (ver abajo) |
   | `ADMIN_PHONE` | su celular con prefijo, ej. `+59171234567` |
   | `ADMIN_PASSWORD` | una clave segura para el administrador |
   | `SEED_DEMO` | `true` (crea las cuentas y la comunidad de demostración) |

   Para generar `SECRET_KEY`:
   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(48))"
   ```
5. Pulse **Deploy**.
6. Agregue la base de datos: en el proyecto → **Storage** → **Create Database** → **Neon (Postgres)** → conéctela al proyecto. Vercel crea la variable `DATABASE_URL` automáticamente.
   *Si su integración crea la variable con otro nombre (p. ej. `POSTGRES_URL`), agregue manualmente `DATABASE_URL` con el mismo valor.*
7. **Deployments → … → Redeploy** para que tome `DATABASE_URL`. Las tablas y los datos de demostración se crean solos en la primera petición.
8. Verifique: `https://<su-proyecto>.vercel.app/api/health` debe responder `{"status":"ok"}`.

## Rama de producción

Vercel publica en producción la rama **`main`**. Si el código está en otra rama, esa rama genera solo un despliegue de *vista previa*. Fusione la rama en `main` (Pull Request) o cambie la rama de producción en *Settings → Git*.

## Limitaciones en Vercel

- **Arranque en frío**: la primera petición tras un rato inactivo tarda unos segundos más. Abra la app antes de presentar.
- **Estado en memoria por instancia**: caché del clima, conversaciones del simulador de WhatsApp y límites de intentos se reinician cuando Vercel recicla la función. Funciona para la demo; en producción usar Redis.
- **Open-Meteo gratuito** cuenta las consultas por IP; en plataformas en la nube la IP puede ser compartida y alcanzar el límite. La app muestra entonces historial de NASA POWER y ofrece la demostración simulada.
- **WhatsApp real** necesita la URL pública HTTPS de Vercel como webhook: `https://<su-proyecto>.vercel.app/api/whatsapp/webhook` (ver `WHATSAPP.md`).

## Verificado antes de publicar

- `vercel build` (CLI 39.3.0) ejecutado localmente: compila el frontend y empaqueta la función con `backend/app/**` y el driver `psycopg`.
- Punto de entrada probado sin eventos de arranque (como en Vercel) y con SQLite en `/tmp`.
- Suite e2e completa (13/13) ejecutada contra **PostgreSQL 16**.
- La inicialización de la base de datos tolera varias instancias arrancando a la vez.
- No se pudo hacer un despliegue real desde el entorno de desarrollo (requiere su cuenta de Vercel).

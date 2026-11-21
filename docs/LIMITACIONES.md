# Limitaciones conocidas y próximos pasos

## Limitaciones

1. **WhatsApp es un simulador.** No se envía ni recibe ningún mensaje real hasta configurar la Cloud API oficial (ver WHATSAPP.md).
2. **SENAMHI no está integrado**: no se muestran alertas oficiales; solo un enlace.
3. **Reglas agronómicas experimentales**: solo quinua en el Altiplano tiene escenario completo; papa y maíz son demostración; haba y cebada no tienen reglas.
4. **Ubicaciones aproximadas**: 32 municipios con coordenadas del centro urbano; las comunidades no tienen coordenadas propias.
5. **Resolución de datos**: NASA POWER (~50 km) y modelos globales no capturan microclimas de quebradas o laderas.
6. **Límite de Open-Meteo gratuito**: uso no comercial y ~10 000 llamadas/día por IP; un despliegue real necesita plan pagado, caché compartida o servidor propio.
7. **Estado del chat y límites de solicitudes en memoria**: se pierden al reiniciar y no escalan a varios procesos.
8. **Sin migraciones de base de datos** (se usa `create_all`); para producción agregar Alembic.
9. **Sin recuperación de clave** por SMS; un administrador debe asistir.
10. **Quechua y aimara**: estructura lista, contenido pendiente de traducción y revisión por hablantes.
11. **Sin modo sin conexión** (PWA/service worker) todavía.

## Próximos pasos sugeridos

- Convenio con SENAMHI para avisos oficiales y datos de estaciones.
- Validar umbrales y calendarios con técnicos de PROINPA/INIAF y productores; ampliar a papa y maíz.
- Conectar WhatsApp Cloud API con plantillas aprobadas y números de prueba.
- PWA con caché del último pronóstico para zonas sin señal.
- Migrar a PostgreSQL + Alembic + Redis; desplegar con HTTPS.
- Prueba piloto con una comunidad real, con consentimiento informado.

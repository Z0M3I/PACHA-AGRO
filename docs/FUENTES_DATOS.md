# Fuentes de datos meteorológicos — evaluación

Verificado durante el desarrollo el 21-11-2026 desde el entorno de desarrollo.

| Fuente | Qué aporta | Acceso | Cobertura / resolución | Limitaciones | Uso en AgroBolivia |
|---|---|---|---|---|---|
| **Open-Meteo** (`api.open-meteo.com`) | Pronóstico 7 días: Tmín/Tmáx, lluvia, probabilidad, código de tiempo, humedad del suelo por modelo | Sin clave. Gratis para uso **no comercial** (~10 000 llamadas/día), licencia de datos CC BY 4.0. Uso comercial requiere plan pagado | Global, combina modelos (≈ 1–25 km según modelo) | El límite diario se aplica por IP: **durante el desarrollo la IP compartida devolvió "Daily API request limit exceeded"**, lo que sirvió para probar el respaldo. No pronostica granizo de forma fiable en Bolivia | Pronóstico principal. Caché 1 h por ubicación; errores en caché 5 min para no saturar |
| **NASA POWER** (`power.larc.nasa.gov`) | Días recientes (Tmín, Tmáx, lluvia, humedad superficial GWETTOP) y climatología mensual (días con helada, lluvia) | Sin clave, gratuito. Citar a NASA POWER | Global, reanálisis MERRA-2/GEOS ≈ 0.5° (~50 km) | Retraso de varios días (`-999` en días aún no publicados; comprobado). Celda grande: valores pueden diferir mucho de la parcela, sobre todo en terreno montañoso | Historial reciente, respaldo de riesgo de helada (climatología) y humedad cuando falta el pronóstico. Caché 6 h / 30 días |
| **SENAMHI Bolivia** (`senamhi.gob.bo`) | Avisos y alertas oficiales, estaciones nacionales | No se encontró una API pública documentada; los avisos se publican en el sitio y canales oficiales | Nacional, oficial | Requiere convenio o acceso a datos abiertos para integrar | **No integrado.** La app lo dice explícitamente y enlaza al sitio oficial. Nunca se generan "alertas oficiales" |

## Reglas que sigue el sistema

1. Cada bloque devuelto por `/api/weather` incluye `source`, `kind` (`pronostico`, `estimacion`, `climatologia`, `simulado`) y `fetched_at`.
2. Si Open-Meteo falla → se muestra el error en español, se usa la climatología solo para un riesgo de helada *histórico* y la recomendación queda con confianza baja (máximo 🟡).
3. Si todas las fuentes fallan → riesgo "desconocido" y recomendación ⚪.
4. El modo **simulado** se activa solo cuando el usuario lo pide; nunca se mezcla con datos reales y se muestra con banda "DEMOSTRACIÓN".
5. Las coordenadas son aproximadas al centro urbano del municipio.

## Pruebas reproducibles

`backend/tests/fixtures/` contiene respuestas **reales** de NASA POWER para Oruro descargadas el 21-11-2026 y una respuesta de Open-Meteo con el **formato documentado** y valores sintéticos (porque la API estaba limitada ese día). Las pruebas no dependen de la red.

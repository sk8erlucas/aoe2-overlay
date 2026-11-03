# Fase 9: Cargar estrategias de la comunidad

**Objetivo:** que la web y el overlay arranquen con un catálogo útil: las estrategias más importantes y mejor valoradas de [Build Order Guide](https://www.buildorderguide.com/), publicadas con la cuenta del dueño del proyecto y con crédito a sus autores originales.

**Depende de:** Fase 3 (API) y, preferentemente, Fase 6 (API en producción). Se hace al final.

**Estado:** solo plan. No se ejecutó nada todavía.

## Por qué es viable

- Build Order Guide usa **el mismo formato JSON** que adoptamos en la Fase 1 (`name`, `civilization`, `author`, `source`, `build_order[]` con `villager_count`, `age`, `resources` y `notes`). Una estrategia de ahí se puede validar con `strategySchema` sin convertirla.
- La URL de ejemplo (`/#/build/aqo8MRuR07aaUKTSTt6V`) tiene un id con forma de documento de **Firestore**. Es probable que el sitio lea los datos desde Firebase y que se puedan pedir en JSON sin tener que leer el HTML.

## Tareas

### 1. Investigación (antes de escribir código)

- [ ] Revisar los **términos de uso** de Build Order Guide y la licencia del contenido. Si no permiten reutilizarlo, contactar a los mantenedores y pedir permiso o un export. Si no hay permiso, no se importa.
- [ ] Abrir el sitio con las herramientas de desarrollo del navegador y anotar de dónde salen los datos (Firestore REST, API propia o JSON estático) y qué campos trae cada estrategia: votos/rating, cantidad de vistas, fecha, autor y civ.
- [ ] Ver si existe un repositorio o export público con las estrategias. Si existe, usarlo en lugar de scrapear.
- [ ] Definir "más importantes": por ejemplo, el top por rating/vistas de cada civilización, más las genéricas más populares. Límite inicial: ~100 estrategias.

### 2. Script de importación (`scripts/import-community.ts`)

- [ ] Descarga la lista, ordena por rating/vistas y toma el top definido.
- [ ] Respeta el sitio: pedidos secuenciales con pausa (≥ 1 s), `User-Agent` genérico e identificable del proyecto, y caché local en `scripts/.cache/` (ignorada por git) para no repetir pedidos.
- [ ] Valida cada una con `strategySchema` y con los nombres de civs y mapas de `game-data`. Las inválidas quedan en un reporte y no se importan.
- [ ] Normaliza:
  - `name` sin espacios de más
  - `source` = URL original en Build Order Guide (crédito obligatorio)
  - `author` = autor original (se respeta, no se reemplaza)
  - `tags` incluye `buildorderguide`
- [ ] Completa extensiones cuando se puedan deducir (por ejemplo `map_types` desde el nombre: "Arena" → `closed`). Las dudosas se dejan vacías.
- [ ] Modo `--dry-run` que solo genera un JSON/reporte para revisar a mano antes de publicar.

### 3. Publicación con la cuenta del dueño

- [ ] Publicar por la API (`POST /api/strategies`) logueado con la cuenta del dueño del proyecto, para que queden con su usuario como `author` en la web (el autor original sigue visible en `authorName` y en `source`).
- [ ] Credenciales de esa cuenta: **solo por variables de entorno** al correr el script (`IMPORT_EMAIL`, `IMPORT_PASSWORD`), nunca en el repo.
- [ ] Idempotencia: guardar la URL de origen y no duplicar si se corre dos veces (actualizar si cambió).
- [ ] Marcar como `verified` solo las que se revisaron a mano (requiere un rol de moderador y un endpoint o script aparte).

### 4. Íconos

- [ ] Las notas de estas estrategias usan íconos `@resource/...@`. Hoy se muestran como texto ("aldeano", "madera"). Revisar que las etiquetas cubran los íconos más frecuentes del lote importado y ampliar `ICON_LABELS` en `packages/shared/src/notes.ts`.

## Criterio de terminado

- [ ] Hay permiso o los términos lo permiten (documentado en esta página)
- [ ] El catálogo tiene al menos una estrategia buena para cada civilización ranked
- [ ] Cada estrategia importada muestra el autor original y el link a la fuente
- [ ] Correr el import dos veces no crea duplicados

## Notas

- Con el formato compatible, la alternativa más simple y respetuosa es el **importar JSON del editor de la web** (Fase 4): cualquiera puede pegar una estrategia de Build Order Guide y publicarla con crédito.

# Fase 9: Cargar estrategias de la comunidad

**Objetivo:** que la web y el overlay arranquen con un catálogo útil: las estrategias más importantes y mejor valoradas de [Build Order Guide](https://www.buildorderguide.com/), publicadas con la cuenta del dueño del proyecto y con crédito a sus autores originales.

**Depende de:** Fases 3 y 6.

## Tareas

### Investigación

- [x] Build Order Guide usa el **mismo formato JSON** que adoptamos en la Fase 1: se valida con `strategySchema` sin convertir
- [x] Es una app Next.js que lee los datos de Firestore (proyecto `build-order-guide`)
- [x] El código es abierto con **licencia MIT**: [bergerjohannes/buildorderguide](https://github.com/bergerjohannes/buildorderguide) (© 2022-2026 Johannes Berger)
- [x] Las estrategias no están en ese repo: las suben los usuarios y viven en Firestore. Según su [`firestore.rules`](https://github.com/bergerjohannes/buildorderguide/blob/main/firestore.rules), la colección **`published-builds` es de lectura pública** (sin iniciar sesión); `builds` (borradores) y `ratings` son privadas
- [x] **Decisión (2026-11-12, Lucas):** se pueden importar las estrategias publicadas, siempre con el autor original y el link a la fuente. Si un autor pide que se quite la suya, se quita
- [ ] Avisarles a los mantenedores, como cortesía, que usamos sus estrategias con crédito (tarea 6 del [brief de publicidad](publicidad-brief-agente.md))
- [ ] Bajar las estrategias en masa: ver "Importación automática" abajo

### Importador (`pnpm --filter @age-overlay/api import:community`)

- [x] Lee una carpeta de JSON exportados, cada uno llamado con el id de Build Order Guide (`<id>.json`)
- [x] Valida el formato y las civs (avisa las desconocidas)
- [x] Crédito: conserva el `author` original y pone `source` = link a la estrategia original (si no trae otra fuente)
- [x] Agrega el tag `buildorderguide` y deduce mapas y tipo de mapa del nombre (Arena → cerrado, etc.)
- [x] Modo prueba por defecto; `--publish` para guardar
- [x] Publica con la cuenta indicada en `--author` (busca el usuario por email; no usa contraseñas)
- [x] Idempotente: slug fijo `<nombre>-<id>`; si se corre de nuevo, actualiza en vez de duplicar
- [x] La carpeta `imports/` está en `.gitignore` (el contenido de terceros no se versiona)
- [x] Tests (`apps/api/test/community.test.ts`)

### Notas de la comunidad

- [x] Las palabras clave del formato de la comunidad (`foodUnderTC`, `stragglerTree`, `feudalAge`, `battleElephant`…) se muestran en español en el overlay y la web (`translateKeywords` en `packages/shared/src/notes.ts`)
- [x] Sumadas `siegeWorkshop`, `batteringRam`, `mangonel` y `scorpion`
- [x] El importador quita el `undefined` que dejan algunas exportaciones ("Lure undefined @boar@") y lo avisa
- [x] Verbos y conectores de los pasos traducidos (`Create`, `Move`, `Research`, `on`, `from`, `to`…) y frases (`Click up to`)
- [x] Edificios escritos como texto (`market`, `house`…) y plurales según el número ("5 aldeanos")
- [x] Tecnologías y unidades con los nombres oficiales del juego en español (`resources/es/strings/key-value`)
- [ ] Ampliar el diccionario a medida que aparezcan palabras nuevas en las estrategias importadas

### Catálogo

- [x] 20-Min Elephant (Malayos) de pooplord, publicada (`/estrategias/20-min-elephant-aqo8mr`)
- [ ] Turcos: Fast Imperial
- [x] Cumanos: Ram Spam de tytythechoochoo (`/estrategias/ram-spam-cumans`). El JSON vino sin el id de Build Order Guide, así que se importó como `cumansRamSpam.json`
- [ ] Cumanos: Feudal TC boom / Fast Castle con 2 CU
- [x] Españoles: Scouts → Conqs de Tatoh, publicada (`/estrategias/scouts-conqs-spanis`). El JSON vino sin el id de Build Order Guide, así que se importó como `spanishScoutsConqs.json`
- [ ] Al menos una estrategia buena por cada civilización ranked
- [x] 3 TC Boom (genérica) de AOE Companion (`/estrategias/3-tc-boom-aoecom`)
- [ ] Las más votadas genéricas (scouts, arqueros, drush, FC)

### Importación automática (pendiente)

Hoy cada estrategia se baja a mano (ver "Cómo cargar más estrategias"). El objetivo es un script que traiga el catálogo publicado de una vez y lo pase por el importador que ya existe.

- [ ] Script `pnpm --filter @age-overlay/api fetch:bog` que lea `published-builds` por la API REST de Firestore (`https://firestore.googleapis.com/v1/projects/build-order-guide/databases/(default)/documents/published-builds`, paginado con `pageSize` y `pageToken`)
- [ ] Convertir los valores tipados de Firestore (`stringValue`, `integerValue`, `arrayValue`, `mapValue`…) a JSON común y guardarlos en `imports/buildorderguide/<id>.json`, con el id del documento. Revisar `src/lib/buildConverter.ts` de su repo, que convierte al formato de RTS Overlay
- [ ] Respetar el sitio: una pedida por segundo como máximo, `User-Agent` que identifique al proyecto, caché local y sin repetir la bajada completa más de una vez por mes
- [ ] Elegir qué publicar: ver qué campos traen los documentos (calificación, vistas, fecha, civilización) y quedarse con las mejores por civilización, en vez de publicar todo
- [ ] Publicar con `import:community --publish` (ya valida, da crédito, es idempotente y agrega el tag `buildorderguide`)
- [ ] Ampliar el diccionario de `notes.ts` con las palabras que queden en inglés después de importar
- [ ] Tests del conversor de Firestore con un documento de ejemplo

## Cómo cargar más estrategias

1. En Build Order Guide, abrí la estrategia y copiá su JSON (el sitio permite exportarla y copiarla) o descargala.
2. Guardala en `imports/buildorderguide/<id>.json`. El `<id>` es lo que va después de `#/build/` en la URL.
3. Probá: `pnpm --filter @age-overlay/api import:community ../../imports/buildorderguide --author tu@email.com`
4. Publicá: lo mismo, agregando `--publish`.

## Criterio de terminado

- [x] Hay permiso o los términos lo permiten: código MIT, estrategias de lectura pública y decisión documentada arriba (2026-11-12)
- [ ] El catálogo tiene al menos una estrategia buena para cada civilización ranked
- [x] Cada estrategia importada muestra el autor original y el link a la fuente
- [x] Correr el import dos veces no crea duplicados

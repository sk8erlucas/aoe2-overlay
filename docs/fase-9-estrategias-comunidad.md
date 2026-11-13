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
- [x] Bajar las estrategias en masa (2026-11-13): ver "Importación automática" abajo

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
- [x] Turcos: 29+2+2 Fast Imperial de Hera (importación automática)
- [x] Cumanos: Ram Spam de tytythechoochoo (`/estrategias/ram-spam-cumans`). El JSON vino sin el id de Build Order Guide, así que se importó como `cumansRamSpam.json`
- [x] Cumanos: 2 TC → Kipchaks de Hera (importación automática)
- [x] Españoles: Scouts → Conqs de Tatoh, publicada (`/estrategias/scouts-conqs-spanis`). El JSON vino sin el id de Build Order Guide, así que se importó como `spanishScoutsConqs.json`
- [ ] Al menos una estrategia buena por cada civilización ranked. Al 2026-11-13 faltan: Búlgaros, Drávidas, Godos, Kitán, Mapuches, Muiscas, Tupíes, Sajones, Shu, Varegos, Wei y Wu. En Build Order Guide no tienen builds con calificación (o solo de menos de 3★): cargarlas a mano o esperar a que las califiquen
- [x] 3 TC Boom (genérica) de AOE Companion (`/estrategias/3-tc-boom-aoecom`)
- [x] Las más votadas genéricas: Archers y Men-at-Arms → Archers de Hera (importación automática), más las base de AoE2 Overlay (scouts, arqueros, drush, FC)

### Importación automática (hecha 2026-11-13)

- [x] `pnpm --filter @age-overlay/api fetch:bog` lee `published-builds` por la API REST de Firestore, paginado, y guarda todo en `imports/buildorderguide-raw/` (caché de 30 días; `--refresh` para bajar de nuevo)
- [x] Conversión al formato del overlay en `apps/api/src/db/bog.ts`: port de `exportForRTSOverlay` de su repo (MIT, con atribución en el archivo), el mismo que usa su botón "exportar"
- [x] Respeta el sitio: una pedida por segundo, `User-Agent` del proyecto y caché local
- [x] Selección por civilización con puntaje bayesiano sobre `avg_rating` y `number_of_ratings`: 2 por civ con 3 o más calificaciones, puntaje mínimo de 3★ y, si una civ no tiene ninguna así, 1 de relleno con al menos una calificación. Saltea las que ya se cargaron a mano (mismo nombre y autor). Opciones: `--per-civ`, `--min-ratings`, `--min-score`, `--no-fill`
- [x] Escribe las elegidas en `imports/buildorderguide-auto/<id>.json`; se publican con `import:community`, que valida, da crédito, es idempotente y agrega el tag `buildorderguide`
- [x] Primera corrida: 725 estrategias publicadas en Build Order Guide → 57 elegidas y publicadas. El catálogo pasó de 9 a 66 estrategias públicas
- [x] Diccionario ampliado con lo que quedaba en inglés: palabras con mayúscula (`Militia`), nombres de dos palabras (`Archery range`), comercio (`Sell`, `Buy`) y etiquetas de íconos de unidades y tecnologías con su nombre oficial
- [x] Sajones y Varegos agregados a `game-data` (faltaban)
- [x] Tests en `apps/api/test/bog.test.ts`
- [ ] Repetir una vez por mes (`fetch:bog --refresh` y `import:community --publish`): suma las que vayan recibiendo calificaciones
- [ ] Lo que queda en inglés es texto libre de cada autor ("Use your scout to…"); se podría traducir aparte

## Cómo cargar más estrategias

**Automático (recomendado):**

1. `pnpm --filter @age-overlay/api fetch:bog --refresh`
2. Probá: `pnpm --filter @age-overlay/api import:community ../../imports/buildorderguide-auto --author tu@email.com`
3. Publicá: lo mismo, agregando `--publish`.

**A mano (una estrategia puntual):**

1. En Build Order Guide, abrí la estrategia y copiá su JSON (el sitio permite exportarla y copiarla) o descargala.
2. Guardala en `imports/buildorderguide/<id>.json`. El `<id>` es lo que va después de `/builds/` en la URL.
3. Probá: `pnpm --filter @age-overlay/api import:community ../../imports/buildorderguide --author tu@email.com`
4. Publicá: lo mismo, agregando `--publish`.

## Criterio de terminado

- [x] Hay permiso o los términos lo permiten: código MIT, estrategias de lectura pública y decisión documentada arriba (2026-11-12)
- [ ] El catálogo tiene al menos una estrategia buena para cada civilización ranked (faltan 12, ver "Catálogo")
- [x] Cada estrategia importada muestra el autor original y el link a la fuente
- [x] Correr el import dos veces no crea duplicados

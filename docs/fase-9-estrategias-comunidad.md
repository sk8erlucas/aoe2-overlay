# Fase 9: Cargar estrategias de la comunidad

**Objetivo:** que la web y el overlay arranquen con un catálogo útil: las estrategias más importantes y mejor valoradas de [Build Order Guide](https://www.buildorderguide.com/), publicadas con la cuenta del dueño del proyecto y con crédito a sus autores originales.

**Depende de:** Fases 3 y 6.

## Tareas

### Investigación

- [x] Build Order Guide usa el **mismo formato JSON** que adoptamos en la Fase 1: se valida con `strategySchema` sin convertir
- [x] Es una app Next.js que lee los datos de Firestore (colección `builds`)
- [x] No publica términos de uso ni licencia del contenido (`/terms` da 404)
- [ ] Contactar a los mantenedores de Build Order Guide para pedir permiso o un export oficial
- [ ] Bajar las estrategias elegidas. La consulta directa a su Firestore fue bloqueada por el sistema de permisos del asistente; ver "Cómo cargar más estrategias"

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

## Cómo cargar más estrategias

1. En Build Order Guide, abrí la estrategia y copiá su JSON (el sitio permite exportarla y copiarla) o descargala.
2. Guardala en `imports/buildorderguide/<id>.json`. El `<id>` es lo que va después de `#/build/` en la URL.
3. Probá: `pnpm --filter @age-overlay/api import:community ../../imports/buildorderguide --author tu@email.com`
4. Publicá: lo mismo, agregando `--publish`.

## Criterio de terminado

- [ ] Hay permiso o los términos lo permiten (documentado en esta página)
- [ ] El catálogo tiene al menos una estrategia buena para cada civilización ranked
- [x] Cada estrategia importada muestra el autor original y el link a la fuente
- [x] Correr el import dos veces no crea duplicados

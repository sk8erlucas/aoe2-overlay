# Fase 1: Modelo y datos compartidos

**Objetivo:** definir una sola vez qué es una estrategia y los datos del juego, para que overlay, web y API usen lo mismo.

**Depende de:** Fase 0.

## Tareas

### `packages/shared`

- [x] Esquema Zod `Strategy` compatible con el formato de la comunidad + extensiones (ver [strategies/README.md](../../strategies/README.md))
- [x] Esquema Zod `Step` (villager_count, age, time opcional, resources con builder, notes)
- [x] Constantes: `AGES`, `MAP_TYPES`, `POSITIONS`, `DIFFICULTIES`, `GENERIC_CIVS`
- [x] Utilidades de tiempo: `gameToReal`, `realToGame`, `formatClock`, `parseClock`, `DEFAULT_SPEED = 1.7`
- [x] `estimateStepTimes(steps)`: estima el tiempo de cada paso a partir de los aldeanos y los avances de edad
- [x] `getStepAt(times, gameSeconds)`: paso actual, siguiente y segundos restantes
- [x] `parseNote` / `noteToText`: soporte de íconos `@categoria/archivo.png@` con etiquetas en español
- [x] `scoreStrategy` y `suggest` para las sugerencias
- [x] Tests con Vitest (29 tests), con un fixture en el formato de la comunidad

### `packages/game-data`

- [x] Civs: id, nombre EN/ES (53 civs ranked, hasta The Last Chieftains)
- [x] Mapas: id, nombre EN/ES y tipo (open/closed/hybrid/water), incluyendo Selva Negra, Arabia, Arena, etc.
- [x] `findCiv`, `findMap`, `mapTypeOf` (buscan por id, inglés o español)
- [x] Tests
- [ ] Bonus de cada civ resumido (pasa a "opcional", no bloquea la Fase 2)

### `strategies/`

- [x] Formato documentado en `strategies/README.md`
- [x] Estrategias base escritas por nosotros (en español, sin íconos):
  - [x] Scouts (Feudal)
  - [x] Arqueros (Feudal)
  - [x] Drush → Fast Castle
  - [x] Fast Castle Boom
  - [x] Hombres de armas → Arqueros
- [x] Script `pnpm validate:strategies`: valida esquema, nombres de archivo, civs y mapas, y avisa si los recursos no suman los aldeanos. Corre en CI
- [ ] Que un jugador con experiencia revise las 5 estrategias base

## Criterio de terminado

- [x] Tests de `shared` en verde
- [x] Todas las estrategias de `strategies/` pasan la validación

## Notas

- **Decisión:** usamos el formato de la comunidad (Build Order Guide / RTS Overlay) como base, para poder importar estrategias existentes. Los pasos van por cantidad de aldeanos y el tiempo es opcional; si falta, se estima.
- **No hace falta DB en esta fase.** El esquema de la Fase 3 se deriva de este: el JSON completo en `jsonb` más columnas para filtrar.
- Los paquetes internos exportan TypeScript directo (`exports: ./src/index.ts`), sin paso de build. Vite, Next (`transpilePackages`) y tsx los consumen así.
- La lista de civs y mapas puede quedar desactualizada con DLCs nuevas: se agregan en `packages/game-data/src/`.
- Pendiente decidir el tema íconos (ver [arquitectura.md](../arquitectura.md#pendiente-íconos)).

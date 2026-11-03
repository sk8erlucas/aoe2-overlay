# Fase 1: Modelo y datos compartidos

**Objetivo:** definir una sola vez qué es una estrategia y los datos del juego, para que overlay, web y API usen lo mismo.

**Depende de:** Fase 0.

## Tareas

### `packages/shared`

- [ ] Esquema Zod `Step` (gameTimeSec, pop, villagers, text, icon)
- [ ] Esquema Zod `Strategy` (ver [arquitectura.md](arquitectura.md#modelo-de-datos))
- [ ] Enums: `MapType`, `Position`, `Difficulty`
- [ ] Utilidades de tiempo: `gameToReal(sec, speed)`, `realToGame(sec, speed)`, `formatClock(sec)`, constante `DEFAULT_SPEED = 1.7`
- [ ] `getCurrentStep(steps, gameTimeSec)` → paso actual, siguiente y segundos restantes
- [ ] `scoreStrategy(strategy, context)` y `suggest(strategies, context)` para las sugerencias
- [ ] Tests con Vitest para tiempo, paso actual y score

### `packages/game-data`

- [ ] `civs.json`: id, nombre ES/EN y bonus resumido (texto propio)
- [ ] `maps.json`: id, nombre ES/EN y tipo (open/closed/water/hybrid), incluyendo Selva Negra, Arabia, Arena, etc.
- [ ] Export tipado desde TS

### `strategies/`

- [ ] Formato documentado en `strategies/README.md`
- [ ] Estrategias base escritas por nosotros:
  - [ ] Scouts (Feudal)
  - [ ] Arqueros (Feudal)
  - [ ] Drush → Fast Castle
  - [ ] Fast Castle Boom
  - [ ] Hombres de armas → Arqueros
- [ ] Script `pnpm validate:strategies` que valida todos los JSON con Zod, ejecutado en CI

## Criterio de terminado

- [ ] Tests de `shared` en verde
- [ ] Todas las estrategias de `strategies/` pasan la validación

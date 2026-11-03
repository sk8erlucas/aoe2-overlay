# Arquitectura

## Decisiones

- **Monorepo único y público**: overlay, web y API viven en el mismo repo. Una licencia, un issue tracker y tipos compartidos.
- **Licencia MIT** (se puede revisar antes del primer release si se prefiere GPL-3.0).
- **Stack TypeScript completo**:
  - Overlay: **Tauri v2** (Rust mínimo + React/TypeScript/Vite). Instalador NSIS/MSI liviano.
  - Web: **Next.js** (App Router) + Tailwind.
  - API: **Fastify** + **Drizzle ORM** + **PostgreSQL**. Auth con **Better Auth**.
  - Validación compartida con **Zod**.
- Tooling: **pnpm workspaces + Turborepo**, Vitest, ESLint, Prettier.
- El overlay **no lee datos del juego**. El usuario da _Start_ al iniciar la partida y un reloj avanza ajustado a la velocidad de la partida (por defecto **1.7**, la velocidad "Normal" de DE).
- Sugerencias: **selección manual** (mapa, civ, rival, posición) primero. La detección automática queda para el futuro.
- Estrategias **públicas, con votos, favoritos y reportes**.

## Estructura del repo

```
age_overlay/
├─ apps/
│  ├─ overlay/          # Tauri v2 (src-tauri/ en Rust + src/ en React)
│  ├─ web/              # Next.js
│  └─ api/              # Fastify + Drizzle
├─ packages/
│  ├─ shared/           # Esquemas Zod, utilidades de tiempo, score de sugerencias, cliente API
│  ├─ game-data/        # Civs, mapas y tipos de mapa (solo texto/ids, sin assets del juego)
│  └─ config/           # tsconfig, eslint, prettier compartidos
├─ strategies/          # Build orders base en JSON (contribuibles por PR) → seed de la DB
├─ docs/                # Este roadmap
├─ docker-compose.yml   # Postgres local
└─ .github/workflows/   # CI + release del instalador
```

## Modelo de datos

**Decisión (Fase 1):** adoptamos el **formato de la comunidad** (Build Order Guide / RTS Overlay) como formato base, más extensiones opcionales propias. Así se pueden importar las estrategias existentes sin convertirlas. La especificación completa está en [strategies/README.md](../strategies/README.md) y el esquema en `packages/shared/src/schema.ts`.

- **Strategy** (JSON):
  - `name`, `civilization` (civ en inglés, lista de civs o `"Generic"`), `author`, `source?`, `description?`, `build_order[]`
  - Extensiones: `maps?`, `map_types?`, `vs_civilizations?`, `positions?`, `difficulty?`, `tags?`
- **Step**: `{ villager_count, age (1-4), time?, resources: { wood, food, gold, stone, builder? }, notes[] }`
  - Los pasos se indexan por **cantidad de aldeanos**, no por tiempo.
  - Si falta `time`, se estima con `estimateStepTimes`: 25 s por aldeano desde los 3 iniciales, más los avances de edad (130/160/190 s).
  - Los tiempos están en **segundos de juego**. Conversión: `tiempoReal = tiempoJuego / velocidad`.
  - Las `notes` aceptan íconos `@categoria/archivo.png@`. Se muestran como texto mientras no haya un set de íconos propio (ver "Pendiente" abajo).
- **Tabla `strategies`:** guarda el JSON completo (`jsonb`) más columnas derivadas para filtrar: slug, authorId, civs[], maps[], map_types[], positions[], votes, visibility, verified, createdAt y updatedAt.
- **User**, **Session** y **Account** (Better Auth), con rol `user | moderator | admin`.
- **Vote** (userId, strategyId, valor ±1), **Favorite**, **Report**.

### Score de sugerencias

Se implementa en `packages/shared/src/suggest.ts` y lo comparten el overlay (offline) y la API.

| Criterio                          | Puntos                |
| --------------------------------- | --------------------- |
| Civ exacta                        | +50                   |
| Estrategia genérica               | +10                   |
| Mapa exacto                       | +30                   |
| Tipo de mapa                      | +20                   |
| Civ rival                         | +15                   |
| Posición (coincide / no coincide) | +10 / −10             |
| Votos                             | +5 × log10(1 + votos) |

Se descartan las estrategias de otra civ y las de otro tipo de mapa (salvo que el mapa exacto esté en su lista).

### Pendiente: íconos

Las estrategias de la comunidad usan íconos del juego (`@resource/MaleVillDE.jpg@`). Las _Game Content Usage Rules_ de Microsoft permiten usar assets en proyectos de fans no comerciales, pero esos assets no pueden quedar bajo la licencia MIT. Opciones a decidir antes de la Fase 2:

1. Íconos propios u open source (sin riesgo legal).
2. Assets del juego en una carpeta separada, con su propio aviso de licencia.

## Overlay: detalles técnicos

- Ventana: `transparent`, `decorations: false`, `alwaysOnTop`, `skipTaskbar`, `focus: false`, `shadow: false`. Se posiciona arriba a la derecha del monitor primario.
- **Click-through** con `set_ignore_cursor_events(true)`. Una hotkey global alterna entre modo juego (click-through) y modo edición (interactivo).
- No roba foco: `WS_EX_NOACTIVATE` en modo juego y se muestra con `SW_SHOWNOACTIVATE`.
- **Pantalla completa:** probado con AoE2 y el overlay se ve bien. No hace falta inyectar nada en el proceso del juego: es una ventana común "siempre encima", sin tocar el juego.
- Plugins: global-shortcut, store, updater, single-instance.
- Offline-first: incluye las estrategias base y cachea las descargadas de la API.

## Hosting

- Web y API en **Dokploy** (Docker, ver [deploy-dokploy.md](deploy-dokploy.md)), Postgres en un **servidor propio** (Postgres 18). La conexión se configura solo por variables de entorno, nunca en el repo.
- Instalador en **GitHub Releases**, compilado por GitHub Actions (`tauri-action`), con auto-update.

## Legal

Proyecto de fans, no afiliado a Microsoft. Solo se usan nombres de civs y mapas como texto, sin assets del juego. Se incluye el disclaimer de las _Microsoft Game Content Usage Rules_.

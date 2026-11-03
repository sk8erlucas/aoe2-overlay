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

- **Step**: `{ gameTimeSec, pop?, villagers?: { food, wood, gold, stone }, text, icon? }`
  - El tiempo se guarda en **segundos de juego** (el reloj que muestra el juego).
  - Conversión: `tiempoReal = tiempoJuego / velocidad`.
- **Strategy**: id, slug, title, description, authorId, civs[] (vacío = cualquiera), mapTypes[] (open/closed/water/hybrid), maps[], vsCivs[], positions[] (1v1/flank/pocket), difficulty, tags[], steps[], version, visibility, verified, createdAt, updatedAt.
- **User**, **Session** y **Account** (Better Auth), con rol `user | moderator | admin`.
- **Vote** (userId, strategyId, valor ±1), **Favorite**, **Report**.

### Score de sugerencias

Se suman puntos por coincidir con civ propia, mapa exacto (o, si no, tipo de mapa), civ rival y posición. Después se pondera por votos. Las estrategias que contradicen un filtro explícito, como una civ distinta, se descartan.

## Overlay: detalles técnicos

- Ventana: `transparent`, `decorations: false`, `alwaysOnTop`, `skipTaskbar`, `focus: false`, `shadow: false`. Se posiciona arriba a la derecha del monitor primario.
- **Click-through** con `set_ignore_cursor_events(true)`. Una hotkey global alterna entre modo juego (click-through) y modo edición (interactivo).
- No roba foco: `WS_EX_NOACTIVATE` vía el crate `windows` si hace falta.
- **Pantalla completa:** con el juego en _Borderless_ funciona siempre. En "pantalla completa" puede funcionar igual si Windows aplica _fullscreen optimizations_ (hay que verificarlo en la Fase 2). Si no, existe el **modo inyección** (ver abajo).

### Modo inyección (opcional, para pantalla completa exclusiva)

Es la misma técnica que usan Discord, Steam y OBS:

- Una DLL (Rust o C++) se inyecta en `AoE2DE_s.exe`.
- Intercepta `IDXGISwapChain::Present` de DirectX 11.
- Dibuja el overlay dentro del frame del juego con ImGui.
- El estado (estrategia, reloj, paso actual) le llega desde la app de Tauri por _named pipe_.

Riesgos:

- Falsos positivos de antivirus. Se mitiga con firma de código y código abierto.
- Zona gris respecto a los términos de servicio del juego.
- Más mantenimiento.

Decisiones:

- **Desactivado por defecto.** El usuario lo activa a mano, con un aviso explícito de riesgos.
- No lee ni modifica la memoria del juego: solo dibuja.
- Plugins: global-shortcut, store, updater, single-instance.
- Offline-first: incluye las estrategias base y cachea las descargadas de la API.

## Hosting

- Web en **Vercel**, API en **Fly.io o Railway**, Postgres en **Neon**.
- Instalador en **GitHub Releases**, compilado por GitHub Actions (`tauri-action`), con auto-update.

## Legal

Proyecto de fans, no afiliado a Microsoft. Solo se usan nombres de civs y mapas como texto, sin assets del juego. Se incluye el disclaimer de las _Microsoft Game Content Usage Rules_.

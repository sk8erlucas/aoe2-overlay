# Cómo contribuir

¡Gracias por querer ayudar! Este proyecto es open source y está abierto a contribuciones de código, de estrategias y de documentación.

## Antes de empezar

- Mirá el [roadmap](docs/README.md) y las issues abiertas. Las marcadas `good first issue` son ideales para empezar.
- Para cambios grandes, abrí primero una issue para discutir la idea.
- Respetá el [Código de Conducta](CODE_OF_CONDUCT.md).

## Setup

```bash
git clone <url-del-repo>
cd age_overlay
corepack enable
pnpm install
```

Comandos útiles:

| Comando          | Qué hace                                  |
| ---------------- | ----------------------------------------- |
| `pnpm dev`       | Levanta todas las apps en modo desarrollo |
| `pnpm lint`      | ESLint en todo el monorepo                |
| `pnpm typecheck` | Chequeo de tipos de TypeScript            |
| `pnpm test`      | Tests                                     |
| `pnpm format`    | Formatea con Prettier                     |

## Flujo de trabajo

1. Hacé un fork y creá una rama desde `main`: `feat/overlay-hotkeys`, `fix/reloj-velocidad`, etc.
2. Hacé commits chicos siguiendo [Conventional Commits](https://www.conventionalcommits.org/es/):
   - `feat: ...` para funcionalidad nueva
   - `fix: ...` para correcciones
   - `docs: ...`, `refactor: ...`, `test: ...`, `chore: ...`
   - Opcionalmente con scope: `feat(overlay): hotkey para pausar el reloj`
3. Antes del PR corré `pnpm lint && pnpm typecheck && pnpm test && pnpm format:check`.
4. Abrí el PR completando la plantilla. El CI tiene que pasar.

## Aportar estrategias

Las estrategias base viven en `strategies/` como JSON (disponible desde la Fase 1). El formato se documenta en `strategies/README.md`. También vas a poder crearlas desde la web.

- Los tiempos se escriben en **tiempo de juego** (el reloj que muestra el juego).
- Escribí los textos con tus propias palabras. No copies guías de terceros sin permiso.

## Assets y contenido del juego

No subas imágenes, íconos, sonidos ni otros assets extraídos del juego. Usamos solo nombres de civilizaciones y mapas como texto.

## Seguridad

Si encontrás una vulnerabilidad, no abras una issue pública. Usá _Report a vulnerability_ en la pestaña Security de GitHub.

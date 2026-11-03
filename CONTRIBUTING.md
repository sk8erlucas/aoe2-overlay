# Cómo contribuir

¡Gracias por querer ayudar! Este proyecto es open source y está abierto a contribuciones de código, de estrategias y de documentación.

## Antes de empezar

- Mirá el [roadmap](docs/README.md) y las issues abiertas. Las marcadas `good first issue` son ideales para empezar.
- Para cambios grandes, abrí primero una issue para discutir la idea.
- Respetá el [Código de Conducta](CODE_OF_CONDUCT.md).

## Setup

```bash
git clone https://github.com/sk8erlucas/aoe2-overlay.git
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

### API y base de datos

Usá tu propia base local: nunca la de producción.

```bash
docker compose up -d                    # Postgres local
cp apps/api/.env.example apps/api/.env  # y completá DATABASE_URL y BETTER_AUTH_SECRET
pnpm --filter @age-overlay/api db:migrate
pnpm --filter @age-overlay/api db:seed
pnpm --filter @age-overlay/api dev      # http://localhost:3001/api/docs
```

Los tests de la API (`pnpm --filter @age-overlay/api test`) usan Postgres en memoria (PGlite): no necesitan Docker ni `.env`.

Si cambiás `apps/api/src/db/schema.ts`, generá la migración con `pnpm --filter @age-overlay/api db:generate` y commiteala.

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

Las estrategias base viven en `strategies/` como JSON. El formato se documenta en `strategies/README.md`. También vas a poder crearlas desde la web.

- Los tiempos se escriben en **tiempo de juego** (el reloj que muestra el juego).
- Escribí los textos con tus propias palabras. No copies guías de terceros sin permiso.

## Assets y contenido del juego

No subas imágenes, íconos, sonidos ni otros assets extraídos del juego. Usamos solo nombres de civilizaciones y mapas como texto.

## Secretos: el repo es público

- **Nunca** commitees `.env`, contraseñas, URLs de bases con credenciales ni tokens. Solo `.env.example` con valores vacíos.
- El CI corre gitleaks sobre todo el historial y falla si encuentra algo.
- Si se te escapó un secreto, avisá a los mantenedores en privado: hay que rotarlo.

## Seguridad

Si encontrás una vulnerabilidad, no abras una issue pública. Ver [SECURITY.md](SECURITY.md).

# Fase 3: API y base de datos

**Objetivo:** un backend que guarde usuarios y estrategias y resuelva sugerencias.

**Depende de:** Fase 1.

## Tareas

### Infra local

- [x] `docker-compose.yml` con Postgres 18 (solo para desarrollo local)
- [x] `apps/api/.env.example` (DATABASE_URL, DATABASE_SSL, BETTER_AUTH_SECRET, BETTER_AUTH_URL, CORS_ORIGINS, PORT)
- [x] Variables validadas con Zod al arrancar (`src/env.ts`), sin imprimir sus valores

### Base de datos (Drizzle)

- [x] Tablas: user, session, account, verification (Better Auth), strategies, votes, favorites, reports
- [x] Estrategia guardada como `jsonb` + columnas derivadas para filtrar (civs, maps, map_types, positions, vs_civs, difficulty)
- [x] Índices GIN en los arrays e índices en score, fecha y autor
- [x] Migraciones con `drizzle-kit generate` (commiteadas en `apps/api/drizzle/`)
- [x] Seed idempotente desde `strategies/*.json`, marcadas como `verified`
- [x] Aplicado en la base de producción (migración + seed de las 5 estrategias)

### Servidor (Fastify 5)

- [x] Validación y documentación con Zod (`fastify-type-provider-zod`)
- [x] Better Auth montado en `/api/auth/*`: registro, login, logout y sesión con email y contraseña
- [x] Roles user/moderator/admin. El rol no se puede elegir al registrarse; se cambia con `pnpm --filter @age-overlay/api user:role <email> <rol>`
- [x] `GET /api/strategies` con filtros (civ, map, mapType, position, q), orden (top/new) y paginación
- [x] `GET /api/strategies/:slug` (con myVote, isFavorite y canEdit)
- [x] `POST /api/strategies`, `PUT /api/strategies/:id`, `DELETE /api/strategies/:id` (autor o moderador)
- [x] Visibilidad: public, unlisted (solo por link) y hidden (moderación; el autor no puede revertirla)
- [x] `POST /api/strategies/:id/vote`, `/favorite` y `/report`
- [x] `GET /api/me`, `/api/me/strategies` y `/api/me/favorites`
- [x] `GET /api/reports` y `PATCH /api/reports/:id` (moderadores; puede ocultar la estrategia)
- [x] `GET /api/suggestions` (reusa `suggest` de `shared`, ponderado por votos)
- [x] `GET /api/game-data` y `GET /api/health`
- [x] Rate limit (120/min general, 30/min auth, 10/h reportes), CORS con lista de orígenes y helmet
- [x] Documentación OpenAPI en `/api/docs`
- [x] Logs que ocultan cookies y headers de autorización

### Tests

- [x] 29 tests de integración contra Postgres en memoria (PGlite): no tocan ninguna base real y corren en CI sin Docker
- [x] Incluidos en el CI (`pnpm test`)

### Seguridad del repo público

- [x] `.env` ignorado por git; verificado que ninguna credencial está en el historial ni en los archivos nuevos
- [x] Job `secrets` en CI con gitleaks sobre todo el historial
- [x] Secret scanning y push protection de GitHub activados
- [x] `SECURITY.md` y sección de secretos en `CONTRIBUTING.md`

## Criterio de terminado

- [x] `pnpm --filter @age-overlay/api dev` levanta la API conectada a la base
- [x] Flujo registro → crear estrategia → votar → aparece en `/suggestions`, cubierto por tests

## Notas

- **La base de producción no acepta SSL:** la contraseña y los datos viajan sin cifrar por internet. Antes del deploy (Fase 6) hay que activar SSL en el servidor (y usar `DATABASE_SSL=require`) o limitar el puerto 5489 por firewall a la IP del servidor de la API.
- Las cookies de sesión son `HttpOnly` y `SameSite=Lax`. Con `BETTER_AUTH_URL` en https también son `Secure`.
- Para el login desde el overlay (Fase 5), Better Auth trae los plugins `device-authorization` y `bearer`.
- El primer admin se crea registrándose normalmente y después con `pnpm --filter @age-overlay/api user:role tu@email.com admin`.

# Fase 3: API y base de datos

**Objetivo:** un backend que guarde usuarios y estrategias y resuelva sugerencias.

**Depende de:** Fase 1.

## Tareas

### Infra local

- [ ] `docker-compose.yml` con Postgres
- [ ] `apps/api/.env.example` (DATABASE_URL, AUTH_SECRET, CORS_ORIGINS, etc.)

### Base de datos (Drizzle)

- [ ] Tablas: users, sessions, accounts, strategies, votes, favorites, reports
- [ ] Índices para filtros (civs, maps y mapTypes como arrays con GIN)
- [ ] Migraciones (`drizzle-kit`)
- [ ] Seed desde `strategies/*.json` marcadas como `verified`

### Servidor (Fastify)

- [ ] Estructura: plugins, rutas, servicios, validación con Zod (`fastify-type-provider-zod`)
- [ ] Better Auth: registro, login, logout y sesión
- [ ] Roles user/moderator/admin y middleware de autorización
- [ ] `GET /strategies` con filtros (civ, map, vsCiv, position, q), orden y paginación
- [ ] `GET /strategies/:slug`
- [ ] `POST /strategies`, `PATCH /strategies/:id`, `DELETE /strategies/:id` (autor o admin)
- [ ] `POST /strategies/:id/vote`, `POST /strategies/:id/favorite`, `POST /strategies/:id/report`
- [ ] `GET /suggestions` (reusa `suggest` de `shared`)
- [ ] `GET /game-data`
- [ ] `GET /health`
- [ ] Rate limit, CORS y helmet
- [ ] Documentación OpenAPI (`@fastify/swagger`)

### Tests

- [ ] Tests de integración contra Postgres (DB de compose o Testcontainers)
- [ ] Agregarlos al CI

## Criterio de terminado

- [ ] `docker compose up` + `pnpm --filter api dev` levanta todo
- [ ] Flujo registro → crear estrategia → votar → aparece en `/suggestions`, cubierto por tests

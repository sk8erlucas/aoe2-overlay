# API de AoE2 Overlay. Se construye desde la RAÍZ del repo:
#   docker build -f apps/api/Dockerfile .
# Las variables de entorno (DATABASE_URL, BETTER_AUTH_SECRET, ...) se pasan al correr
# el contenedor; nunca van en la imagen. Ver docs/deploy-dokploy.md.

FROM node:22-alpine
RUN corepack enable
WORKDIR /repo

# Primero solo los manifiestos, para cachear la instalación de dependencias.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/config/package.json packages/config/
COPY packages/shared/package.json packages/shared/
COPY packages/game-data/package.json packages/game-data/
COPY apps/api/package.json apps/api/
RUN pnpm install --frozen-lockfile --filter "@age-overlay/api..."

# Código: la API corre TypeScript con tsx (los paquetes internos no se compilan).
COPY packages packages
COPY strategies strategies
COPY apps/api apps/api

ENV NODE_ENV=production \
    PORT=3001 \
    HOST=0.0.0.0
WORKDIR /repo/apps/api
USER node
EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:${PORT}/api/health" || exit 1

# Al arrancar: migraciones → estrategias base (idempotente) → servidor.
CMD ["sh", "-c", "./node_modules/.bin/tsx src/db/migrate.ts && ./node_modules/.bin/tsx src/db/seed.ts && exec ./node_modules/.bin/tsx src/server.ts"]

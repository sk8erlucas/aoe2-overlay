# Web de AoE2 Overlay (Next.js standalone). Se construye desde la RAÍZ del repo:
#   docker build -f apps/web/Dockerfile --build-arg NEXT_PUBLIC_API_URL=https://api.tudominio.com .
# NEXT_PUBLIC_API_URL se "hornea" en el build: si cambia la URL de la API, hay que reconstruir.

FROM node:22-alpine AS build
RUN corepack enable
WORKDIR /repo

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/config/package.json packages/config/
COPY packages/shared/package.json packages/shared/
COPY packages/game-data/package.json packages/game-data/
COPY apps/web/package.json apps/web/
RUN pnpm install --frozen-lockfile --filter "@age-overlay/web..."

COPY packages packages
COPY apps/web apps/web

ARG NEXT_PUBLIC_API_URL
RUN test -n "$NEXT_PUBLIC_API_URL" || (echo "Falta el build arg NEXT_PUBLIC_API_URL" && exit 1)
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter @age-overlay/web build

# --- Imagen final: solo el servidor standalone y los archivos estáticos ---
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

COPY --from=build --chown=node:node /repo/apps/web/.next/standalone ./
COPY --from=build --chown=node:node /repo/apps/web/.next/static ./apps/web/.next/static
COPY --from=build --chown=node:node /repo/apps/web/public ./apps/web/public

USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:${PORT}/" >/dev/null || exit 1
CMD ["node", "apps/web/server.js"]

# Fase 0: Fundaciones del monorepo

**Objetivo:** dejar el repo listo para que cualquiera lo clone, instale y contribuya.

**Depende de:** nada.

## Tareas

### Repositorio

- [x] `git init` y `.gitignore` (node, Rust/target, .env, builds)
- [x] `LICENSE` (MIT)
- [x] `README.md`: qué es, capturas (más adelante), cómo correrlo en local
- [x] `CONTRIBUTING.md`: setup, convenciones de commits y cómo aportar estrategias
- [x] `CODE_OF_CONDUCT.md`
- [x] Crear el repo público en GitHub y hacer el primer push

### Tooling

- [x] `pnpm-workspace.yaml` con `apps/*` y `packages/*`
- [x] `package.json` raíz con scripts `dev`, `build`, `lint`, `typecheck`, `test`, `format`
- [x] Turborepo (`turbo.json`) con pipelines y caché
- [x] `packages/config`: `tsconfig.base.json`, ESLint y Prettier compartidos
- [x] `.editorconfig` y `.nvmrc` (Node LTS)

### CI

- [x] `.github/workflows/ci.yml`: install, lint, typecheck y test en cada PR
- [x] Plantillas de issue y PR (`.github/ISSUE_TEMPLATE`, `pull_request_template.md`)

## Criterio de terminado

- [x] `pnpm install && pnpm lint && pnpm typecheck` funciona en limpio
- [x] El CI corre en verde en GitHub

## Notas

- TypeScript fijado en `~6.0` porque `typescript-eslint` todavía no soporta TypeScript 7.
- Repo: https://github.com/sk8erlucas/aoe2-overlay

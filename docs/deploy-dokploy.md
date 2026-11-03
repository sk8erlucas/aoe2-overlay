# Deploy en Dokploy

Guía para publicar la **API** y la **web** en un servidor con [Dokploy](https://dokploy.com), y el **instalador** del overlay en GitHub Releases.

En los ejemplos se usa `tudominio.com`: reemplazalo por tu dominio real.

| Servicio | URL                         | Dockerfile            | Puerto |
| -------- | --------------------------- | --------------------- | ------ |
| Web      | `https://tudominio.com`     | `apps/web/Dockerfile` | 3000   |
| API      | `https://api.tudominio.com` | `apps/api/Dockerfile` | 3001   |

> Web y API **tienen que estar bajo el mismo dominio padre** (`tudominio.com` y `api.tudominio.com`) para que la sesión funcione en las dos.

## 0. Antes de empezar

- [ ] **DNS:** en tu proveedor de dominio, creá dos registros `A` apuntando a la IP del servidor de Dokploy:
  - `tudominio.com` → IP del servidor
  - `api.tudominio.com` → IP del servidor
- [ ] **Generá un secreto nuevo para producción** (no reutilices el de tu `.env` local). En tu PC:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
  ```
  Guardalo: es el `BETTER_AUTH_SECRET`. No lo pegues en ningún archivo del repo.

## 1. Proyecto en Dokploy

1. **Projects → Create Project** → nombre `aoe2-overlay`.
2. Si todavía no lo hiciste: **Settings → Git → GitHub** y conectá tu cuenta de GitHub (para que Dokploy pueda leer `sk8erlucas/aoe2-overlay`).

## 2. Base de datos

Ya existe y tiene las tablas creadas (`aoe2-overlaydb`). Dos opciones:

- **Si la base es un servicio de Dokploy en el mismo servidor (recomendado):** abrí la base en Dokploy y copiá la **Internal Connection URL**. Usala como `DATABASE_URL` de la API. Así el tráfico no sale a internet, y podés **quitar el puerto público 5489** (en la base → _External Credentials_ → borrar el puerto expuesto). Eso resuelve el problema de que no tiene SSL.
- **Si está en otro servidor:** usá la URL pública que ya tenés. Limitá el puerto 5489 por firewall para que solo entre la IP del servidor de Dokploy.

## 3. API

1. En el proyecto: **Create Service → Application** → nombre `api`.
2. **General → Provider:** GitHub → repositorio `sk8erlucas/aoe2-overlay` → rama `main`.
3. **Build Type:** `Dockerfile`.
   - **Docker File:** `apps/api/Dockerfile`
   - **Docker Context Path:** `.` (la raíz del repo)
4. **Environment** → pegá esto (completando los valores) y guardá:

   ```env
   DATABASE_URL=postgresql://USUARIO:CONTRASEÑA@HOST:PUERTO/aoe2-overlaydb
   DATABASE_SSL=disable
   BETTER_AUTH_SECRET=el-secreto-que-generaste-en-el-paso-0
   BETTER_AUTH_URL=https://api.tudominio.com
   CORS_ORIGINS=https://tudominio.com,https://www.tudominio.com
   COOKIE_DOMAIN=tudominio.com
   PORT=3001
   HOST=0.0.0.0
   LOG_LEVEL=info
   ```

   | Variable             | Qué es                                                                               |
   | -------------------- | ------------------------------------------------------------------------------------ |
   | `DATABASE_URL`       | Conexión a Postgres (ver paso 2). Hoy está en tu `apps/api/.env` local.              |
   | `DATABASE_SSL`       | `disable` (tu servidor no tiene SSL). Si lo activás: `require`.                      |
   | `BETTER_AUTH_SECRET` | Secreto de sesiones. **Uno nuevo** para producción (paso 0).                         |
   | `BETTER_AUTH_URL`    | URL pública de la API, con `https://`.                                               |
   | `CORS_ORIGINS`       | URLs de la web que pueden llamar a la API, separadas por coma.                       |
   | `COOKIE_DOMAIN`      | Dominio padre, **sin** `https://` ni subdominio. Comparte la sesión entre web y API. |

5. **Domains → Add Domain:**
   - Host: `api.tudominio.com`
   - Path: `/`
   - Container Port: `3001`
   - HTTPS: activado, certificado **Let's Encrypt**
6. **Deploy.** Al arrancar, el contenedor aplica las migraciones, carga las estrategias base (sin duplicar) y levanta el servidor.
7. **Probalo:** abrí `https://api.tudominio.com/api/health` → tiene que responder `{"ok":true,"db":true}`. La documentación queda en `https://api.tudominio.com/api/docs`.

## 4. Web

1. **Create Service → Application** → nombre `web`.
2. **Provider:** GitHub → `sk8erlucas/aoe2-overlay` → rama `main`.
3. **Build Type:** `Dockerfile`.
   - **Docker File:** `apps/web/Dockerfile`
   - **Docker Context Path:** `.`
4. **Build-time arguments** (en _Environment_ → sección **Build-time Arguments**):

   ```env
   NEXT_PUBLIC_API_URL=https://api.tudominio.com
   ```

   > Es un **argumento de build**, no solo una variable: Next.js la mete en el código del navegador al compilar. Si después cambiás la URL de la API, hay que volver a hacer Deploy.

5. **Environment** (variables de ejecución):

   ```env
   NEXT_PUBLIC_API_URL=https://api.tudominio.com
   ```

6. **Domains → Add Domain:**
   - Host: `tudominio.com` (y si querés, otro para `www.tudominio.com`)
   - Container Port: `3000`
   - HTTPS: activado, **Let's Encrypt**
7. **Deploy** y abrí `https://tudominio.com`.

## 5. Deploy automático

En cada servicio (`api` y `web`): **General → Autodeploy** activado. Así, cada push a `main` vuelve a desplegar. Si Dokploy te pide un webhook, copiá la URL de **Deployments → Webhook** y agregala en GitHub (**Settings → Webhooks**).

## 6. Tu usuario administrador

1. Registrate en `https://tudominio.com/registro`.
2. Dale rol de admin. Elegí una forma:
   - **Desde Dokploy:** servicio `api` → **Docker Terminal** (o _Open Terminal_) y corré:
     ```sh
     ./node_modules/.bin/tsx src/db/set-role.ts tu@email.com admin
     ```
   - **Desde tu PC** (usa tu `apps/api/.env` local, que apunta a la misma base):
     ```bash
     pnpm --filter @age-overlay/api user:role tu@email.com admin
     ```
3. Cerrá sesión y volvé a entrar: vas a ver **Moderación** en el menú.

## 7. Instalador del overlay (GitHub Releases)

El botón **Descargar** de la web apunta al último release de GitHub. Para publicar el primero, desde tu PC:

```bash
git tag v0.1.0
git push origin v0.1.0
```

El workflow `.github/workflows/release.yml` compila el instalador en Windows (~10 min) y lo publica en `https://github.com/sk8erlucas/aoe2-overlay/releases`. Para próximas versiones: subí la versión en `apps/overlay/src-tauri/tauri.conf.json` y creá un tag nuevo (`v0.1.1`, …).

## Dónde está cada variable

| Archivo                 | Qué es                                                   | ¿Se sube al repo?             |
| ----------------------- | -------------------------------------------------------- | ----------------------------- |
| `apps/api/.env`         | Tus valores **locales** (incluye la URL real de la base) | **No** (está en `.gitignore`) |
| `apps/api/.env.example` | Plantilla con todas las variables de la API, vacías      | Sí                            |
| `apps/web/.env.example` | Plantilla de la web (`NEXT_PUBLIC_API_URL`)              | Sí                            |
| Dokploy → Environment   | Valores de **producción**                                | No (quedan solo en Dokploy)   |

## Problemas comunes

- **La web carga pero no muestra estrategias:** revisá que `NEXT_PUBLIC_API_URL` esté como _Build-time Argument_ y volvé a hacer Deploy de la web.
- **Error de CORS o "Invalid origin" al registrarse:** la URL exacta de la web (con `https://`, sin barra final) tiene que estar en `CORS_ORIGINS` de la API.
- **Te registrás pero no queda la sesión iniciada:** revisá `COOKIE_DOMAIN=tudominio.com` y que `BETTER_AUTH_URL` empiece con `https://`.
- **La API no arranca:** mirá los logs del servicio en Dokploy. Si dice `Configuración inválida`, falta o está mal una variable; el mensaje dice cuál (nunca muestra los valores).

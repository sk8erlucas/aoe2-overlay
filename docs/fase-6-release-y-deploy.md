# Fase 6: Release y deploy

**Objetivo:** publicar la versión 0.1.0: instalador descargable, web y API online.

**Depende de:** Fase 4. La Fase 5 puede venir después.

**Guía paso a paso:** [deploy-dokploy.md](deploy-dokploy.md)

## Tareas

### Preparado en el repo

- [x] `apps/api/Dockerfile`: instala solo lo necesario y al arrancar corre migraciones → estrategias base → servidor; healthcheck en `/api/health`
- [x] `apps/web/Dockerfile`: Next.js `standalone` en imagen mínima; `NEXT_PUBLIC_API_URL` como build arg
- [x] `.dockerignore` que excluye todos los `.env` (los secretos nunca entran en una imagen)
- [x] `COOKIE_DOMAIN` en la API para compartir la sesión entre `tudominio.com` y `api.tudominio.com`
- [x] Workflow `release.yml` con `tauri-action` en `windows-latest` al crear un tag `v*`
- [x] Verificado: el build standalone de la web y el comando de arranque de la API funcionan contra la base real. No se pudo probar `docker build` local por un problema de certificados de la red de la PC; en el servidor no aplica

### A cargo del dueño del proyecto (ver la guía)

- [x] DNS: `aoe2overlay.sitemaster.com.ar`, `api.aoe2overlay…` y `db.aoe2overlay…` (Cloudflare, solo DNS)
- [x] Generar un `BETTER_AUTH_SECRET` nuevo para producción
- [x] Dokploy: servicio `api` con sus variables y dominio
- [x] Dokploy: servicio `web` con el build arg y dominio
- [ ] Autodeploy en ambos servicios
- [ ] Registrarse y darse rol de admin
- [x] Publicar el primer release (`v0.1.0` publicado con .exe y .msi)
- [x] SSL en Postgres (`db.aoe2overlay.sitemaster.com.ar`, certificado autofirmado)
- [ ] Obligar SSL en las conexiones externas (`hostssl` en `pg_hba.conf`): hoy todavía acepta conexiones sin cifrar desde afuera
- [ ] Backups automáticos de la base (Dokploy → base → Backups)

### Después

- [ ] Generar la clave de firma del updater y guardarla en GitHub Secrets
- [ ] `tauri-plugin-updater` leyendo `latest.json` del release
- [ ] (Opcional) Firma de código Authenticode para evitar SmartScreen

### Proyecto open source

- [ ] README final con capturas o GIF, badges e instalación
- [x] Disclaimer de las Microsoft Game Content Usage Rules (README, footer de la web y `apps/web/public/game-assets/README.md`)
- [x] `SECURITY.md` (cómo reportar vulnerabilidades)
- [ ] CHANGELOG y versionado semántico
- [ ] Issues iniciales etiquetadas `good first issue`

## Criterio de terminado

- [x] `https://aoe2overlay.sitemaster.com.ar` y `https://api.aoe2overlay.sitemaster.com.ar/api/health` responden
- [x] El tag `v0.1.0` genera el instalador en Releases
- [ ] Instalar desde la web funciona en una PC limpia
- [ ] Publicar `v0.1.1` hace que el overlay instalado ofrezca la actualización

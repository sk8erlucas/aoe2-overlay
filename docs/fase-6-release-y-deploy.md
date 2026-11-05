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
- [x] Autodeploy en ambos servicios: webhooks de `api` y `web` cargados en GitHub (2026-11-04), el ping llegó bien a Dokploy
- [x] Confirmado con un push real (2026-11-04): los dos webhooks respondieron 200 y la API y la web nuevas quedaron online en unos 3 minutos
- [x] Registrarse y darse rol de admin (`fibonaku`, admin desde 2026-11-04)
- [x] Publicar el primer release (`v0.1.0` publicado con .exe y .msi)
- [x] SSL en Postgres (`db.aoe2overlay.sitemaster.com.ar`, certificado autofirmado)
- [ ] Obligar SSL en las conexiones externas (`hostssl` en `pg_hba.conf`): hoy todavía acepta conexiones sin cifrar desde afuera
- [ ] Backups automáticos de la base (Dokploy → base → Backups)

### Después

- [x] Generar la clave de firma del updater (`~/.tauri/aoe2-overlay.key`, fuera del repo)
- [ ] Cargar la clave en GitHub Secrets (`TAURI_SIGNING_PRIVATE_KEY` y `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`, ver la guía, paso 7) y guardar una copia en un gestor de contraseñas
- [x] `tauri-plugin-updater` leyendo `latest.json` del release: busca al abrir y cada 6 h, avisa en Ajustes y se instala con "Actualizar y reiniciar" (0.3.1)
- [ ] Firma de código del instalador (reduce avisos de SmartScreen y falsos positivos). Opciones, en orden de preferencia:
  1. **SignPath Foundation**: firma gratis para proyectos open source; se pide en signpath.org y firma desde GitHub Actions
  2. **Azure Artifact Signing (ex Trusted Signing)**: ~10 USD/mes; revisar si acepta personas en Argentina
  3. Certificado OV comercial (~200–400 USD/año, con token USB o HSM en la nube)
- [x] Metadatos de editor y copyright en el .exe, e instalación por usuario sin pedir administrador (menos heurísticas sospechosas)
- [x] VirusTotal v0.2.0: 2/71 (Arctic Wolf "Unsafe", SecureAge "Malicious"), falsos positivos típicos de NSIS sin firmar
- [ ] Reportar falsos positivos: subir el instalador a VirusTotal y, si algún antivirus lo marca, enviarlo como falso positivo (Microsoft Security Intelligence y el antivirus que lo detecte)

### Proyecto open source

- [x] README final con capturas, badges e instalación (capturas en `docs/screenshots/`; falta un GIF en partida real)
- [x] Disclaimer de las Microsoft Game Content Usage Rules (README, footer de la web y `apps/web/public/game-assets/README.md`)
- [x] `SECURITY.md` (cómo reportar vulnerabilidades)
- [x] CHANGELOG y versionado semántico (`CHANGELOG.md`)
- [ ] Issues iniciales etiquetadas `good first issue`

## Criterio de terminado

- [x] `https://aoe2overlay.sitemaster.com.ar` y `https://api.aoe2overlay.sitemaster.com.ar/api/health` responden
- [x] El tag `v0.1.0` genera el instalador en Releases
- [ ] Instalar desde la web funciona en una PC limpia
- [ ] Publicar una versión nueva hace que el overlay instalado ofrezca la actualización (primera prueba posible: con la 0.3.1 instalada, publicar la 0.3.2)

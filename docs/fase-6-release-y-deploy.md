# Fase 6: Release y deploy

**Objetivo:** publicar la versión 0.1.0: instalador descargable, web y API online.

**Depende de:** Fase 5 (o Fase 2 para un release solo del overlay).

## Tareas

### Instalador

- [ ] Workflow `release.yml` con `tauri-action` en `windows-latest` al crear un tag `v*`
- [ ] Publicación en GitHub Releases (NSIS .exe y .msi)
- [ ] Generar la clave de firma del updater y guardarla en GitHub Secrets
- [ ] `tauri-plugin-updater` leyendo `latest.json` del release
- [ ] (Opcional) Firma de código Authenticode para evitar SmartScreen

### Deploy

- [ ] DB: servidor propio (Postgres 18). Activar SSL o limitar el puerto por firewall. Correr las migraciones en cada deploy
- [ ] API en Fly.io o Railway, con variables de entorno y healthcheck
- [ ] Web en Vercel, con dominio propio (opcional)
- [ ] Web y API bajo el mismo dominio padre (ej. `aoe2overlay.com` y `api.aoe2overlay.com`) y Better Auth con `crossSubDomainCookies` para compartir la sesión
- [ ] Variables de la web: `NEXT_PUBLIC_API_URL`; de la API: `CORS_ORIGINS` con la URL de la web
- [ ] Backups de la DB

### Proyecto open source

- [ ] README final con capturas o GIF, badges e instalación
- [ ] Disclaimer de las Microsoft Game Content Usage Rules
- [x] `SECURITY.md` (cómo reportar vulnerabilidades)
- [ ] CHANGELOG y versionado semántico
- [ ] Issues iniciales etiquetadas `good first issue`

## Criterio de terminado

- [ ] El tag `v0.1.0` genera el instalador en Releases
- [ ] Instalar desde la web funciona en una PC limpia
- [ ] Publicar `v0.1.1` hace que el overlay instalado ofrezca la actualización

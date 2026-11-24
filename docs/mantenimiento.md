# Mantenimiento

**Estado (2026-11-23):** el proyecto está **terminado y publicado** (overlay 0.4.1, web y API en producción). No se planean funciones nuevas salvo que haya muchos usuarios. Las fases 0 a 10 están cerradas en [completed/](completed/); lo que quedaba abierto se juntó acá en tres grupos.

## 1. Antes de anunciarlo más (una sola vez, a cargo de Lucas)

Lo mínimo para estar tranquilo de que funciona en una PC real. El resto de la [lista de pruebas](completed/fase-8-pruebas-manuales.md) es opcional.

- [ ] **Prueba en partida:** instalar la última versión desde la web y jugar una partida. Revisar que los clics pasen al juego, que `Ctrl+Alt+P` y `Ctrl+Alt+O` funcionen sin perder el foco y que el reloj coincida con el del juego
- [ ] **Detección automática:** buscar tu perfil en Ajustes, empezar una partida y confirmar que elige civs y estrategia y arranca el reloj. Al terminar, con sesión iniciada, ver que el winrate sume en la web
- [ ] **Actualización:** con la 0.4.0 instalada, confirmar que ofrece la 0.4.1 y que se instala sola
- [ ] **Defender:** subir el `.exe` de la última versión en [microsoft.com/wdsi/filesubmission](https://www.microsoft.com/wdsi/filesubmission) como _Software developer_
- [ ] **Base de datos:** activar los backups automáticos (Dokploy → base → Backups) y obligar SSL en las conexiones externas (`hostssl` en `pg_hba.conf`)
- [x] **Estrategias:** importación de Build Order Guide publicada el 2026-11-23 (58 estrategias; el catálogo quedó en 67 públicas)

## 2. Rutina liviana (opcional)

Cuando haya tiempo, sin fecha fija:

- Una vez por mes, sumar las estrategias nuevas de Build Order Guide: `fetch:bog --refresh` y después `import:community … --publish` (ver [Fase 9](completed/fase-9-estrategias-comunidad.md#cómo-cargar-más-estrategias))
- Si se publica otra versión: revisarla en VirusTotal y reportar falsos positivos
- Responder issues y PR en GitHub
- Si sale una civilización nueva: agregarla en `packages/game-data/src/civs.ts` (el importador avisa "civilización desconocida", como pasó con "Danes")

## 3. Solo si crece (ideas archivadas)

Quedan anotadas por si el uso lo justifica. No hace falta hacer ninguna para que la herramienta funcione.

**Producto**

- Web en inglés (el overlay ya está en español e inglés)
- Login con Steam (Better Auth no lo trae; Steam usa OpenID 2.0)
- Login con Discord: el código está listo; solo hay que crear la app y cargar `DISCORD_CLIENT_ID` y `DISCORD_CLIENT_SECRET` ([deploy-dokploy.md](deploy-dokploy.md))
- Íconos propios para los pasos (hoy se muestran como texto)
- Reemplazar la ilustración del hero (arte de Microsoft, ver `apps/web/public/game-assets/README.md`)
- Estrategias para las civs sin builds calificadas en Build Order Guide: Búlgaros, Drávidas, Godos, Kitán, Mapuches, Muiscas, Tupíes, Sajones, Shu, Varegos, Wei y Wu
- Traducir el texto libre de los autores ("Use your scout to…")

**Confianza del instalador**

- Firma de código: volver a pedir SignPath Foundation con más estrellas y menciones, o comprar un certificado (Certum Open Source, unos 69 €). Al firmar, adaptar `release.yml`
- Publicar en winget (los manifiestos ya están validados en [`packaging/winget`](../packaging/winget/README.md)) o en la Microsoft Store

**Difusión** (detalle en la [Fase 10](completed/fase-10-lanzamiento-y-publicidad.md))

- Posts en r/aoe2, el foro oficial, AoEZone y una guía en Steam
- Video y GIF en partida real, short vertical, música para el video
- Nuevas rondas de contacto a creadores de contenido y una "build de la semana"

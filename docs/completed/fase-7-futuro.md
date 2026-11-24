# Fase 7: Futuro

> **Fase cerrada el 2026-11-23** al dar el proyecto por terminado. Lo que quedó sin marcar pasó a [mantenimiento.md](../mantenimiento.md).

**Objetivo:** ideas para después del 0.1.0, sin orden fijo.

## Ideas

- [x] Detección automática de la partida (mapa, civs, rival) por ID de jugador, con la API pública de [AoE2 Companion](https://www.aoe2companion.com) (`apps/overlay/src/lib/detect.ts`). El jugador busca su perfil por nombre en Ajustes; se consulta cada 20 s
- [x] Iniciar el reloj automáticamente al detectar el comienzo de la partida. Usa la hora de inicio que da la API, que es la del lanzamiento de la partida: puede quedar unos segundos adelantado por la pantalla de carga (se corrige con −5)
- [x] Estadísticas: winrate por estrategia reportado por los usuarios. El overlay lo reporta solo al terminar una partida detectada (sin duplicar la misma partida); en la web, con "Gané" / "Perdí"
- [x] i18n ES/EN en el overlay (Ajustes → Idioma; la primera vez toma el del sistema). En inglés las notas muestran el texto original del autor
- [ ] i18n ES/EN en la web
- [x] El menú de la bandeja del sistema cambia de idioma con el overlay (0.4.1)
- [x] Layouts alternativos del overlay: normal, compacto (solo el paso actual) y detallado (nombre y los próximos 3 pasos)
- [x] Login con Discord (se activa con `DISCORD_CLIENT_ID` y `DISCORD_CLIENT_SECRET`, ver [deploy-dokploy.md](../deploy-dokploy.md))
- [ ] Login con Steam: Better Auth no lo trae (Steam usa OpenID 2.0); haría falta un plugin propio
- [x] Comentarios en las estrategias (el autor o un moderador los borra)
- [x] Forks de estrategias: "Hacer una variante" en la web, con link "Basada en…" a la original
- [x] Soporte multi-monitor y elegir en qué esquina se muestra (Ajustes → Pantalla)
- [ ] Pasos con imágenes o íconos propios (sin assets del juego)
- [ ] Reemplazar la ilustración del hero de la web (`apps/web/public/game-assets/teutonic-knight.webp`, arte de Microsoft) por una propia con licencia libre, idealmente en capas para el efecto de armadura de [diseno-web.md](../diseno-web.md)

# Fase 5: Integración overlay ↔ API

**Objetivo:** que el overlay use las estrategias de la comunidad sin perder el modo offline.

**Depende de:** Fases 2, 3 y 4.

## Tareas

### Sincronización

- [x] Endpoint `GET /api/overlay/strategies`: estrategias públicas completas (hasta 500, verificadas y más votadas primero) con **ETag** (304 si no cambió)
- [x] CORS para el origen del overlay (`http://tauri.localhost`, `tauri://localhost`, `http://localhost:1420`), sin sumarlo a los orígenes de confianza del login
- [x] URL de la API configurable en Ajustes (por defecto `https://api.aoe2overlay.sitemaster.com.ar`; vacía = solo estrategias base)
- [x] Sincroniza al abrir, cada 30 minutos y con "Sincronizar ahora"
- [x] Caché local (store de Tauri) y fallback a la caché o a las estrategias base sin conexión
- [x] Indicador de estado: "✓ N estrategias · sincronizado hace X" / "Sin conexión: usando N guardadas"
- [x] Sugerencias calculadas en el overlay con los votos de la comunidad (mismo algoritmo que `/api/suggestions`, funciona offline)
- [x] Buscar estrategias por nombre
- [x] Las estrategias base se reemplazan por su versión de la API (mismo id) para traer los votos

### Overlay (pedidos del dueño)

- [x] Barra de botones en modo juego: ⏮ paso anterior, −5 s, ▶/⏸, +5 s, ⏭ paso siguiente, ⚙ modo edición, ✕ ocultar
- [x] Zonas clickeables: en modo juego solo la barra de botones acepta clics (la parte nativa sigue la posición del mouse); el resto de la ventana sigue dejando pasar los clics al juego
- [x] Población total en cada paso: aldeanos + explorador inicial (`populationOf` en `shared`), también en la web
- [x] Botón "Salir de AoE2 Overlay" en Ajustes (guarda la posición antes de cerrar)
- [x] Recordar posición y tamaño de la ventana entre sesiones (`tauri-plugin-window-state`); la primera vez arranca arriba a la derecha
- [x] Corregido: la ventana se ocultaba sola al entrar en modo juego o al pasar el mouse por los botones (mezcla de llamadas directas a Win32 con el estado interno de tao). Ahora todo usa la API de Tauri (`show`, `set_focusable`)

### Pendiente

- [ ] Login opcional desde el overlay (flujo device-code de Better Auth: el overlay muestra un código y se confirma en la web)
- [ ] Favoritas del usuario arriba en la lista (requiere el login)
- [ ] Abrir una estrategia de la web en el overlay (deep link `ageoverlay://strategy/<slug>`)

## Criterio de terminado

- [x] Una estrategia de la API aparece en el overlay sin reinstalar (probado con la API local: el overlay sincronizó y mostró las estrategias)
- [x] Sin internet, el overlay sigue funcionando con la caché (tests de `sync.ts`)

## Notas

- Para que el overlay sincronice contra producción, la API desplegada tiene que incluir `/api/overlay/strategies`: **redesplegar la API en Dokploy** después de este cambio.
- Verificado en Windows: lejos de los botones la ventana deja pasar los clics (`WS_EX_TRANSPARENT`); sobre ▶ los acepta.
- La "población" no incluye unidades militares (la estrategia no las detalla): es aldeanos + 1 explorador.
- La versión del overlay pasó a **0.2.0**. Para publicarla: `git tag v0.2.0 && git push origin v0.2.0`.

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

### Cuenta, favoritas y links desde la web

- [x] Login opcional desde el overlay (plugin `deviceAuthorization` de Better Auth, RFC 8628): Ajustes → Cuenta → "Iniciar sesión" muestra un código, abre `/dispositivo` en la web y el overlay recibe un token que manda como `Authorization: Bearer` (plugin `bearer`). Solo acepta el `client_id` `aoe2-overlay`; el código vence a los 10 minutos
- [x] Página `/dispositivo` en la web: pide iniciar sesión si hace falta, muestra el código y pide confirmar antes de conectar
- [x] Favoritas del usuario arriba en la lista, marcadas con ★ (también en la búsqueda); se actualizan con cada sincronización. Si la sesión vence, el overlay la olvida solo
- [x] Abrir una estrategia de la web en el overlay: botón "Abrir en el overlay" (`ageoverlay://strategy/<slug>`, `tauri-plugin-deep-link` + `single-instance`). Si la estrategia no estaba sincronizada (por ejemplo, no listada), la pide a la API
- [x] Tests: flujo completo en la API (`test/device.test.ts`) y parser del link, orden de favoritas y polling en el overlay (`test/account.test.ts`)

## Criterio de terminado

- [x] Una estrategia de la API aparece en el overlay sin reinstalar (probado con la API local: el overlay sincronizó y mostró las estrategias)
- [x] Sin internet, el overlay sigue funcionando con la caché (tests de `sync.ts`)

## Notas

- Desde la 0.3.2 la URL de la API ya no se configura en Ajustes: es fija y en desarrollo se cambia con `VITE_API_URL`. Las favoritas también se marcan desde el overlay (`POST /api/strategies/slug/:slug/favorite`).
- **Fase cerrada el 2026-11-04.** La prueba a mano del login y del link quedó en la [Fase 8](../fase-8-pruebas-manuales.md).
- El esquema `ageoverlay://` lo registra el instalador: el link funciona desde la **0.3.0** instalada (en `tauri dev` se registra al arrancar).
- La migración `0001_device_code` crea la tabla `device_code`; corre sola al redesplegar la API.

- Para que el overlay sincronice contra producción, la API desplegada tiene que incluir `/api/overlay/strategies`: **redesplegar la API en Dokploy** después de este cambio.
- Verificado en Windows: lejos de los botones la ventana deja pasar los clics (`WS_EX_TRANSPARENT`); sobre ▶ los acepta.
- La "población" no incluye unidades militares (la estrategia no las detalla): es aldeanos + 1 explorador.
- La versión del overlay pasó a **0.2.0** y después a **0.3.0** (cuenta y links). Para publicarla: `git tag v0.3.0 && git push origin v0.3.0`.

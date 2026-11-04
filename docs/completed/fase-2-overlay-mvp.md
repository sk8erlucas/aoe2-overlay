# Fase 2: Overlay MVP (sin backend)

**Objetivo:** un .exe que funcione sobre el juego con las estrategias base, sin depender de internet.

**Depende de:** Fase 1.

## Tareas

### Scaffold

- [x] Crear `apps/overlay` con Tauri v2 + React + Vite + TS
- [x] Consumir `@age-overlay/shared` y `@age-overlay/game-data`
- [x] Prerrequisitos documentados (Rust, WebView2, Build Tools de VS) en el README
- [x] Ícono propio (`apps/overlay/app-icon.svg` → `pnpm tauri icon`)
- [x] Job de CI en Windows: `cargo clippy -D warnings`

### Ventana

- [x] Transparente, sin bordes, siempre encima, sin sombra, fuera de la barra de tareas
- [x] Posición inicial arriba a la derecha del monitor primario
- [x] Click-through (`set_ignore_cursor_events`) en modo juego
- [x] Hotkey global para alternar modo juego y modo edición (en edición se arrastra desde la barra de título)
- [x] No roba foco al juego (`WS_EX_NOACTIVATE` en modo juego + mostrar con `SW_SHOWNOACTIVATE`)
- [x] Single-instance
- [x] Ícono en la bandeja del sistema con Mostrar/Ocultar, Modo edición/juego, Volver a la esquina y Salir

### Reloj

- [x] Start/Pausa, Reset, +5 s y −5 s con hotkeys globales configurables
- [x] Velocidad configurable (por defecto 1.7); el reloj muestra tiempo de juego. Cambiarla no hace saltar el reloj
- [x] Paso siguiente/anterior manual: mueve el reloj al tiempo de ese paso

### Vista de pasos

- [x] Paso actual destacado y siguiente atenuado
- [x] Cuenta regresiva al siguiente paso
- [x] Aldeanos totales y distribución (madera, comida, oro, piedra, construyendo)
- [x] Aviso visual al cambiar de paso; sonido opcional
- [x] Íconos `@...@` de la comunidad mostrados como etiquetas de texto

### Pre-partida (modo edición)

- [x] Selectores: mapa, mi civ, civ rival (opcional), posición (opcional)
- [x] Lista de estrategias sugeridas (score local) y elección de una
- [x] Botón para empezar la partida y pasar a modo juego

### Configuración

- [x] Persistencia con `tauri-plugin-store`: opacidad, escala, sonido, hotkeys, velocidad y última selección
- [x] Pantalla de configuración (las hotkeys inválidas o en uso se marcan en rojo)

### Prueba de pantalla completa

- [x] Probar el overlay con AoE2 (2026-11-03): se ve bien, así que no hace falta el modo inyección (descartado)

## Criterio de terminado

- [x] Con AoE2, el overlay se ve arriba a la derecha
- [x] `pnpm --filter @age-overlay/overlay tauri:build` genera el instalador (NSIS 1,25 MB y MSI 1,76 MB)

## Notas

- **Fase cerrada el 2026-11-03.** Las pruebas en partida (clics, hotkeys, precisión del reloj, redimensionado) pasaron a la [Fase 8: pruebas manuales](../fase-8-pruebas-manuales.md). Recordar la posición de la ventana pasó a la [Fase 5](fase-5-integracion-overlay-api.md).

- **Verificado sin el juego (2026-11-03):**
  - La ventana aparece arriba a la derecha sin tomar el foco.
  - Las hotkeys globales funcionan con otra ventana enfocada.
  - En modo juego la ventana tiene `WS_EX_TRANSPARENT` (click-through), `WS_EX_NOACTIVATE` y `WS_EX_TOPMOST`.
- **Probado con AoE2 (2026-11-03):** el overlay se ve bien sobre el juego. Falta confirmar los clics, las hotkeys en partida y la precisión del reloj.
- Mostrar la ventana desde el `setup` de Rust no funciona (queda oculta). Por eso el frontend la muestra cuando React terminó de montar (`show_overlay`).
- Hotkeys por defecto: `Ctrl+Alt` + O (modo), P (reloj), R (reset), L/J (±5 s), PageDown/PageUp (paso), H (ocultar). Se evitaron las flechas porque algunos drivers de Intel usan `Ctrl+Alt+flecha` para rotar la pantalla.
- Para capturar la ventana en modo click-through hay que usar `BitBlt` con `CAPTUREBLT`, porque es una ventana _layered_. Sirve para tests o capturas automáticas.

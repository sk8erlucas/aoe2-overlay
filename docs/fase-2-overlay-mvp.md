# Fase 2: Overlay MVP (sin backend)

**Objetivo:** un .exe que funcione sobre el juego con las estrategias base, sin depender de internet.

**Depende de:** Fase 1.

## Tareas

### Scaffold

- [ ] Crear `apps/overlay` con Tauri v2 + React + Vite + TS
- [ ] Consumir `@age-overlay/shared` y `@age-overlay/game-data`
- [ ] Prerrequisitos documentados (Rust, WebView2, Build Tools de VS)

### Ventana

- [ ] Transparente, sin bordes, siempre encima, sin sombra, fuera de la barra de tareas
- [ ] Posición inicial arriba a la derecha del monitor primario
- [ ] Click-through (`set_ignore_cursor_events`) en modo juego
- [ ] Hotkey global para alternar modo juego y modo edición (en edición se puede mover y redimensionar)
- [ ] No roba foco al juego (`WS_EX_NOACTIVATE` si hace falta)
- [ ] Single-instance
- [ ] Ícono en la bandeja del sistema con Mostrar/Ocultar, Configuración y Salir

### Reloj

- [ ] Start/Pausa, Reset, +5 s y −5 s con hotkeys globales configurables
- [ ] Velocidad configurable (por defecto 1.7); el reloj muestra tiempo de juego
- [ ] Paso siguiente/anterior manual (por si se adelanta o atrasa)

### Vista de pasos

- [ ] Paso actual destacado y siguiente en gris
- [ ] Cuenta regresiva al siguiente paso
- [ ] Distribución de aldeanos (comida, madera, oro, piedra) y población
- [ ] Aviso visual al cambiar de paso; sonido opcional

### Pre-partida (modo edición)

- [ ] Selectores: mapa, mi civ, civ rival (opcional), posición (opcional)
- [ ] Lista de estrategias sugeridas (score local) y elección de una
- [ ] Botón para empezar la partida y pasar a modo juego

### Configuración

- [ ] Persistencia con `tauri-plugin-store`: opacidad, escala, hotkeys, velocidad y posición
- [ ] Pantalla de configuración

### Prueba de pantalla completa

- [ ] Probar el overlay con AoE2 en modo "Pantalla completa" (Windows 11, fullscreen optimizations activadas)
- [ ] Anotar el resultado aquí. Si no se ve, priorizar la [Fase 2b](fase-2b-modo-inyeccion.md)

## Criterio de terminado

- [ ] Con AoE2 en borderless, el overlay se ve arriba a la derecha
- [ ] Los clics pasan al juego y el juego no pierde el foco
- [ ] Las hotkeys funcionan con el juego enfocado
- [ ] El reloj coincide con el del juego (±2 s) a velocidad 1.7 durante 5 minutos
- [ ] `pnpm --filter overlay tauri build` genera el instalador

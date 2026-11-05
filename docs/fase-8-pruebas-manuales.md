# Fase 8: Pruebas manuales

**Objetivo:** verificar a mano, con el juego y en el navegador, lo que los tests automáticos no pueden cubrir.

**Depende de:** se va completando a medida que avanzan las demás fases. Conviene hacer una pasada completa antes de cada release.

## Overlay con AoE2 (de la Fase 2)

Preparación: instalar el overlay desde `apps/overlay/src-tauri/target/release/bundle/nsis/` o correr `pnpm --filter @age-overlay/overlay dev`.

- [x] El overlay se ve arriba a la derecha con el juego abierto (2026-11-03)
- [ ] En modo juego, los clics sobre el overlay llegan al juego
- [ ] El juego no pierde el foco al mostrar u ocultar el overlay (`Ctrl+Alt+H`)
- [ ] Las hotkeys funcionan en partida: `Ctrl+Alt+O`, `P`, `R`, `L`, `J`, `PageDown`, `PageUp`, `H`
- [ ] Ninguna hotkey por defecto choca con atajos del juego
- [ ] El reloj coincide con el del juego (±2 s) a velocidad 1.7 durante 5 minutos
- [ ] Con otra velocidad (por ejemplo 1.5), el reloj también coincide
- [ ] En modo edición se puede mover la ventana desde la barra de título
- [ ] En modo edición se puede redimensionar la ventana
- [ ] Con dos monitores, el overlay aparece en el principal
- [ ] Opacidad, tamaño de texto y sonido se aplican y se recuerdan al reiniciar
- [ ] Una hotkey inválida o en uso se marca en rojo en Ajustes
- [ ] El instalador instala, el acceso directo abre la app y el desinstalador la quita

## Las 5 estrategias base (de la Fase 1)

Jugar cada una al menos una vez contra la IA y anotar ajustes en `strategies/*.json`.

- [ ] Exploradores en Feudal (Scouts)
- [ ] Arqueros en Feudal
- [ ] Drush → Fast Castle
- [ ] Fast Castle Boom
- [ ] Hombres de armas → Arqueros
- [ ] Los tiempos estimados de cada paso son razonables comparados con una partida real

## API (de la Fase 3)

- [ ] Explorar la documentación interactiva en `/api/docs`
- [ ] Registro y login desde la documentación interactiva (o con `curl`)

## Web (de la Fase 4)

- [ ] Recorrido completo en el navegador: registro → crear estrategia → votar con otro usuario
- [ ] La landing se ve bien en móvil y escritorio
- [ ] Con "reducir movimiento" activado en el sistema, no hay animaciones
- [ ] Lighthouse: rendimiento y accesibilidad > 90 en la landing y en /estrategias
- [ ] El efecto del caballero se ve fluido en una PC común y en un celular

## Cuenta y links (de la Fase 5)

Requiere el overlay **0.3.0** instalado y la API y la web redesplegadas.

- [ ] Ajustes → Cuenta → "Iniciar sesión": se abre `/dispositivo` con el código, se confirma y el overlay muestra "Conectado como…"
- [ ] Sin sesión en la web, `/dispositivo` pide ingresar y vuelve con el código cargado
- [ ] Una estrategia marcada como favorita en la web aparece primero con ★ después de "Sincronizar ahora"
- [ ] "Cerrar sesión" en el overlay quita las ★
- [ ] "Abrir en el overlay" en la web, con el overlay abierto: lo muestra y elige la estrategia
- [ ] Lo mismo con el overlay cerrado: lo abre y elige la estrategia
- [ ] "Ram Spam" (Cumanos) se ve bien en el overlay: notas traducidas (taller de asedio, arietes)

## Actualizaciones (de la Fase 6)

- [ ] Con la 0.3.1 instalada, al publicar una versión nueva aparece el aviso en Ajustes (punto dorado en la pestaña)
- [ ] "Actualizar y reiniciar" instala sin pedir permisos de administrador y el overlay vuelve a abrir con la versión nueva
- [ ] Los desplegables de la pestaña Partida se leen bien al abrirlos (fondo oscuro, texto claro)

## Notas

- Si algo falla, abrir una issue con la plantilla de bug y el modo de pantalla del juego.

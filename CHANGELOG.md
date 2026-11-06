# Changelog

Cambios del overlay de escritorio (los instaladores están en [Releases](https://github.com/sk8erlucas/aoe2-overlay/releases)). La web y la API se despliegan solas con cada push a `main`.

El proyecto usa [versionado semántico](https://semver.org/lang/es/): mientras la versión sea `0.x`, un cambio de minor (`0.3` → `0.4`) puede traer cambios grandes; un patch (`0.3.0` → `0.3.1`) solo trae arreglos y mejoras chicas.

## [0.3.3] - sin publicar

### Cambiado

- Pasos más naturales: edificios escritos como texto traducidos ("1 mercado") y plurales ("5 aldeanos", "2 centros urbanos").

## [0.3.2] - 2026-11-05

### Agregado

- Favoritas desde el overlay: estrella grande a la izquierda de cada estrategia para marcarla o quitarla. Sin sesión, lleva a iniciar sesión.
- Avatar en la barra superior: tu inicial si iniciaste sesión, una silueta punteada si no. Lleva a **Ajustes → Cuenta**, que ahora está arriba de todo.

### Cambiado

- Los pasos de las estrategias de la comunidad se leen en español ("Crear 6 aldeano en ovejas", "Avanzar a Edad Feudal").
- Se quitó la URL de la API de Ajustes: el overlay siempre usa la API oficial.

### Corregido

- El inicio de sesión ya no se corta si cambiás de pestaña mientras esperás la confirmación.

## [0.3.1] - 2026-11-05

### Agregado

- Actualizaciones automáticas: el overlay busca versiones nuevas al abrir y cada 6 horas, y avisa en **Ajustes** (punto dorado en la pestaña). "Actualizar y reiniciar" descarga el instalador firmado y lo instala solo. Funciona desde esta versión en adelante: quien tenga la 0.3.0 o anterior tiene que instalar la 0.3.1 a mano una vez.

### Corregido

- Las opciones de los desplegables (mapa, civilización, rival…) no se veían hasta pasar el mouse: el texto claro quedaba sobre el fondo blanco de la lista.

## [0.3.0] - 2026-11-04

### Agregado

- Cuenta opcional: **Ajustes → Cuenta → Iniciar sesión** muestra un código que se confirma en la web (`/dispositivo`).
- Las estrategias favoritas aparecen primero en la lista, con ★.
- Botón **Abrir en el overlay** en cada estrategia de la web (links `ageoverlay://strategy/<slug>`).
- Palabras clave de la comunidad traducidas: taller de asedio, arietes, mangoneles, escorpiones.

## [0.2.0] - 2026-11-03

### Agregado

- Sincronización con las estrategias de la comunidad (con caché para jugar sin internet) y búsqueda por nombre.
- Barra de botones en modo juego: paso anterior/siguiente, ±5 s, iniciar/pausar, modo edición y ocultar.
- Población total en cada paso.
- Recuerda la posición y el tamaño de la ventana; botón "Salir" en Ajustes.
- Metadatos de editor e instalación por usuario (sin pedir administrador).

### Corregido

- La ventana se ocultaba sola al entrar en modo juego o al pasar el mouse por los botones.

## [0.1.0] - 2026-11-03

Primera versión: overlay transparente siempre encima del juego, con modo juego (los clics pasan al juego) y modo edición, reloj sincronizable con hotkeys globales, sugerencias según mapa, civilizaciones y posición, y 5 estrategias base.

[0.3.3]: https://github.com/sk8erlucas/aoe2-overlay/compare/v0.3.2...main
[0.3.2]: https://github.com/sk8erlucas/aoe2-overlay/releases/tag/v0.3.2
[0.3.1]: https://github.com/sk8erlucas/aoe2-overlay/releases/tag/v0.3.1
[0.3.0]: https://github.com/sk8erlucas/aoe2-overlay/releases/tag/v0.3.0
[0.2.0]: https://github.com/sk8erlucas/aoe2-overlay/releases/tag/v0.2.0
[0.1.0]: https://github.com/sk8erlucas/aoe2-overlay/releases/tag/v0.1.0

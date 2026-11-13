# Fase 7: Futuro

**Objetivo:** ideas para después del 0.1.0, sin orden fijo.

## Ideas

- [ ] Detección automática de la partida (mapa, civs, rival) por ID de jugador, con APIs públicas de la comunidad
- [ ] Iniciar el reloj automáticamente al detectar el comienzo de la partida
- [ ] Estadísticas: winrate por estrategia reportado por los usuarios
- [ ] i18n completo ES/EN en overlay y web
- [ ] Temas y layouts alternativos del overlay (compacto, detallado)
- [ ] Login con Discord y Steam
- [ ] Comentarios en las estrategias
- [ ] Forks de estrategias ("basada en…")
- [ ] Soporte multi-monitor y elegir en qué esquina se muestra
- [ ] Pasos con imágenes o íconos propios (sin assets del juego)
- [ ] Reemplazar la ilustración del hero de la web (`apps/web/public/game-assets/teutonic-knight.webp`, arte de Microsoft) por una propia con licencia libre, idealmente en capas para el efecto de armadura de [diseno-web.md](diseno-web.md)

## Visores arriba de la pantalla

Paneles chicos en el borde superior, que cada uno elige y reordena, con datos de la partida:

- [ ] Aldeanos de cada jugador y en qué recurso está trabajando cada grupo (comida, madera, oro, piedra, construyendo)
- [ ] Puntajes de los jugadores, como los que muestra el juego arriba del minimapa
- [ ] Elegir qué visores se ven, su orden y su posición (Ajustes), y guardarlo con el resto de la configuración
- [ ] Atajo para mostrarlos u ocultarlos

**Viabilidad (decidir antes de empezar):**

- El overlay hoy **no lee la memoria del juego** y eso es parte de lo que lo hace confiable; la web y el brief de publicidad lo prometen. Estos datos no los publica el juego en ningún lado: para tenerlos en vivo habría que leer la memoria o analizar la pantalla.
- **En partidas clasificatorias**, mostrar datos del rival que el juego no te da (sus aldeanos, en qué recursos está) es ventaja ilegítima y puede costar un baneo. Si se hace, que sea solo con datos propios o con la información que el juego ya muestra (el puntaje se puede activar en sus opciones).
- **Dónde sí suma sin riesgo:**
  - Modo espectador o casteo de partidas: el juego ya da esa información a los espectadores. Herramientas como Capture Age hacen esto para casters.
  - Repeticiones: [AoE2 Replays](https://aoe2replays.sitemaster.com.ar) ya calcula aldeanos, recursos y avances de edad a partir del archivo. Se podrían mostrar con este mismo estilo de visores.
  - Datos propios estimados: aldeanos y reparto según el paso actual de la estrategia (lo que el overlay ya sabe), para comparar "lo que dice el plan" con lo que ves en tu juego.
- Primer paso propuesto: visores con los datos del plan (sin leer el juego), y después evaluar el modo espectador y las repeticiones.

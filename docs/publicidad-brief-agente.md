# Brief de publicidad para un agente con navegador

Instrucciones para un agente que trabaja en Chrome con las cuentas de Lucas (mantenedor del proyecto). El plan completo y su seguimiento están en [fase-10-lanzamiento-y-publicidad.md](fase-10-lanzamiento-y-publicidad.md).

## Qué es el producto

**AoE2 Overlay** es una ventana transparente que queda encima de Age of Empires II: Definitive Edition y muestra los pasos de una estrategia de apertura (build order) con reloj: cuántos aldeanos, a qué recurso y qué viene después. La acompaña una web donde la comunidad crea, vota y guarda estrategias.

- Gratis, de código abierto (licencia MIT), para Windows 10/11. Versión actual: **0.3.3**.
- No se inyecta en el juego ni lee su memoria: es una ventana común "siempre encima". Los clics pasan al juego.
- Elegís mapa y civilización, te sugiere estrategias, tocás Jugar y arrancás el reloj con `Ctrl+Alt+P`.
- La interfaz está **solo en español** por ahora.
- El instalador **no está firmado**: Windows puede mostrar SmartScreen ("Más información" → "Ejecutar de todas formas"). No pide permisos de administrador y se actualiza solo.
- Diferencial frente a otros overlays (RTS Overlay, Border, RTS Helper): está en español y las estrategias las vota la comunidad.

## Links y material

| Qué                        | Dónde                                                                                            |
| -------------------------- | ------------------------------------------------------------------------------------------------ |
| Web                        | https://aoe2overlay.sitemaster.com.ar                                                            |
| Descarga                   | https://aoe2overlay.sitemaster.com.ar/descargar                                                  |
| Estrategias                | https://aoe2overlay.sitemaster.com.ar/estrategias                                                |
| Código                     | https://github.com/sk8erlucas/aoe2-overlay                                                       |
| Video demo (40 s, 1080p)   | `C:\Users\Lucas\Videos\aoe2-overlay\aoe2-overlay-demo.mp4`                                       |
| Video demo (720p, liviano) | https://aoe2overlay.sitemaster.com.ar/videos/aoe2-overlay-demo.mp4                               |
| GIF del overlay            | https://raw.githubusercontent.com/sk8erlucas/aoe2-overlay/main/docs/screenshots/overlay-demo.gif |
| Capturas                   | `docs/screenshots/` del repo (overlay-partida.png, web-estrategia.png)                           |
| Imagen para compartir      | https://aoe2overlay.sitemaster.com.ar/opengraph-image (se ve sola al pegar el link)              |
| Vista previa del repo      | `docs/media/github-social-preview.png` (1280×640)                                                |

Al compartir links, agregá UTM para medir de dónde vienen las visitas: `?utm_source=<sitio>&utm_medium=social&utm_campaign=lanzamiento` (por ejemplo `utm_source=reddit`).

El video y el GIF muestran la interfaz real pero **sin el juego atrás**. Decilo si alguien pregunta; no los presentes como una partida.

## Reglas

1. **Transparencia:** en cada publicación, decir que es de Lucas, el desarrollador. Nada de cuentas falsas, reseñas inventadas ni votos comprados.
2. **Una publicación por comunidad.** Antes de publicar, leer las reglas del lugar: si prohíben autopromoción o piden permiso a un moderador, pedirlo o saltearlo.
3. **No afirmar** que está "permitido en torneos" ni que es "100% seguro". Sí: "no se inyecta en el juego ni lee su memoria" y "el código es abierto".
4. **Siempre gratis.** Repetir en videos y descripciones el aviso de Microsoft: _"Age of Empires II © Microsoft Corporation. AoE2 Overlay fue creado según las Game Content Usage Rules de Microsoft usando assets de Age of Empires II, y no está respaldado ni afiliado con Microsoft."_
5. **Privacidad:** no publicar el email personal de Lucas. El contacto público es GitHub (issues).
6. **Gastos, cuentas nuevas, temas legales y respuestas a críticas fuertes:** consultar a Lucas antes.
7. **Lo que pidan o critiquen** los usuarios anotarlo en el registro (ver abajo); no prometer funciones ni fechas.

## Tareas, en orden

**Estado al 2026-11-12:** las tareas 1 y 2 están hechas ([video en YouTube](https://youtu.be/B-13galXHyM)). De la 3, VirusTotal está revisado (2 de 71: SecureAge y Sophos); faltan los reportes de falso positivo y el envío a Microsoft, que piden adjuntar el `.exe` y los tiene que subir Lucas. Seguí desde la tarea 4 y, para compartir el video, usá el link de YouTube.

### 1. GitHub: vista previa del repo

En https://github.com/sk8erlucas/aoe2-overlay/settings → General → **Social preview** → subir `docs/media/github-social-preview.png`. Así se ve una tarjeta al compartir el link del repo.

### 2. YouTube: subir el video demo

- Archivo: `C:\Users\Lucas\Videos\aoe2-overlay\aoe2-overlay-demo.mp4`.
- Título: **AoE2 Overlay: tu build order paso a paso, encima del juego (gratis)**
- Descripción:

  ```
  AoE2 Overlay muestra los pasos de tu apertura en Age of Empires II: DE con reloj, encima del juego. Elegí mapa y civilización, tocá Jugar y seguí cada paso a su tiempo.

  Gratis y de código abierto. No se inyecta en el juego ni lee su memoria.

  Descargar: https://aoe2overlay.sitemaster.com.ar/descargar?utm_source=youtube&utm_medium=social&utm_campaign=lanzamiento
  Estrategias de la comunidad: https://aoe2overlay.sitemaster.com.ar/estrategias?utm_source=youtube&utm_medium=social&utm_campaign=lanzamiento
  Código: https://github.com/sk8erlucas/aoe2-overlay

  Age of Empires II © Microsoft Corporation. AoE2 Overlay fue creado según las Game Content Usage Rules de Microsoft usando assets de Age of Empires II, y no está respaldado ni afiliado con Microsoft.
  ```

- Etiquetas: aoe2, age of empires 2, build order, overlay, aoe2 de, estrategias aoe2.
- Público, **sin monetización**, "no es para niños". Anotar el link en el registro.

### 3. Confianza del instalador

1. Bajar el instalador de https://github.com/sk8erlucas/aoe2-overlay/releases/latest (`AoE2.Overlay_0.3.3_x64-setup.exe`).
2. **VirusTotal** (https://www.virustotal.com): subir el archivo y anotar cuántos antivirus lo marcan y cuáles. Si alguno lo marca, reportar el falso positivo en el formulario de ese antivirus, con el link al código y a la release.
3. **Microsoft** (https://www.microsoft.com/wdsi/filesubmission): enviarlo como **Software developer**, producto Microsoft Defender Antivirus, indicando que es un falso positivo o que no debería detectarse, con el link a la release. Requiere iniciar sesión con la cuenta Microsoft de Lucas.

### 4. Comunidad hispana (prioridad)

- Buscar comunidades activas de AoE2 en español: servidores de Discord, grupos de Facebook, subforos en español, comunidades de Steam. Priorizar las que tengan actividad en el último mes.
- Publicar en **3 a 5**, respetando las reglas, con el texto de abajo y el GIF o el link de YouTube.
- Responder las preguntas de las primeras 48 h. Lo que no sepas, anotarlo para Lucas.

**Texto (español):**

> Soy Lucas, el desarrollador de AoE2 Overlay: un overlay gratis y de código abierto para AoE2: DE. Muestra los pasos de tu apertura encima del juego, con reloj y atajos de teclado, y los clics pasan al juego. No se inyecta ni lee la memoria. Las estrategias se crean y se votan en la web. Todavía no está firmado, así que Windows puede mostrar un aviso. Me sirve mucho que me digan qué le falta: https://aoe2overlay.sitemaster.com.ar

**Versión corta (Discord):**

> Hice un overlay gratis para AoE2: DE que te va marcando el build order con reloj, encima del juego (no toca la memoria del juego). Está en español y las estrategias las vota la comunidad. ¿Qué le agregarían? https://aoe2overlay.sitemaster.com.ar

### 5. Creadores de contenido hispanos

- Armar una lista de **10 creadores chicos o medianos** de AoE2 en español (YouTube o Twitch) con: nombre, link, seguidores, frecuencia de publicación y forma de contacto pública.
- Escribirles un mensaje personalizado (máximo 10 en total): mencionar algo concreto de su contenido y ofrecerles **cargar su build favorita en el catálogo, con crédito y link a su canal**. No pedir que lo promocionen ni ofrecer dinero.
- Hacer un solo seguimiento a la semana si no contestan.

### 6. Build Order Guide (pedir permiso)

El catálogo importó estrategias de https://www.buildorderguide.com con crédito a sus autores, pero el sitio no publica términos de uso. Buscar cómo contactar a sus mantenedores (web, Discord o GitHub) y mandar, en inglés:

> Hi! I'm Lucas, I maintain AoE2 Overlay (https://github.com/sk8erlucas/aoe2-overlay), a free, open source build order overlay in Spanish. We'd like to include some Build Order Guide builds in our catalog, always crediting the original author with a link back to the build on your site. Would that be OK with you? If you'd rather we didn't, we'll remove them. Thanks for the great site!

Anotar la respuesta textual: define si podemos sumar más estrategias.

### 7. Internacional (después de las tareas 1 a 6)

La interfaz todavía está en español (issue #9). Antes de publicar en inglés, aclararlo en el texto.

- **r/aoe2:** leer las reglas; si se permite, un post con el GIF y el texto en inglés. Si el sitio tiene un hilo semanal para herramientas o autopromoción, usar ese.
- **Foro oficial** (https://forums.ageofempires.com): un hilo en la categoría de creaciones o herramientas de la comunidad.
- **AoEZone** (https://www.aoezone.net): un hilo.
- **Steam:** una guía corta "Cómo seguir tu build order con AoE2 Overlay" en la comunidad de AoE2: DE.

**Texto (inglés):**

> I built AoE2 Overlay, a free and open source build order overlay for AoE2: DE. It shows your opening steps on top of the game, with a timer and hotkeys, and clicks pass through to the game. It doesn't inject code or read game memory. Strategies are created and voted on the website. The interface is in Spanish for now (English is planned), and the installer isn't signed yet, so Windows may show a warning. Feedback is very welcome: https://aoe2overlay.sitemaster.com.ar

### 8. Proyecto hermano

La home enlaza a **AoE2 Replays** (https://aoe2replays.sitemaster.com.ar), del mismo autor. **No lo promociones todavía:** al 2026-11-11 el visor de partidas mostraba "No se pudo conectar" al abrir partidas. Antes de mencionarlo, abrir una partida desde su web y confirmar que se reproduce.

## Registro (entregar al terminar)

Devolver una tabla con una fila por acción:

| Fecha | Lugar | Qué se hizo | Link | Resultado (vistas, votos, respuestas) | Pendiente |
| ----- | ----- | ----------- | ---- | ------------------------------------- | --------- |

Además, al final:

- Resultado de VirusTotal (detecciones y nombres) y número de envío a Microsoft.
- Pedidos y críticas de los usuarios, agrupados por tema.
- Respuesta de Build Order Guide.
- Lista de creadores contactados y quién respondió.

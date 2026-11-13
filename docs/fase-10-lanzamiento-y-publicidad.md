# Fase 10: Lanzamiento y publicidad

**Objetivo:** que jugadores reales conozcan y usen el overlay, empezando por la comunidad hispana, con un instalador en el que se pueda confiar.

**Depende de:** Fases 6 y 9. Conviene avanzar en paralelo con la [Fase 8](fase-8-pruebas-manuales.md).

**Brief para un agente con navegador:** [publicidad-brief-agente.md](publicidad-brief-agente.md).

**Posicionamiento:** ya existen RTS Overlay (que importa desde Build Order Guide), Border y RTS Helper. No competimos como "otro overlay", sino como **el overlay en español, con estrategias votadas por la comunidad, que no toca el juego**.

## Tareas

### 1. Antes de difundir

- [x] Publicar la 0.3.3 con `latest.json` (2026-11-09)
- [x] Mergear el PR #2 (privacidad y política de firma)
- [ ] Probar en partida real: clics, foco, hotkeys y reloj ([Fase 8](fase-8-pruebas-manuales.md))
- [ ] Instalar desde la web en una PC limpia
- [ ] Con una versión anterior instalada, confirmar que ofrece la actualización a la última
- [ ] Cargar builds para las civilizaciones más jugadas ([Fase 9](fase-9-estrategias-comunidad.md))
- [x] Build Order Guide: código MIT y estrategias publicadas de lectura pública; se pueden importar con crédito (ver [Fase 9](fase-9-estrategias-comunidad.md)). El 2026-11-13 se importaron 57: el catálogo tiene 66 estrategias públicas
- [x] Imagen para compartir (Open Graph, 1200×630), `sitemap.xml` con las estrategias públicas y `robots.txt`
- [x] Repo de GitHub con web y temas (`aoe2`, `build-order`, `overlay`…)
- [x] Vista previa del repo (`docs/media/github-social-preview.png`) subida en Settings → Social preview (2026-11-12)
- [ ] Reemplazar la ilustración de Microsoft del hero ([Fase 7](fase-7-futuro.md)); no bloquea la difusión

### 2. Operación y seguridad

- [ ] Backups automáticos de la base (Dokploy → base → Backups)
- [ ] Obligar SSL en las conexiones externas (`hostssl` en `pg_hba.conf`): hoy todavía acepta conexiones sin cifrar desde afuera
- [ ] Guardar una copia de `~/.tauri/aoe2-overlay.key*` en un gestor de contraseñas: sin esa clave no se pueden publicar actualizaciones
- [x] Botón "Eliminar mi cuenta" en `/perfil` (pide la contraseña; las estrategias quedan sin autor)

### 3. Confianza del instalador

**Sin firma (gratis):**

- [x] Solicitud a SignPath Foundation: **rechazada el 2026-11-10** por falta de visibilidad pública (estrellas, forks, contribuidores, menciones en Reddit o YouTube). Se puede volver a pedir más adelante
- [x] Quitar la línea de crédito de SignPath del README, `/descargar` y `CODE_SIGNING.md`
- [x] Publicar `SHA256SUMS.txt` en cada release, para verificar las descargas
- [ ] Antes de anunciar cada versión, enviar el `.exe` a Microsoft como **Software developer** en [microsoft.com/wdsi/filesubmission](https://www.microsoft.com/wdsi/filesubmission). Defender es el antivirus que tiene casi todo el público. **0.3.3: pendiente.** El formulario pide adjuntar el `.exe`, así que lo tiene que subir Lucas; anotar acá el número de envío
- [x] Revisar la 0.3.3 en VirusTotal (2026-11-12): [2 de 71](https://www.virustotal.com/gui/file/49f300c8544336ca4561cca6ddbf110980765431fda4bdbe15b676fd339f21bd), SecureAge "Malicious" y Sophos "Generic ML PUA". En la 0.2.0 habían sido Arctic Wolf y SecureAge
- [ ] Reportar el falso positivo de la 0.3.3 a **SecureAge** y a **Sophos**. Cada formulario pide adjuntar el `.exe`: lo tiene que subir Lucas
- [ ] Revisar cada release nueva en VirusTotal y reportar los falsos positivos al antivirus que lo marque
- [ ] Espaciar las versiones: un instalador sin firma junta reputación en SmartScreen por archivo, así que cada versión nueva arranca de cero
- [x] Manifiestos de winget validados en [`packaging/winget`](../packaging/winget/README.md)
- [ ] Enviarlos a `winget-pkgs` con `wingetcreate submit`: Microsoft lo valida al aceptarlo y además es otro canal de difusión
- [ ] Investigar la Microsoft Store con MSIX: el registro es gratis para personas y la Store firma el paquete. Tauri no genera MSIX directamente y la Store tiene su propio sistema de actualizaciones

**Con firma (cuando haya presupuesto o visibilidad):**

- [ ] Volver a pedir SignPath Foundation cuando las métricas de abajo crezcan
- [ ] O comprar un certificado: Certum Open Source (desde unos 69 €, a nombre de persona; confirmar que Microsoft lo reconozca), SignPath pago, o un OV comercial (unos 200–400 USD por año)
- [ ] Al firmar: adaptar `release.yml` (la firma del updater se genera después de firmar el instalador), confirmar que la actualización sigue funcionando y sacar los avisos de SmartScreen

Azure Artifact Signing no sirve desde Argentina: para personas solo acepta EE. UU. y Canadá, y para organizaciones suma UE y Reino Unido (revisado 2026-11-09).

### 4. Material

Cómo hacerlo: ver [Cómo grabar los videos y GIF](#cómo-grabar-los-videos-y-gif).

- [x] GIF de la interfaz para el README (`docs/screenshots/overlay-demo.gif`), grabado automáticamente sin el juego atrás
- [ ] GIF en partida real, 8–10 s, para reemplazar al anterior
- [x] Video demo de 40 s (interfaz del overlay y web, sin partida), en `Videos\aoe2-overlay\aoe2-overlay-demo.mp4`
- [x] Video demo subido a YouTube: https://youtu.be/B-13galXHyM (2026-11-12), con título, descripción y UTM del brief
- [x] YouTube Studio (2026-11-13): el video está público y sin monetización; se le agregaron 15 etiquetas (aoe2, age of empires 2, build order, aoe2 overlay, estrategias aoe2, hera, en español…)
- [ ] Ponerle música al video. La del juego sería ideal, pero es de Microsoft: aunque las Game Content Usage Rules permiten usarla sin fines comerciales, YouTube puede reclamarla por Content ID. Probar primero en un video privado; si hay reclamo, usar música libre de derechos con estilo medieval
- [ ] Video en partida real (guion de abajo), para la versión definitiva
- [x] Mostrar el video en la landing (sección "Miralo en acción")
- [x] Sección AoE2 Replays en la home, con su video en español y links UTM (`utm_source=aoe2-overlay`)
- [ ] Short vertical (YouTube Shorts o TikTok), 15–30 s
- [ ] Capturas nuevas de la web y del overlay para los posts

### 5. Difusión

**Semana 1: comunidad hispana**

- [x] Primera ronda (2026-11-13): publicado en 1 comunidad, en su canal para compartir contenido. Otras 3 solo aceptan promoción con permiso de un admin: pedido en 2, falta en 1
- [ ] Publicar en esas comunidades cuando den permiso, y sumar otras hasta llegar a 3–5
- [ ] Responder preguntas durante las 48 h siguientes a cada publicación
- [ ] Anotar cada pedido o queja en una issue

**Semanas 2–3: creadores**

- [x] Ronda 1 (2026-11-13): 6 mensajes personalizados a creadores hispanos y 3 más en curso. De la lista inicial, 3 se descartaron (ya no hacen AoE2: DE en español) y 1 no tiene un contacto público vigente
- [ ] Seguimiento de la ronda 1 a la semana (una sola vez) y cargar la build de quien acepte
- [ ] **Rondas siguientes (repetir cada 1–2 meses):** 10 creadores nuevos por ronda con los mismos criterios del [brief](publicidad-brief-agente.md#5-creadores-de-contenido-hispanos), sin repetir a quien ya se contactó. Buen momento: después de una versión nueva o de sumar estrategias

**Semanas 3–4: internacional** (requiere overlay y web en inglés, [Fase 7](fase-7-futuro.md))

- [ ] Hilo en el [foro oficial](https://forums.ageofempires.com/), donde ya hay anuncios de herramientas parecidas
- [ ] Hilo en AoEZone
- [ ] Post en r/aoe2, después de leer las reglas del subreddit. La solicitud de SignPath lo menciona: si todavía no se hizo, es prioritario
- [ ] Guía en Steam

**Constante**

- [ ] Una "build de la semana" en Discord y redes
- [ ] Publicar los cambios de cada versión
- [ ] Sumar builds y un tutorial cuando salga un parche o una civilización nueva
- [x] Issues iniciales: #7 y #8 (`good first issue`), #9 (inglés, `help wanted`)

## Cuidados

- Mantenerlo gratis, para respetar las [reglas de contenido de Microsoft](https://www.xbox.com/en-US/developers/rules), y repetir su aviso en la descripción de los videos.
- No decir que está "permitido en torneos": depende de cada organizador. Sí se puede decir que no inyecta código ni lee la memoria del juego.
- Avisar que Windows puede mostrar SmartScreen hasta que el instalador esté firmado.
- No publicar el email personal del mantenedor: el contacto va por GitHub.

## Métricas

Actualizar una vez por semana. Las descargas salen de los assets `.exe` y `.msi` de cada release:

```powershell
gh api repos/sk8erlucas/aoe2-overlay/releases --jq '[.[].assets[] | select(.name | test("(exe|msi)$")) | .download_count] | add'
```

| Fecha      | Descargas totales | Estrellas | Cuentas | Estrategias de usuarios | Notas                                                                 |
| ---------- | ----------------- | --------- | ------- | ----------------------- | --------------------------------------------------------------------- |
| 2026-11-09 | 14                | 1         | —       | —                       | Punto de partida, sin difusión                                        |
| 2026-11-12 | 18                | 1         | —       | —                       | Antes de la difusión. Video en YouTube y vista previa del repo listos |

## Cómo grabar los videos y GIF

Herramientas, ya instaladas en la PC de desarrollo: **OBS Studio** para grabar y **ffmpeg** para el GIF. Para cortar y poner textos alcanza con **Clipchamp**, que viene con Windows 11; DaVinci Resolve es gratis si hace falta algo más.

### Configurar OBS

1. Fuente: **Captura de pantalla** del monitor del juego. No usar "Captura de juego": el overlay es otra ventana y no saldría en el video.
2. Ajustes → Salida: formato **MKV** (no se pierde si se corta la grabación) y codificador de hardware (NVENC o AMD) si está disponible.
3. Ajustes → Video: 1920×1080 y 60 FPS.
4. Hacer una prueba de 10 segundos y confirmar que el overlay se ve y se lee.
5. Después de grabar: Archivo → **Remuxear grabaciones** para pasar a MP4.

Guardar los originales fuera del repo, por ejemplo en `Videos\aoe2-overlay\`. En el repo solo va el GIF final.

### Al grabar

- Jugar contra la IA, para no mostrar nombres de otros jugadores.
- Apagar la música del juego y dejar los efectos: evita reclamos de derechos en las plataformas.
- Cerrar notificaciones y apps con datos personales.
- Subir un poco el tamaño de texto del overlay, para que se lea en celular.

### Guion del video demo (30–45 s)

| Tiempo  | Imagen                                                        | Texto en pantalla                |
| ------- | ------------------------------------------------------------- | -------------------------------- |
| 0–3 s   | Partida con el overlay mostrando un paso                      | ¿Te perdés en la apertura?       |
| 3–10 s  | Elegir mapa y civilización, tocar una sugerencia y Jugar      | Elegí tu estrategia              |
| 10–25 s | Partida: cambian los pasos y el reloj; clics sobre el overlay | Paso a paso, sin salir del juego |
| 25–35 s | Web: explorar, votar y "Abrir en el overlay"                  | Estrategias de la comunidad      |
| 35–40 s | Logo y dirección de la web                                    | Gratis y open source             |

### Pasar a GIF

Para un clip de 1080p, este comando toma 8 segundos desde el segundo 5 y recorta la zona de arriba a la derecha, donde está el overlay:

```powershell
ffmpeg -ss 5 -t 8 -i demo.mp4 -filter_complex "crop=1280:720:640:0,fps=12,scale=960:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128[p];[b][p]paletteuse=dither=bayer:bayer_scale=4" overlay-partida.gif
```

Tiene que pesar menos de unos 8 MB. Si se pasa, bajar `fps` a 10 o `scale` a 800.

### Pasar a vertical

Recorta la franja derecha de la pantalla, donde está el overlay, y la lleva a 1080×1920. Para mover el recorte, cambiar el valor `x` (`1312`):

```powershell
ffmpeg -i demo.mp4 -vf "crop=608:1080:1312:0,scale=1080:1920:flags=lanczos" -c:a copy short.mp4
```

## Textos para publicar

Adaptarlos al lugar y sumar el GIF o el video.

**Español**

> Soy el desarrollador de AoE2 Overlay, un overlay gratis y open source para AoE2: DE. Muestra los pasos de tu apertura arriba del juego, con reloj y hotkeys, y los clics pasan al juego. No se inyecta ni lee la memoria. Las estrategias se crean y votan en la web. Todavía no está firmado, así que Windows puede mostrar un aviso. Me sirve mucho que me digan qué falta: https://aoe2overlay.sitemaster.com.ar

**English** (cuando la interfaz esté traducida)

> I built AoE2 Overlay, a free and open source build order overlay for AoE2: DE. It shows your opening steps on top of the game, with a timer and hotkeys, and clicks pass through to the game. It doesn't inject code or read game memory. Strategies are created and voted on the website. The installer isn't signed yet, so Windows may show a warning. Feedback is very welcome: https://aoe2overlay.sitemaster.com.ar

## Criterio de terminado

- [ ] El instalador está firmado y se actualiza bien
- [ ] El README y la landing muestran el overlay en movimiento
- [ ] Se difundió en la comunidad hispana y en al menos dos canales internacionales
- [ ] Al menos un creador de contenido lo mostró o aportó una build
- [ ] Hay usuarios que publican estrategias sin que se lo pidamos

# Diseño de la web

Dirección visual para `apps/web` (Fase 4). Está basada en un diseño de referencia (hero rojo con ilustración vectorial que se "arma" con el scroll y panel crema con datos), **adaptado a nuestra marca: AoE2 Overlay**.

> **Assets:** no usamos ninguna imagen, video ni ilustración del diseño de referencia ni del juego. Todo lo gráfico es propio: ilustraciones nuestras o encargadas con licencia compatible, y el logo del escudo con reloj de arena (`apps/overlay/app-icon.svg`).

## Implementación actual (Fase 4)

La ilustración disponible es **una sola imagen** (caballero teutónico, 500×500, con transparencia), así que el "armado pieza por pieza" se reemplazó por:

1. **Silueta → luz:** el caballero arranca oscuro (`brightness .22`) y se ilumina con el scroll.
2. **Brillo dorado:** una franja de luz recorre solo su silueta (máscara CSS con la misma imagen).
3. **Cámara:** acercamiento suave hacia el yelmo (×1.16, para no pixelar la imagen).
4. **Panel de build order:** a la derecha, una réplica del overlay va tachando pasos a medida que se baja. Cuenta qué hace el producto.
5. **Brasas** doradas en canvas 2D en lugar del video de pétalos.

El resto (título estirado, reglas, etiquetas, sección crema, móvil y movimiento reducido) sigue esta especificación. Lo de abajo queda como objetivo para cuando haya una ilustración propia en capas.

## Concepto

La landing cuenta lo que hace el producto: **una estrategia se arma paso a paso**. En el hero, un caballero medieval (ilustración propia, vectorial y plana) recibe su armadura pieza por pieza a medida que se hace scroll, igual que una build order va sumando edificios y aldeanos.

## Marca

| Token         | Valor     | Uso                                                      |
| ------------- | --------- | -------------------------------------------------------- |
| Rojo          | `#E40038` | Fondo del hero, reglas, acentos                          |
| Crema         | `#FAF3E9` | Fondo de secciones, texto sobre rojo                     |
| Tinta         | `#201408` | Texto principal sobre crema                              |
| Oro (nuestro) | `#E2B04A` | Logo, botón de descarga, detalles (igual que el overlay) |

- **Tipografías** (self-hosted con `next/font`, sin pedidos a Google en runtime):
  - **Anton** para los títulos gigantes.
  - **Archivo** variable (ancho 62–125, peso 100–900) para todo lo demás.
  - Reemplazamos la línea de kanji por una línea en Archivo: **"ESTRATEGIAS DE APERTURA"**.
- **Escala:** `--u = 100vw / 1507` (diseño sobre un cuadro de 1507px) y `--side = 121u`.
- **Grano de papel:** overlay SVG de ruido fractal al 16 % en `multiply`, sobre todas las secciones.

## Sección 1: hero (alto 1440u, rojo, `overflow: hidden`)

- **Nav:** 84u de alto con regla inferior crema al 50 %. Tres ítems centrados: **ESTRATEGIAS · DESCARGAR · GITHUB**, en Archivo 30u, peso 900, ancho 84 %, mayúsculas. Login/cuenta a la derecha, discreto.
- **Marco:** dos reglas verticales de 1px crema al 50 % a `--side` de cada borde, debajo de la nav.
- **Etiquetas laterales** rotadas (11u, 800, mayúsculas, tracking +.08em):
  - Izquierda (−90°): "01 / 03" · "AOE2 OVERLAY" · "BUILD ORDERS" · "01 / 03".
  - Derecha (90°): las mismas, con las dos del medio intercambiadas.
- **Línea superior:** "ESTRATEGIAS DE APERTURA" centrada, a 158u.
- **Título:** dos líneas en Anton crema, estiradas para llenar su caja exacta (altura de mayúsculas medida en canvas + SVG `textLength` con `lengthAdjust="spacingAndGlyphs"`):
  - "AOE2": 392u × 258u, top 252u.
  - "OVERLAY": 1120u × 266u, top 526u.
- **Escenario:** cuadrado de 1386u centrado, top 54u, por delante del título. Contiene la ilustración base del caballero sin armadura y las piezas superpuestas, cortadas del mismo dibujo y alineadas al píxel.
- **Partículas:** canvas WebGL de 1507u por encima de todo, con un loop de video propio de partículas cayendo (hojas o brasas) sobre chroma verde. Alpha según el rojo: `a = smoothstep(.12, .75, r - g*.5)`, verde limitado al azul, premultiplicado.

### El armado con el scroll

- **Progreso:** `p = clamp((scrollY - 0.06·vh) / (0.62·vh))`, suavizado un 20 % por frame.
- **Cámara:** la capa interna escala `1 + 0.3·easeInOutCubic(p)` y sube `-4 %·easeInOutCubic(p)`: zoom hacia la cara.
- **Piezas** (crecen desde un ancla del dibujo de 2048px; invisibles antes de su ventana, opacidad completa en el primer ~7 % y luego escalan de (sx, sy) a (1, 1)):

| Pieza (propuesta)  | Ventana de p | Escala inicial | Easing       |
| ------------------ | ------------ | -------------- | ------------ |
| Visera / yelmo     | .16–.46      | .72, .72       | easeOutCubic |
| Cimera / penacho   | .22–.54      | .12, .30       | backOut 1.25 |
| Hombreras          | .30–.60      | .25, .65       | easeOutCubic |
| Estandarte / lanza | .40–.70      | .12, .10       | backOut 1.4  |
| Peto / sobreveste  | .34–.74      | .55, 0         | easeOutCubic |

Las anclas se definen cuando tengamos la ilustración. Al volver a subir, la armadura se quita en orden inverso.

### Animación de entrada (Web Animations)

| Elemento                  | Animación                                     | Duración | Retraso          |
| ------------------------- | --------------------------------------------- | -------- | ---------------- |
| Líneas del título         | Suben desde su máscara (translateY 102 % → 0) | 1.1s     | 150 / 290ms      |
| Línea superior            | Sube 16u mientras aparece                     | —        | 60ms             |
| Nav y etiquetas laterales | Fade in                                       | 0.7s     | 120ms + 25ms c/u |
| Escenario                 | Sube 6 %                                      | 1.3s     | —                |

Todas con `cubic-bezier(.2,.8,.2,1)`.

## Sección 2: "Qué es" (crema)

- **Reglas:** las mismas dos verticales, en rojo al 55 %.
- **Fila de datos:** 324u de alto con regla roja abajo. Etiquetas laterales: "EL PROYECTO" a la izquierda, "02 / 03" a la derecha.
  - **Bloque izquierdo** (a 200u, 290u de ancho): etiqueta "[ AOE2 OVERLAY ]" (10.5u, 700, mayúsculas) y debajo el logo del escudo, de 232u de ancho.
  - **Derecha:** grilla de 2 × 3 datos, desde 560u hasta 150u del borde derecho. Etiqueta chica arriba y valor en Archivo 31u, peso 900, ancho 90 %, mayúsculas:

| Etiqueta       | Valor                                  |
| -------------- | -------------------------------------- |
| ESTRATEGIAS    | `{n}` DE LA COMUNIDAD (dato de la API) |
| CIVILIZACIONES | 53                                     |
| MAPAS          | 32                                     |
| RELOJ          | VELOCIDAD 1.7×                         |
| CÓDIGO         | OPEN SOURCE · MIT                      |
| PRECIO         | GRATIS                                 |

- **Tarjeta de presentación:** márgenes laterales de 134u, borde rojo de 1px al 70 % y un círculo de 30u en cada esquina, centrado en el vértice.
  - Arriba, centrado, un ícono propio de 118u (reloj de arena).
  - Frase en Archivo 50u, peso 900, ancho 96 %, interlineado 1, mayúsculas, una línea por renglón:
    > AOE2 OVERLAY TE GUÍA PASO A PASO / EN TU APERTURA, ENCIMA DEL JUEGO, / SIN TOCAR EL JUEGO NI SU MEMORIA. / ELEGÍ MAPA Y CIVILIZACIÓN, DALE START / Y SEGUÍ EL RITMO DE LOS PROS
  - Debajo, un párrafo de 19u (máximo 500 de ancho): "Gratis y de código abierto. Las estrategias las crea y las vota la comunidad, y podés auditar cada línea del código en GitHub."
  - Botón **Descargar para Windows** en oro.
  - Etiquetas laterales: "03 / 03", "AOE2 OVERLAY", "DESCARGA".

## Resto del sitio

Explorar, detalle, editor, login y perfil usan el mismo lenguaje: fondo crema con grano, reglas rojas finas, títulos en Anton, etiquetas en Archivo condensado en mayúsculas y el oro solo para acciones principales.

## Móvil (≤ 767px)

- `--u = 100vw / 1300` y `--side = 22px`.
- **Hero:** alto `max(100svh, 178vw)`. Nav de 56px; la línea superior a 86px y el título desde 130px. El escenario pasa a 150vw cuadrado, anclado abajo al centro.
- **Datos:** el logo y los datos se apilan, con los datos en dos columnas.
- **Tarjeta:** la frase baja a `min(4vw, 22px)`.

## Movimiento reducido

Con `prefers-reduced-motion` no hay animación de entrada, la armadura se muestra completa (p = 1) y las partículas quedan en pausa.

## Implementación en Next.js

- El hero es un componente de cliente con `requestAnimationFrame` para el scroll; las transformaciones se aplican con `transform` (sin reflow).
- WebGL solo para las partículas, con fallback sin partículas si no hay WebGL.
- Las imágenes se sirven en `.webp` con `next/image` donde aplique. El escenario carga la base primero y las piezas en paralelo.

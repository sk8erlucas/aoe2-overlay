# Fase 4: Web

**Objetivo:** sitio para descargar el overlay y para gestionar estrategias.

**Depende de:** Fase 3.

**Diseño:** ver [diseno-web.md](diseno-web.md).

## Tareas

### Base

- [x] `apps/web` con Next.js 16 (App Router, Turbopack) + Tailwind 4
- [x] Cliente de la API (`src/lib/api.ts`) para navegador y servidor (reenvía la cookie de sesión)
- [x] Sistema visual según [diseno-web.md](diseno-web.md): paleta rojo/crema/tinta + oro, Anton + Archivo con `next/font` (self-hosted), grano de papel, reglas y etiquetas laterales
- [x] Layout, navegación y responsive (móvil ≤ 767px)

### Landing y descarga

- [x] Hero rojo con título "AOE2 / OVERLAY" estirado a su caja (altura de mayúsculas medida en canvas + SVG `textLength`)
- [x] Caballero con transición de scroll: sale de la sombra, brillo dorado sobre su silueta y acercamiento de cámara (ver nota)
- [x] Panel estilo overlay que va tachando los pasos de una build order al hacer scroll
- [x] Brasas doradas en canvas 2D (en lugar del video de pétalos), pausadas fuera de pantalla
- [x] Animación de entrada (Web Animations) y soporte de `prefers-reduced-motion`
- [x] Sección "Qué es" en crema: logo, 6 datos (con el número de estrategias de la API) y tarjeta con botón **Descargar** (último GitHub Release)
- [x] Página `/descargar`: pasos de instalación, aviso de SmartScreen, hotkeys y "¿es seguro?"
- [x] Footer con disclaimer de Microsoft, enlaces al repo y a SECURITY.md

### Estrategias

- [x] Explorar: filtros por civ, mapa, tipo de mapa, posición y búsqueda; orden por votos o recientes; paginación
- [x] Detalle: línea de tiempo con tiempos estimados, datos, votar, favorito, reportar y exportar JSON
- [x] Editor: datos, pasos (aldeanos, edad, tiempo, recursos, notas), reordenar, vista previa, importar/exportar JSON y avisos si los recursos no suman
- [x] Editar y borrar las propias

### Cuenta

- [x] Registro, login y logout
- [x] Perfil: mis estrategias y favoritas

### Moderación

- [x] Panel de reportes (moderador/admin): ocultar estrategia, resolver o descartar

### Seguridad

- [x] Redirecciones después del login solo a rutas internas (`safeNext`)
- [x] El campo `source` solo acepta `http`/`https` (en `packages/shared`): evita links `javascript:`

### Tests

- [x] 10 tests unitarios (cliente de la API, etiquetas, editor y `safeNext`)
- [x] Prueba en navegador real (Edge sin ventana) contra la base de producción: registro → crear → votar → borrar. Los usuarios de prueba se eliminaron después

## Criterio de terminado

- [x] Un usuario nuevo se registra, crea una estrategia y la vota (probado en navegador)
- [ ] Lighthouse aceptable (rendimiento y accesibilidad > 90) → pasa a la [Fase 8](fase-8-pruebas-manuales.md)

## Notas

- **Ilustración del hero:** `apps/web/public/game-assets/teutonic-knight.webp` es arte de Age of Empires II (© Microsoft). Se usa según las Game Content Usage Rules (proyecto gratuito, sin fines de lucro) y **no** está bajo la licencia MIT; ver el README de esa carpeta. Es una sola capa, así que en lugar de "armar la armadura" se hace la transición de luz y cámara. Reemplazarla por una propia en capas está en la [Fase 7](fase-7-futuro.md).
- La imagen es de 500×500 px: el escenario se limita a ~760u y el zoom a 1.16× para que no se pixele.
- Después de login, registro o salida se hace una navegación completa (`window.location.assign`) para que el header, que es un layout en caché, muestre la sesión nueva.
- En producción la web y la API tienen que compartir dominio padre (por ejemplo `aoe2overlay.com` y `api.aoe2overlay.com`) para que la cookie de sesión llegue a ambas. Configurar en la Fase 6.

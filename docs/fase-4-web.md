# Fase 4: Web

**Objetivo:** sitio para descargar el overlay y para gestionar estrategias.

**Depende de:** Fase 3.

**Diseño:** ver [diseno-web.md](diseno-web.md).

## Tareas

### Base

- [ ] Crear `apps/web` con Next.js (App Router) + Tailwind
- [ ] Cliente API tipado (desde `shared`)
- [ ] Sistema visual según [diseno-web.md](diseno-web.md): paleta rojo/crema/tinta + oro, Anton + Archivo con `next/font`, grano de papel, reglas y etiquetas laterales
- [ ] Layout, navegación y responsive (móvil ≤ 767px)

### Landing y descarga

- [ ] Hero rojo con título "AOE2 / OVERLAY" estirado, caballero que se arma con el scroll y partículas WebGL
- [ ] Sección "Qué es" en crema: logo, 6 datos (con el número de estrategias desde la API) y tarjeta con botón **Descargar** (último GitHub Release)
- [ ] Ilustración propia del caballero, cortada en capas (base + 5 piezas), y loop de partículas propio
- [ ] Animación de entrada y soporte de `prefers-reduced-motion`
- [ ] Guía de instalación: aviso de SmartScreen y hotkeys
- [ ] Footer con disclaimer de Microsoft, enlace al repo y licencia

### Estrategias

- [ ] Explorar: filtros por civ, mapa, tipo de mapa, posición y búsqueda; orden por votos o recientes
- [ ] Detalle: timeline de pasos, metadatos, votar, favorito, reportar y exportar JSON
- [ ] Editor: tabla de pasos (tiempo, pop, aldeanos, texto), reordenar, vista previa estilo overlay, import/export JSON
- [ ] Editar y borrar las propias

### Cuenta

- [ ] Registro, login y logout
- [ ] Perfil: mis estrategias y favoritas

### Moderación

- [ ] Panel de reportes (moderator/admin): ocultar estrategia y resolver reporte

## Criterio de terminado

- [ ] Un usuario nuevo se registra, crea una estrategia, otro usuario la vota y aparece en el ranking
- [ ] Lighthouse aceptable (rendimiento y accesibilidad > 90)

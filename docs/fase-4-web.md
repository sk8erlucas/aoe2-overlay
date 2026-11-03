# Fase 4: Web

**Objetivo:** sitio para descargar el overlay y para gestionar estrategias.

**Depende de:** Fase 3.

## Tareas

### Base

- [ ] Crear `apps/web` con Next.js (App Router) + Tailwind
- [ ] Cliente API tipado (desde `shared`)
- [ ] Layout, navegación, tema oscuro y responsive

### Landing y descarga

- [ ] Home: qué es, capturas y botón **Descargar** (último GitHub Release)
- [ ] Guía de instalación: borderless, aviso de SmartScreen y hotkeys
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

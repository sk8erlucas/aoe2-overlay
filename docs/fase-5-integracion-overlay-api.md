# Fase 5: Integración overlay ↔ API

**Objetivo:** que el overlay use las estrategias de la comunidad sin perder el modo offline.

**Depende de:** Fases 2, 3 y 4.

## Tareas

- [ ] URL de la API configurable (prod por defecto, local en dev)
- [ ] Sync de estrategias populares y verificadas al abrir (con `If-None-Match`/ETag)
- [ ] Caché local (store o SQLite) y fallback a estrategias base sin conexión
- [ ] Sugerencias desde `/suggestions` con fallback al score local
- [ ] Buscar estrategias por nombre desde el overlay
- [ ] Login opcional (flujo device-code: el overlay muestra un código y se confirma en la web)
- [ ] Favoritas del usuario arriba en la lista
- [ ] Abrir una estrategia de la web en el overlay (deep link `ageoverlay://strategy/<slug>`)
- [ ] Overlay: recordar posición y tamaño de la ventana entre sesiones (pendiente de la Fase 2)

## Criterio de terminado

- [ ] Una estrategia creada en la web aparece en el overlay sin reinstalar
- [ ] Sin internet, el overlay sigue funcionando con la caché

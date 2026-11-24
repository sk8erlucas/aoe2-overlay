# AoE2 Overlay: Roadmap

Herramienta open source para Age of Empires II: DE:

- **Overlay de escritorio** (instalador .exe) con los pasos de una estrategia de apertura arriba a la derecha. Es transparente, siempre encima y los clics pasan al juego.
- **Web** para descargar el overlay y para crear, explorar y votar estrategias.
- **API + DB** para usuarios, estrategias, votos y sugerencias.

Arquitectura y decisiones: [arquitectura.md](arquitectura.md) · Diseño de la web: [diseno-web.md](diseno-web.md) · Deploy: [deploy-dokploy.md](deploy-dokploy.md)

> **Proyecto terminado (2026-11-23).** Todas las fases están cerradas. Lo que quedó abierto (pruebas a mano, rutina y las ideas para si crece) está en **[mantenimiento.md](mantenimiento.md)**.

## Fases

| #   | Fase                                                                      | Estado       |
| --- | ------------------------------------------------------------------------- | ------------ |
| 0   | [Fundaciones del monorepo](completed/fase-0-fundaciones.md)               | ✅ Terminada |
| 1   | [Modelo y datos compartidos](completed/fase-1-modelo-y-datos.md)          | ✅ Terminada |
| 2   | [Overlay MVP (sin backend)](completed/fase-2-overlay-mvp.md)              | ✅ Terminada |
| 3   | [API y base de datos](completed/fase-3-api-y-db.md)                       | ✅ Terminada |
| 4   | [Web](completed/fase-4-web.md)                                            | ✅ Terminada |
| 5   | [Integración overlay ↔ API](completed/fase-5-integracion-overlay-api.md)  | ✅ Terminada |
| 6   | [Release y deploy](completed/fase-6-release-y-deploy.md)                  | ✅ Terminada |
| 7   | [Futuro](completed/fase-7-futuro.md)                                      | ✅ Terminada |
| 8   | [Pruebas manuales](completed/fase-8-pruebas-manuales.md)                  | ✅ Terminada |
| 9   | [Estrategias de la comunidad](completed/fase-9-estrategias-comunidad.md)  | ✅ Terminada |
| 10  | [Lanzamiento y publicidad](completed/fase-10-lanzamiento-y-publicidad.md) | ✅ Terminada |

Estados: ⬜ Pendiente · 🟨 En progreso · ✅ Terminada

## Cómo usar estos documentos

- Las fases terminadas se mueven a [completed/](completed/).

- Cada fase tiene **Objetivo**, **Depende de**, **Tareas** y **Criterio de terminado**.
- Al completar una tarea, se marca `- [x]` en el archivo de la fase.
- Al empezar o terminar una fase, se actualiza el estado en esta tabla.

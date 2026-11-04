# AoE2 Overlay: Roadmap

Herramienta open source para Age of Empires II: DE:

- **Overlay de escritorio** (instalador .exe) con los pasos de una estrategia de apertura arriba a la derecha. Es transparente, siempre encima y los clics pasan al juego.
- **Web** para descargar el overlay y para crear, explorar y votar estrategias.
- **API + DB** para usuarios, estrategias, votos y sugerencias.

Arquitectura y decisiones: [arquitectura.md](arquitectura.md) · Diseño de la web: [diseno-web.md](diseno-web.md) · Deploy: [deploy-dokploy.md](deploy-dokploy.md)

## Fases

| #   | Fase                                                                  | Estado         |
| --- | --------------------------------------------------------------------- | -------------- |
| 0   | [Fundaciones del monorepo](fase-0-fundaciones.md)                     | ✅ Terminada   |
| 1   | [Modelo y datos compartidos](fase-1-modelo-y-datos.md)                | ✅ Terminada   |
| 2   | [Overlay MVP (sin backend)](fase-2-overlay-mvp.md)                    | ✅ Terminada   |
| 3   | [API y base de datos](fase-3-api-y-db.md)                             | ✅ Terminada   |
| 4   | [Web](fase-4-web.md)                                                  | ✅ Terminada   |
| 5   | [Integración overlay ↔ API](fase-5-integracion-overlay-api.md)        | 🟨 En progreso |
| 6   | [Release y deploy](fase-6-release-y-deploy.md)                        | 🟨 En progreso |
| 7   | [Futuro](fase-7-futuro.md)                                            | ⬜ Pendiente   |
| 8   | [Pruebas manuales](fase-8-pruebas-manuales.md)                        | 🟨 En progreso |
| 9   | [Estrategias de la comunidad (plan)](fase-9-estrategias-comunidad.md) | ⬜ Pendiente   |

Estados: ⬜ Pendiente · 🟨 En progreso · ✅ Terminada

## Cómo usar estos documentos

- Cada fase tiene **Objetivo**, **Depende de**, **Tareas** y **Criterio de terminado**.
- Al completar una tarea, se marca `- [x]` en el archivo de la fase.
- Al empezar o terminar una fase, se actualiza el estado en esta tabla.

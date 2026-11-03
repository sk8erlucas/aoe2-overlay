# AoE2 Overlay: Roadmap

Herramienta open source para Age of Empires II: DE:

- **Overlay de escritorio** (instalador .exe) con los pasos de una estrategia de apertura arriba a la derecha. Es transparente, siempre encima y los clics pasan al juego.
- **Web** para descargar el overlay y para crear, explorar y votar estrategias.
- **API + DB** para usuarios, estrategias, votos y sugerencias.

Arquitectura y decisiones: [arquitectura.md](arquitectura.md)

## Fases

| #   | Fase                                                                          | Estado       |
| --- | ----------------------------------------------------------------------------- | ------------ |
| 0   | [Fundaciones del monorepo](fase-0-fundaciones.md)                             | ✅ Terminada |
| 1   | [Modelo y datos compartidos](fase-1-modelo-y-datos.md)                        | ⬜ Pendiente |
| 2   | [Overlay MVP (sin backend)](fase-2-overlay-mvp.md)                            | ⬜ Pendiente |
| 2b  | [Modo inyección para pantalla completa (opcional)](fase-2b-modo-inyeccion.md) | ⬜ Pendiente |
| 3   | [API y base de datos](fase-3-api-y-db.md)                                     | ⬜ Pendiente |
| 4   | [Web](fase-4-web.md)                                                          | ⬜ Pendiente |
| 5   | [Integración overlay ↔ API](fase-5-integracion-overlay-api.md)                | ⬜ Pendiente |
| 6   | [Release y deploy](fase-6-release-y-deploy.md)                                | ⬜ Pendiente |
| 7   | [Futuro](fase-7-futuro.md)                                                    | ⬜ Pendiente |

Estados: ⬜ Pendiente · 🟨 En progreso · ✅ Terminada

## Cómo usar estos documentos

- Cada fase tiene **Objetivo**, **Depende de**, **Tareas** y **Criterio de terminado**.
- Al completar una tarea, se marca `- [x]` en el archivo de la fase.
- Al empezar o terminar una fase, se actualiza el estado en esta tabla.

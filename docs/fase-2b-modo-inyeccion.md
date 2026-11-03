# Fase 2b: Modo inyección (pantalla completa exclusiva)

**Objetivo:** que el overlay se vea aunque el juego esté en pantalla completa exclusiva, como Discord o Steam.

**Depende de:** Fase 2. Solo se hace si la prueba de pantalla completa de la Fase 2 falla.

**Opcional:** desactivado por defecto. El usuario lo activa con un aviso de riesgos (antivirus y términos del juego).

## Tareas

### DLL de overlay (`apps/overlay-hook`)

- [ ] Crate Rust `cdylib` (o C++ si resulta más práctico) para x64
- [ ] Hook de `IDXGISwapChain::Present` y `ResizeBuffers` (DirectX 11), por ejemplo con `retour` o MinHook
- [ ] Render del overlay con ImGui (`imgui-rs` + backend DX11): paso actual, siguiente, reloj y aldeanos
- [ ] Manejo de cambios de resolución y alt-tab sin crashear el juego
- [ ] Solo dibuja: no lee ni escribe la memoria del juego

### Comunicación con la app Tauri

- [ ] Named pipe: la app envía el estado (estrategia, reloj, paso actual, estilo)
- [ ] Las hotkeys siguen manejadas por la app Tauri

### Inyector

- [ ] Detectar el proceso `AoE2DE_s.exe` al iniciarse
- [ ] Inyectar la DLL (`CreateRemoteThread` + `LoadLibraryW`)
- [ ] Toggle en configuración, con pantalla de advertencia y confirmación
- [ ] Fallback automático a la ventana normal si falla la inyección

### Confianza

- [ ] Firma de código del instalador y de la DLL
- [ ] Documentar en el README qué hace exactamente la DLL y por qué
- [ ] Reportar falsos positivos a los principales antivirus

## Criterio de terminado

- [ ] Con AoE2 en pantalla completa exclusiva, el overlay se ve y se actualiza
- [ ] Alt-tab, cambio de resolución y salir del juego sin crashes
- [ ] Rendimiento: impacto en FPS menor al 2 %

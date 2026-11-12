# winget

Manifiestos para publicar AoE2 Overlay en [winget](https://github.com/microsoft/winget-pkgs) (`winget install sk8erlucas.AoE2Overlay`). Microsoft revisa cada paquete antes de aceptarlo.

## Validar

```powershell
winget validate --manifest packaging/winget/manifests/s/sk8erlucas/AoE2Overlay/0.3.3
```

## Enviar la primera versión

Con [wingetcreate](https://github.com/microsoft/winget-create) y un token de GitHub (`public_repo`):

```powershell
winget install Microsoft.WingetCreate
wingetcreate submit --token <TOKEN> packaging/winget/manifests/s/sk8erlucas/AoE2Overlay/0.3.3
```

Esto abre un PR en `microsoft/winget-pkgs` desde un fork de tu cuenta. Los bots lo validan (incluye un escaneo antivirus) y un moderador lo aprueba.

## Versiones nuevas

Después de publicar cada release:

```powershell
wingetcreate update sk8erlucas.AoE2Overlay --version <X.Y.Z> --urls https://github.com/sk8erlucas/aoe2-overlay/releases/download/v<X.Y.Z>/AoE2.Overlay_<X.Y.Z>_x64-setup.exe --submit --token <TOKEN>
```

El hash del instalador sale de `SHA256SUMS.txt` del release, o de `Get-FileHash <archivo>`.

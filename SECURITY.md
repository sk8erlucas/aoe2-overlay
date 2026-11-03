# Seguridad

## Reportar una vulnerabilidad

No abras una issue pública. Usá **Report a vulnerability** en la pestaña [Security](https://github.com/sk8erlucas/aoe2-overlay/security) del repositorio. Respondemos lo antes posible.

## Secretos

Este repositorio es **público**. Nunca se commitean contraseñas, URLs de bases de datos con credenciales, tokens ni secretos de sesión.

- La configuración real vive en archivos `.env`, que están en `.gitignore`. En el repo solo hay `.env.example` con valores vacíos o de desarrollo local.
- El CI corre [gitleaks](https://github.com/gitleaks/gitleaks) sobre todo el historial en cada push y PR.
- GitHub tiene activados el _secret scanning_ y la _push protection_.
- Los logs de la API ocultan cookies y headers de autorización.

Si por error se sube un secreto, **hay que rotarlo** (cambiar la contraseña o regenerar el token): borrarlo del historial no alcanza, porque ya pudo haber sido copiado.

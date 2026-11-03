/** Solo redirige a rutas internas: evita redirecciones abiertas (`?next=https://otro.sitio`). */
export function safeNext(next: string | null | undefined): string {
  return next && next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\")
    ? next
    : "/estrategias";
}

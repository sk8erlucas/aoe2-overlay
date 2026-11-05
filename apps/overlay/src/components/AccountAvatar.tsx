import type { Account } from "../lib/account";

interface Props {
  account: Account | null;
  onClick: () => void;
}

/** Barra superior: inicial del usuario, o silueta punteada si no inició sesión. */
export function AccountAvatar({ account, onClick }: Props) {
  if (account) {
    return (
      <button
        className="avatar in"
        title={`Conectado como ${account.name}`}
        aria-label={`Cuenta: ${account.name}`}
        onClick={onClick}
      >
        {Array.from(account.name.trim())[0]?.toUpperCase() ?? "?"}
      </button>
    );
  }
  return (
    <button
      className="avatar out"
      title="Sin sesión: iniciar sesión o registrarse"
      aria-label="Iniciar sesión o registrarse"
      onClick={onClick}
    >
      <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
        <circle cx="8" cy="5" r="3" />
        <path d="M2.5 14.5c0-3 2.5-5 5.5-5s5.5 2 5.5 5z" />
      </svg>
    </button>
  );
}

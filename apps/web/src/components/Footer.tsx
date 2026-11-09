import Link from "next/link";
import { GITHUB_URL } from "@/lib/config";

export function Footer() {
  return (
    <footer className="grain border-t border-red/30 bg-cream">
      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 text-sm text-ink/70 md:flex-row md:justify-between">
        <div className="max-w-xl space-y-2">
          <p className="label text-xs text-red">AoE2 Overlay · Open source · MIT</p>
          <p>
            Age of Empires II © Microsoft Corporation. AoE2 Overlay fue creado según las{" "}
            <a
              className="underline"
              href="https://www.xbox.com/en-US/developers/rules"
              target="_blank"
              rel="noreferrer"
            >
              Game Content Usage Rules
            </a>{" "}
            de Microsoft usando assets de Age of Empires II, y no está respaldado ni afiliado con
            Microsoft.
          </p>
        </div>
        <nav className="flex flex-wrap gap-4 label text-xs">
          <Link href="/estrategias">Estrategias</Link>
          <Link href="/descargar">Descargar</Link>
          <Link href="/privacidad">Privacidad</Link>
          <a href={GITHUB_URL} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href={`${GITHUB_URL}/blob/main/SECURITY.md`} target="_blank" rel="noreferrer">
            Seguridad
          </a>
        </nav>
      </div>
    </footer>
  );
}

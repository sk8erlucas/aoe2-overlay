import Image from "next/image";
import Link from "next/link";
import { getMe } from "@/lib/server";
import { SignOutButton } from "./SignOutButton";

/** Barra superior de las páginas internas (la landing tiene su propia nav). */
export async function SiteHeader() {
  const me = await getMe();
  const staff = me?.role === "moderator" || me?.role === "admin";

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-cream/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-6">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="" width={30} height={30} />
          <span className="font-display text-xl tracking-wide text-red">AOE2 OVERLAY</span>
        </Link>
        <nav className="label flex flex-1 gap-5 text-sm">
          <Link href="/estrategias" className="hover:text-red">
            Estrategias
          </Link>
          <Link href="/estrategias/nueva" className="hover:text-red">
            Crear
          </Link>
          <Link href="/descargar" className="hover:text-red">
            Descargar
          </Link>
          {staff && (
            <Link href="/moderacion" className="hover:text-red">
              Moderación
            </Link>
          )}
        </nav>
        {me ? (
          <div className="flex items-center gap-3 text-sm">
            <Link href="/perfil" className="font-semibold hover:text-red">
              {me.name}
            </Link>
            <SignOutButton />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/ingresar" className="btn btn-ghost text-xs">
              Ingresar
            </Link>
            <Link href="/registro" className="btn btn-red text-xs">
              Crear cuenta
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}

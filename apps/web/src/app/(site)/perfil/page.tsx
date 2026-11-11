import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { DeleteAccount } from "@/components/DeleteAccount";
import { StrategyCard } from "@/components/StrategyCard";
import { getMe, serverApi } from "@/lib/server";
import type { StrategySummary } from "@/lib/types";

export const metadata: Metadata = { title: "Mi perfil" };

const ROLE_LABELS = { user: "Jugador", moderator: "Moderador", admin: "Administrador" };

export default async function ProfilePage() {
  const me = await getMe();
  if (!me) redirect("/ingresar?next=/perfil");

  const [mine, favs] = await Promise.all([
    serverApi<{ items: StrategySummary[] }>("/api/me/strategies"),
    serverApi<{ items: StrategySummary[] }>("/api/me/favorites"),
  ]);

  const grid = (items: StrategySummary[], empty: React.ReactNode) =>
    items.length === 0 ? (
      <p className="card p-6 text-sm text-ink/60">{empty}</p>
    ) : (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((s) => (
          <StrategyCard key={s.id} s={s} />
        ))}
      </div>
    );

  return (
    <div className="space-y-10">
      <header>
        <p className="label text-xs text-red">{ROLE_LABELS[me.role]}</p>
        <h1 className="font-display text-5xl tracking-wide uppercase">{me.name}</h1>
        <p className="text-sm text-ink/60">{me.email}</p>
      </header>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="label text-sm text-red">Mis estrategias · {mine.items.length}</h2>
          <Link className="btn btn-red text-xs" href="/estrategias/nueva">
            + Crear
          </Link>
        </div>
        {grid(mine.items, "Todavía no publicaste estrategias.")}
      </section>

      <section className="space-y-4">
        <h2 className="label text-sm text-red">Favoritas · {favs.items.length}</h2>
        {grid(
          favs.items,
          <>
            Marcá estrategias con ☆ para tenerlas a mano.{" "}
            <Link className="text-red underline" href="/estrategias">
              Explorar
            </Link>
          </>,
        )}
      </section>

      <section className="max-w-md">
        <DeleteAccount />
      </section>
    </div>
  );
}

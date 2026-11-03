import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ReportActions } from "@/components/ReportActions";
import { getMe, serverApi } from "@/lib/server";
import type { Report } from "@/lib/types";

export const metadata: Metadata = { title: "Moderación" };

export default async function ModerationPage() {
  const me = await getMe();
  if (!me) redirect("/ingresar?next=/moderacion");
  if (me.role !== "moderator" && me.role !== "admin") redirect("/");

  const { items } = await serverApi<{ items: Report[] }>("/api/reports?status=open");

  return (
    <div className="space-y-6">
      <h1 className="font-display text-5xl tracking-wide">MODERACIÓN</h1>
      <p className="text-sm text-ink/60">{items.length} reportes abiertos</p>
      {items.length === 0 ? (
        <p className="card p-6 text-ink/60">No hay reportes pendientes. 🎉</p>
      ) : (
        <ul className="space-y-3">
          {items.map((r) => (
            <li key={r.id} className="card space-y-3 p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <Link href={`/estrategias/${r.strategy.slug}`} className="font-bold hover:text-red">
                  {r.strategy.name}
                </Link>
                <span className="text-xs text-ink/50">
                  {new Date(r.createdAt).toLocaleString("es")} · {r.strategy.visibility}
                </span>
              </div>
              <p className="rounded bg-ink/5 p-3 text-sm">{r.reason}</p>
              <ReportActions id={r.id} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

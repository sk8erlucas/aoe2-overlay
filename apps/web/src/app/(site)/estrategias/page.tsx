import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { StrategyCard } from "@/components/StrategyCard";
import { StrategyFilters } from "@/components/StrategyFilters";
import { buildQuery, errorMessage } from "@/lib/api";
import { serverApi } from "@/lib/server";
import type { StrategyList } from "@/lib/types";

export const metadata: Metadata = { title: "Estrategias" };

const KEYS = ["civ", "map", "mapType", "position", "q", "sort", "page"] as const;

export default async function StrategiesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const raw = await searchParams;
  const query = Object.fromEntries(
    KEYS.map((k) => [k, typeof raw[k] === "string" ? raw[k] : undefined]),
  ) as Record<(typeof KEYS)[number], string | undefined>;

  let list: StrategyList | null = null;
  let error: string | null = null;
  try {
    list = await serverApi<StrategyList>(
      `/api/strategies${buildQuery({ ...query, pageSize: 24 })}`,
    );
  } catch (e) {
    error = errorMessage(e);
  }

  const page = list?.page ?? 1;
  const pages = list ? Math.max(1, Math.ceil(list.total / list.pageSize)) : 1;
  const pageHref = (n: number) =>
    `/estrategias${buildQuery({ ...query, page: n === 1 ? undefined : n })}`;

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label text-xs text-red">Comunidad</p>
          <h1 className="font-display text-5xl tracking-wide md:text-6xl">ESTRATEGIAS</h1>
        </div>
        <Link href="/estrategias/nueva" className="btn btn-red">
          + Crear estrategia
        </Link>
      </header>

      <Suspense>
        <StrategyFilters />
      </Suspense>

      {error && <p className="card p-4 text-red">{error}</p>}

      {list && (
        <>
          <p className="text-sm text-ink/60">
            {list.total} {list.total === 1 ? "estrategia" : "estrategias"}
          </p>
          {list.items.length === 0 ? (
            <p className="card p-8 text-center text-ink/60">
              No hay estrategias con esos filtros.{" "}
              <Link href="/estrategias/nueva" className="text-red underline">
                ¿Creás la primera?
              </Link>
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {list.items.map((s) => (
                <StrategyCard key={s.id} s={s} />
              ))}
            </div>
          )}
          {pages > 1 && (
            <nav className="flex items-center justify-center gap-3 text-sm">
              {page > 1 && (
                <Link className="btn btn-ghost text-xs" href={pageHref(page - 1)}>
                  ← Anterior
                </Link>
              )}
              <span>
                Página {page} de {pages}
              </span>
              {page < pages && (
                <Link className="btn btn-ghost text-xs" href={pageHref(page + 1)}>
                  Siguiente →
                </Link>
              )}
            </nav>
          )}
        </>
      )}
    </div>
  );
}

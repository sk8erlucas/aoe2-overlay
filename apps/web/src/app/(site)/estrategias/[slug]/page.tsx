import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StepTimeline } from "@/components/StepTimeline";
import { StrategyActions } from "@/components/StrategyActions";
import { ApiError } from "@/lib/api";
import {
  civLabel,
  DIFFICULTY_LABELS,
  MAP_TYPE_LABELS,
  mapLabel,
  POSITION_LABELS,
} from "@/lib/labels";
import { getMe, serverApi } from "@/lib/server";
import type { StrategyDetail } from "@/lib/types";

type Props = { params: Promise<{ slug: string }> };

async function load(slug: string) {
  try {
    return await serverApi<StrategyDetail>(`/api/strategies/${encodeURIComponent(slug)}`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const s = await load((await params).slug);
  return { title: s.name, description: s.description ?? undefined };
}

export default async function StrategyPage({ params }: Props) {
  const { slug } = await params;
  const [s, me] = await Promise.all([load(slug), getMe()]);
  const d = s.data;

  const facts: [string, string][] = [
    ["Civilización", civLabel(s.civilization)],
    ["Mapas", s.maps.map(mapLabel).join(", ") || "—"],
    ["Tipo de mapa", s.mapTypes.map((t) => MAP_TYPE_LABELS[t] ?? t).join(", ") || "Cualquiera"],
    ["Posición", s.positions.map((p) => POSITION_LABELS[p] ?? p).join(", ") || "Cualquiera"],
    ["Dificultad", s.difficulty ? (DIFFICULTY_LABELS[s.difficulty] ?? s.difficulty) : "—"],
    ["Rivales ideales", (d.vs_civilizations ?? []).length ? civLabel(d.vs_civilizations!) : "—"],
  ];

  return (
    <article className="grid gap-10 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <Link href="/estrategias" className="label text-xs text-ink/60 hover:text-red">
          ← Estrategias
        </Link>
        <header className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="label text-xs text-red">{civLabel(s.civilization)}</span>
            {s.verified && <span className="label text-xs text-gold-dark">✔ Verificada</span>}
            {s.visibility !== "public" && (
              <span className="label text-xs text-red">
                {s.visibility === "unlisted" ? "No listada" : "Oculta por moderación"}
              </span>
            )}
          </div>
          <h1 className="font-display text-4xl leading-none tracking-wide uppercase md:text-6xl">
            {s.name}
          </h1>
          {s.description && <p className="max-w-2xl text-ink/75">{s.description}</p>}
          <p className="text-sm text-ink/60">
            por <strong>{s.authorName}</strong>
            {s.author && s.author.name !== s.authorName && <> · subida por {s.author.name}</>}
            {d.source && (
              <>
                {" · "}
                <a className="underline" href={d.source} target="_blank" rel="noreferrer nofollow">
                  fuente original
                </a>
              </>
            )}
          </p>
          <StrategyActions s={s} loggedIn={!!me} />
        </header>

        <section>
          <h2 className="label mb-4 text-sm text-red">Pasos · {s.stepCount}</h2>
          <StepTimeline steps={d.build_order} />
          <p className="mt-4 text-xs text-ink/50">
            Los tiempos son estimados en tiempo de juego (un aldeano cada 25 s, más los avances de
            edad), igual que en el overlay.
          </p>
        </section>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <dl className="card divide-y divide-ink/10">
          {facts.map(([k, v]) => (
            <div key={k} className="px-4 py-3">
              <dt className="label text-xs text-ink/50">{k}</dt>
              <dd className="font-semibold">{v}</dd>
            </div>
          ))}
        </dl>
        {s.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {s.tags.map((t) => (
              <span key={t} className="rounded-full bg-ink/5 px-3 py-1 text-xs">
                #{t}
              </span>
            ))}
          </div>
        )}
        <div className="card space-y-2 p-4 text-sm">
          <p className="font-bold">¿Usarla en el juego?</p>
          <p className="text-ink/70">
            Exportá el JSON o abrí el overlay: las estrategias de la comunidad van a sincronizarse
            solas (próximamente).
          </p>
          <Link href="/descargar" className="btn btn-gold w-full text-xs">
            Descargar overlay
          </Link>
        </div>
      </aside>
    </article>
  );
}

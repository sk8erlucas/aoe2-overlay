import Link from "next/link";
import { civLabel, DIFFICULTY_LABELS, MAP_TYPE_LABELS, mapLabel } from "@/lib/labels";
import type { StrategySummary } from "@/lib/types";

export function StrategyCard({ s }: { s: StrategySummary }) {
  const where = s.maps.length
    ? s.maps.slice(0, 3).map(mapLabel).join(", ")
    : s.mapTypes.map((t) => MAP_TYPE_LABELS[t] ?? t).join(", ") || "Cualquier mapa";

  return (
    <Link
      href={`/estrategias/${s.slug}`}
      className="card group flex flex-col gap-3 p-5 transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg leading-tight font-extrabold group-hover:text-red">{s.name}</h3>
        <span
          className={`label shrink-0 rounded-full px-2 py-0.5 text-xs ${
            s.score > 0 ? "bg-gold/30" : s.score < 0 ? "bg-red/10 text-red" : "bg-ink/5"
          }`}
          title="Votos"
        >
          ▲ {s.score}
        </span>
      </div>
      <p className="label text-xs text-red">{civLabel(s.civilization)}</p>
      {s.description && <p className="line-clamp-2 text-sm text-ink/70">{s.description}</p>}
      <div className="mt-auto flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink/60">
        <span>🗺 {where}</span>
        <span>{s.stepCount} pasos</span>
        {s.difficulty && <span>{DIFFICULTY_LABELS[s.difficulty] ?? s.difficulty}</span>}
        {s.verified && <span className="font-bold text-gold-dark">✔ Verificada</span>}
        {s.visibility !== "public" && (
          <span className="font-bold text-red">
            {s.visibility === "unlisted" ? "No listada" : "Oculta"}
          </span>
        )}
      </div>
      <p className="text-xs text-ink/50">
        por {s.authorName}
        {s.author && s.author.name !== s.authorName ? ` · subida por ${s.author.name}` : ""}
      </p>
    </Link>
  );
}

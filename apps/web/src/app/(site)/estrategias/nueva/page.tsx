import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { StrategyEditor } from "@/components/editor/StrategyEditor";
import { getMe, serverApi } from "@/lib/server";
import type { StrategyDetail } from "@/lib/types";

export const metadata: Metadata = { title: "Crear estrategia" };

type Props = { searchParams: Promise<{ "basada-en"?: string }> };

/** `/estrategias/nueva?basada-en=<slug>` arranca con una copia de esa estrategia (fork). */
export default async function NewStrategyPage({ searchParams }: Props) {
  const base = (await searchParams)["basada-en"];
  const me = await getMe();
  if (!me) {
    const next = base
      ? `/estrategias/nueva?basada-en=${encodeURIComponent(base)}`
      : "/estrategias/nueva";
    redirect(`/ingresar?next=${encodeURIComponent(next)}`);
  }
  const basedOn = base
    ? await serverApi<StrategyDetail>(`/api/strategies/${encodeURIComponent(base)}`).catch(
        () => undefined,
      )
    : undefined;
  return (
    <div className="space-y-6">
      <h1 className="font-display text-5xl tracking-wide">
        {basedOn ? "NUEVA VARIANTE" : "NUEVA ESTRATEGIA"}
      </h1>
      {basedOn && (
        <p className="text-sm text-ink/70">
          Basada en <strong>{basedOn.name}</strong>. La original sigue igual; esta se publica a tu
          nombre y muestra el link a la original.
        </p>
      )}
      <StrategyEditor authorName={me.name} basedOn={basedOn} />
    </div>
  );
}

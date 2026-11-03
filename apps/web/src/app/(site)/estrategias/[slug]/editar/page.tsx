import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { StrategyEditor } from "@/components/editor/StrategyEditor";
import { ApiError } from "@/lib/api";
import { getMe, serverApi } from "@/lib/server";
import type { StrategyDetail } from "@/lib/types";

export const metadata: Metadata = { title: "Editar estrategia" };

export default async function EditStrategyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const me = await getMe();
  if (!me) redirect(`/ingresar?next=/estrategias/${slug}/editar`);

  let s: StrategyDetail;
  try {
    s = await serverApi<StrategyDetail>(`/api/strategies/${encodeURIComponent(slug)}`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  }
  if (!s.canEdit) redirect(`/estrategias/${slug}`);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-5xl tracking-wide">EDITAR</h1>
      <StrategyEditor existing={s} authorName={me.name} />
    </div>
  );
}

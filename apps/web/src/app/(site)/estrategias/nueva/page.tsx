import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { StrategyEditor } from "@/components/editor/StrategyEditor";
import { getMe } from "@/lib/server";

export const metadata: Metadata = { title: "Crear estrategia" };

export default async function NewStrategyPage() {
  const me = await getMe();
  if (!me) redirect("/ingresar?next=/estrategias/nueva");
  return (
    <div className="space-y-6">
      <h1 className="font-display text-5xl tracking-wide">NUEVA ESTRATEGIA</h1>
      <StrategyEditor authorName={me.name} />
    </div>
  );
}

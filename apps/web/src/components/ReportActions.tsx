"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { api, errorMessage } from "@/lib/api";

export function ReportActions({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolve = async (status: "resolved" | "dismissed", hideStrategy: boolean) => {
    setBusy(true);
    setError(null);
    try {
      await api(`/api/reports/${id}`, { method: "PATCH", body: { status, hideStrategy } });
      router.refresh();
    } catch (e) {
      setError(errorMessage(e));
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        className="btn btn-red text-xs"
        disabled={busy}
        onClick={() => resolve("resolved", true)}
      >
        Ocultar estrategia
      </button>
      <button
        className="btn btn-ghost text-xs"
        disabled={busy}
        onClick={() => resolve("resolved", false)}
      >
        Resolver sin ocultar
      </button>
      <button
        className="btn btn-ghost text-xs"
        disabled={busy}
        onClick={() => resolve("dismissed", false)}
      >
        Descartar
      </button>
      {error && <span className="text-xs text-red">{error}</span>}
    </div>
  );
}

"use client";

import { api } from "@/lib/api";

export function SignOutButton() {
  return (
    <button
      className="btn btn-ghost text-xs"
      onClick={async () => {
        await api("/api/auth/sign-out", { method: "POST", body: {} }).catch(() => {});
        window.location.assign("/");
      }}
    >
      Salir
    </button>
  );
}

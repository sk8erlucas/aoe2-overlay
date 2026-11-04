import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DeviceApproval } from "@/components/DeviceApproval";
import { getMe } from "@/lib/server";

export const metadata: Metadata = { title: "Conectar el overlay" };

interface Props {
  searchParams: Promise<{ user_code?: string }>;
}

/** Paso del login del overlay: el usuario confirma el código que le muestra la app. */
export default async function DevicePage({ searchParams }: Props) {
  const { user_code: code = "" } = await searchParams;
  const me = await getMe();
  if (!me) {
    const here = `/dispositivo${code ? `?user_code=${encodeURIComponent(code)}` : ""}`;
    redirect(`/ingresar?next=${encodeURIComponent(here)}`);
  }
  return <DeviceApproval initialCode={code} userName={me.name} />;
}

import type { MetadataRoute } from "next";
import { api } from "@/lib/api";
import { SITE_URL } from "@/lib/config";
import type { StrategySummary } from "@/lib/types";

// Se regenera cada hora; si la API no responde (por ejemplo, durante el build), quedan las
// páginas fijas y se reintenta en la próxima regeneración.
export const revalidate = 3600;

const PAGE_SIZE = 50;
const MAX_PAGES = 20;

async function publicStrategies(): Promise<StrategySummary[]> {
  const all: StrategySummary[] = [];
  try {
    for (let page = 1; page <= MAX_PAGES; page++) {
      const res = await api<{ items: StrategySummary[]; total: number }>(
        `/api/strategies?page=${page}&pageSize=${PAGE_SIZE}&sort=new`,
        { next: { revalidate } },
      );
      all.push(...res.items);
      if (res.items.length < PAGE_SIZE || all.length >= res.total) break;
    }
  } catch {
    // Sin API: solo las páginas fijas.
  }
  return all;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const fixed: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/estrategias`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/descargar`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/privacidad`, changeFrequency: "yearly", priority: 0.2 },
  ];
  const strategies = (await publicStrategies()).map((s) => ({
    url: `${SITE_URL}/estrategias/${s.slug}`,
    lastModified: s.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));
  return [...fixed, ...strategies];
}

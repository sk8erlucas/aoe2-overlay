import { describe, expect, it } from "vitest";
import {
  mergeStrategies,
  normalizeApiUrl,
  syncStrategies,
  type StrategyCache,
} from "../src/lib/sync";

const remoteStrategy = {
  name: "Elefantes malayos",
  civilization: "Malay",
  author: "comunidad",
  build_order: [
    {
      villager_count: 6,
      age: 1,
      resources: { wood: 0, food: 6, gold: 0, stone: 0 },
      notes: ["6 a las ovejas"],
    },
  ],
};

const item = (slug: string, data: unknown = remoteStrategy, score = 3) => ({
  slug,
  score,
  verified: false,
  updatedAt: "2026-11-01T00:00:00.000Z",
  data,
});

function fakeFetch(status: number, body?: unknown, etag = '"e1"') {
  const calls: { url: string; headers: Record<string, string> }[] = [];
  const impl = (async (url: string, init?: RequestInit) => {
    calls.push({ url, headers: (init?.headers ?? {}) as Record<string, string> });
    return new Response(status === 304 ? null : JSON.stringify(body), {
      status,
      headers: { etag },
    });
  }) as unknown as typeof fetch;
  return { impl, calls };
}

describe("mergeStrategies", () => {
  it("incluye las base y agrega las descargadas", () => {
    const all = mergeStrategies([item("elefantes-abc")]);
    expect(all.find((s) => s.id === "elefantes-abc")?.origin).toBe("remote");
    expect(all.find((s) => s.id === "fast-castle-boom")?.origin).toBe("bundled");
  });

  it("la descargada reemplaza a la base con el mismo id (trae votos)", () => {
    const all = mergeStrategies([item("fast-castle-boom", remoteStrategy, 42)]);
    const fc = all.filter((s) => s.id === "fast-castle-boom");
    expect(fc).toHaveLength(1);
    expect(fc[0]?.score).toBe(42);
  });

  it("ignora estrategias inválidas", () => {
    const all = mergeStrategies([item("rota", { name: "x" })]);
    expect(all.some((s) => s.id === "rota")).toBe(false);
  });
});

describe("syncStrategies", () => {
  it("descarga y guarda el ETag", async () => {
    const { impl, calls } = fakeFetch(200, { items: [item("a")] });
    const cache = await syncStrategies("https://api.test/", null, impl);
    expect(calls[0]?.url).toBe("https://api.test/api/overlay/strategies");
    expect(cache.etag).toBe('"e1"');
    expect(cache.items).toHaveLength(1);
  });

  it("con 304 conserva la caché", async () => {
    const prev: StrategyCache = {
      apiUrl: "https://api.test",
      etag: '"e1"',
      syncedAt: "2026-01-01T00:00:00.000Z",
      items: [item("a")],
    };
    const { impl, calls } = fakeFetch(304);
    const cache = await syncStrategies("https://api.test", prev, impl);
    expect(calls[0]?.headers["if-none-match"]).toBe('"e1"');
    expect(cache.items).toHaveLength(1);
    expect(cache.syncedAt).not.toBe(prev.syncedAt);
  });

  it("si cambió la URL de la API no manda el ETag viejo", async () => {
    const prev: StrategyCache = { apiUrl: "https://vieja", etag: '"e1"', syncedAt: "", items: [] };
    const { impl, calls } = fakeFetch(200, { items: [] });
    await syncStrategies("https://nueva", prev, impl);
    expect(calls[0]?.headers["if-none-match"]).toBeUndefined();
  });

  it("falla si la API responde error", async () => {
    const { impl } = fakeFetch(500, {});
    await expect(syncStrategies("https://api.test", null, impl)).rejects.toThrow("500");
  });

  it("normaliza la URL", () => {
    expect(normalizeApiUrl(" https://api.test/// ")).toBe("https://api.test");
  });
});

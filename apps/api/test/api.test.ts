import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createTestApp, ORIGIN, sampleStrategy, type TestApp } from "./helpers";

let t: TestApp;
let alice: string; // cookie
let bob: string;

beforeAll(async () => {
  t = await createTestApp();
  alice = await t.signUp("Alice");
  bob = await t.signUp("Bob");
});
afterAll(() => t.close());

const json = <T = Record<string, unknown>>(res: { body: string }) => JSON.parse(res.body) as T;

describe("sistema", () => {
  it("health", async () => {
    const res = await t.app.inject("/api/health");
    expect(res.statusCode).toBe(200);
    expect(json(res)).toEqual({ ok: true, db: true });
  });

  it("game-data", async () => {
    const body = json<{ civs: unknown[]; maps: unknown[] }>(await t.app.inject("/api/game-data"));
    expect(body.civs.length).toBeGreaterThan(40);
    expect(body.maps.length).toBeGreaterThan(20);
  });

  it("documentación OpenAPI", async () => {
    const res = await t.app.inject("/api/docs/json");
    expect(res.statusCode).toBe(200);
    expect(json<{ paths: object }>(res).paths).toHaveProperty("/api/strategies");
  });
});

describe("auth", () => {
  it("/api/me con y sin sesión", async () => {
    expect((await t.app.inject("/api/me")).statusCode).toBe(401);
    const res = await t.app.inject({ url: "/api/me", headers: { cookie: alice } });
    expect(json(res)).toMatchObject({ name: "Alice", role: "user" });
  });

  it("no se puede elegir el rol al registrarse", async () => {
    // Better Auth acepta el registro pero ignora el campo `role` (input: false).
    const cookie = await t.signUp("Mallory", "mallory@test.dev", { role: "admin" });
    const me = json(await t.app.inject({ url: "/api/me", headers: { cookie } }));
    expect(me.role).toBe("user");
  });

  it("rechaza contraseñas cortas", async () => {
    const res = await t.app.inject({
      method: "POST",
      url: "/api/auth/sign-up/email",
      headers: { origin: ORIGIN },
      payload: { name: "X", email: "x@test.dev", password: "123" },
    });
    expect(res.statusCode).toBe(400);
  });
});

describe("listado", () => {
  it("incluye las 5 estrategias base verificadas", async () => {
    const body = json<{ items: { verified: boolean }[]; total: number }>(
      await t.app.inject("/api/strategies"),
    );
    expect(body.total).toBe(5);
    expect(body.items.every((s) => s.verified)).toBe(true);
  });

  it("filtra por tipo de mapa", async () => {
    const body = json<{ items: { slug: string }[] }>(
      await t.app.inject("/api/strategies?mapType=closed"),
    );
    expect(body.items.map((s) => s.slug)).toEqual(["fast-castle-boom"]);
  });

  it("las genéricas aparecen al filtrar por civ", async () => {
    const body = json<{ total: number }>(await t.app.inject("/api/strategies?civ=Malay"));
    expect(body.total).toBe(5);
  });

  it("busca por nombre y pagina", async () => {
    const byName = json<{ items: { slug: string }[] }>(
      await t.app.inject("/api/strategies?q=arqueros"),
    );
    expect(byName.items.map((s) => s.slug).sort()).toEqual([
      "archers-feudal",
      "men-at-arms-archers",
    ]);
    const page = json<{ items: unknown[]; total: number }>(
      await t.app.inject("/api/strategies?pageSize=2&page=3"),
    );
    expect(page.items).toHaveLength(1);
  });

  it("rechaza parámetros inválidos", async () => {
    expect((await t.app.inject("/api/strategies?mapType=lava")).statusCode).toBe(400);
  });
});

describe("crear, editar y borrar", () => {
  let id: string;
  let slug: string;

  it("requiere sesión", async () => {
    const res = await t.app.inject({
      method: "POST",
      url: "/api/strategies",
      payload: sampleStrategy,
    });
    expect(res.statusCode).toBe(401);
  });

  it("valida el formato", async () => {
    const res = await t.app.inject({
      method: "POST",
      url: "/api/strategies",
      headers: { cookie: alice },
      payload: { ...sampleStrategy, build_order: [] },
    });
    expect(res.statusCode).toBe(400);
  });

  it("crea", async () => {
    const res = await t.app.inject({
      method: "POST",
      url: "/api/strategies",
      headers: { cookie: alice },
      payload: sampleStrategy,
    });
    expect(res.statusCode).toBe(201);
    const body = json<{ id: string; slug: string; canEdit: boolean; author: { name: string } }>(
      res,
    );
    expect(body.slug).toMatch(/^elefantes-malayos-[a-z0-9]+$/);
    expect(body.canEdit).toBe(true);
    expect(body.author.name).toBe("Alice");
    id = body.id;
    slug = body.slug;
  });

  it("detalle público, sin permiso de edición para otros", async () => {
    const res = await t.app.inject({ url: `/api/strategies/${slug}`, headers: { cookie: bob } });
    expect(json(res)).toMatchObject({ canEdit: false, myVote: 0, isFavorite: false });
  });

  it("otro usuario no puede editar ni borrar", async () => {
    const put = await t.app.inject({
      method: "PUT",
      url: `/api/strategies/${id}`,
      headers: { cookie: bob },
      payload: sampleStrategy,
    });
    expect(put.statusCode).toBe(403);
    const del = await t.app.inject({
      method: "DELETE",
      url: `/api/strategies/${id}`,
      headers: { cookie: bob },
    });
    expect(del.statusCode).toBe(403);
  });

  it("el autor edita y las columnas de búsqueda se actualizan", async () => {
    const res = await t.app.inject({
      method: "PUT",
      url: `/api/strategies/${id}`,
      headers: { cookie: alice },
      payload: { ...sampleStrategy, name: "Elefantes v2", map_types: ["open"] },
    });
    expect(res.statusCode).toBe(200);
    expect(json(res)).toMatchObject({ name: "Elefantes v2", mapTypes: ["open"] });
  });

  it("no listada: no aparece en el listado pero se puede abrir por link", async () => {
    await t.app.inject({
      method: "PUT",
      url: `/api/strategies/${id}`,
      headers: { cookie: alice },
      payload: { ...sampleStrategy, visibility: "unlisted" },
    });
    const list = json<{ total: number }>(await t.app.inject("/api/strategies"));
    expect(list.total).toBe(5);
    expect((await t.app.inject(`/api/strategies/${slug}`)).statusCode).toBe(200);
  });

  it("el autor borra", async () => {
    const res = await t.app.inject({
      method: "DELETE",
      url: `/api/strategies/${id}`,
      headers: { cookie: alice },
    });
    expect(res.statusCode).toBe(204);
    expect((await t.app.inject(`/api/strategies/${slug}`)).statusCode).toBe(404);
  });
});

describe("votos y favoritos", () => {
  let id: string;

  beforeAll(async () => {
    const detail = json<{ id: string }>(await t.app.inject("/api/strategies/scouts-feudal"));
    id = detail.id;
  });

  const vote = (cookie: string, value: number) =>
    t.app.inject({
      method: "POST",
      url: `/api/strategies/${id}/vote`,
      headers: { cookie },
      payload: { value },
    });

  it("suma, cambia y quita votos", async () => {
    expect(json(await vote(alice, 1))).toEqual({ score: 1, myVote: 1 });
    expect(json(await vote(alice, 1))).toEqual({ score: 1, myVote: 1 }); // no duplica
    expect(json(await vote(bob, 1))).toEqual({ score: 2, myVote: 1 });
    expect(json(await vote(alice, -1))).toEqual({ score: 0, myVote: -1 });
    expect(json(await vote(alice, 0))).toEqual({ score: 1, myVote: 0 });
  });

  it("rechaza valores inválidos y sin sesión", async () => {
    expect((await vote(alice, 5)).statusCode).toBe(400);
    const res = await t.app.inject({
      method: "POST",
      url: `/api/strategies/${id}/vote`,
      payload: { value: 1 },
    });
    expect(res.statusCode).toBe(401);
  });

  it("el más votado sale primero en 'top'", async () => {
    const body = json<{ items: { slug: string }[] }>(await t.app.inject("/api/strategies"));
    expect(body.items[0]?.slug).toBe("scouts-feudal");
  });

  it("favoritos", async () => {
    await t.app.inject({
      method: "POST",
      url: `/api/strategies/${id}/favorite`,
      headers: { cookie: bob },
      payload: { favorite: true },
    });
    const favs = json<{ items: { slug: string }[] }>(
      await t.app.inject({ url: "/api/me/favorites", headers: { cookie: bob } }),
    );
    expect(favs.items.map((s) => s.slug)).toEqual(["scouts-feudal"]);
    const detail = json(
      await t.app.inject({ url: "/api/strategies/scouts-feudal", headers: { cookie: bob } }),
    );
    expect(detail).toMatchObject({ isFavorite: true, myVote: 1 });
  });
});

describe("sugerencias", () => {
  it("prioriza la estrategia de la civ y el mapa", async () => {
    await t.app.inject({
      method: "POST",
      url: "/api/strategies",
      headers: { cookie: alice },
      payload: sampleStrategy,
    });
    const body = json<{ items: { strategy: { name: string }; reasons: string[] }[] }>(
      await t.app.inject("/api/suggestions?civ=Malay&map=black_forest&vsCiv=Britons"),
    );
    expect(body.items[0]?.strategy.name).toBe("Elefantes malayos");
    expect(body.items[0]?.reasons).toEqual(expect.arrayContaining(["civ", "mapa"]));
    // Las de mapa abierto quedan afuera en Selva Negra.
    expect(body.items.map((i) => i.strategy.name)).not.toContain("Arqueros en Feudal");
  });

  it("descarta las de otra civ", async () => {
    const body = json<{ items: { strategy: { name: string } }[] }>(
      await t.app.inject("/api/suggestions?civ=Britons"),
    );
    expect(body.items.map((i) => i.strategy.name)).not.toContain("Elefantes malayos");
  });
});

describe("moderación", () => {
  let strategyId: string;
  let reportId: string;

  beforeAll(async () => {
    const created = json<{ id: string }>(
      await t.app.inject({
        method: "POST",
        url: "/api/strategies",
        headers: { cookie: alice },
        payload: { ...sampleStrategy, name: "Spam" },
      }),
    );
    strategyId = created.id;
  });

  it("reportar", async () => {
    const res = await t.app.inject({
      method: "POST",
      url: `/api/strategies/${strategyId}/report`,
      headers: { cookie: bob },
      payload: { reason: "Es spam" },
    });
    expect(res.statusCode).toBe(201);
    reportId = json<{ id: string }>(res).id;
  });

  it("un usuario común no ve los reportes", async () => {
    const res = await t.app.inject({ url: "/api/reports", headers: { cookie: bob } });
    expect(res.statusCode).toBe(403);
  });

  it("un moderador resuelve y oculta la estrategia", async () => {
    await t.setRole("bob@test.dev", "moderator");
    const list = json<{ items: { id: string }[] }>(
      await t.app.inject({ url: "/api/reports", headers: { cookie: bob } }),
    );
    expect(list.items.map((r) => r.id)).toContain(reportId);

    const res = await t.app.inject({
      method: "PATCH",
      url: `/api/reports/${reportId}`,
      headers: { cookie: bob },
      payload: { status: "resolved", hideStrategy: true },
    });
    expect(json(res)).toEqual({ id: reportId, status: "resolved" });

    const all = json<{ items: { name: string }[] }>(
      await t.app.inject("/api/strategies?pageSize=50"),
    );
    expect(all.items.map((s) => s.name)).not.toContain("Spam");
  });

  it("el autor no puede volver a publicar una estrategia oculta por moderación", async () => {
    const mine = json<{ items: { id: string; slug: string }[] }>(
      await t.app.inject({ url: "/api/me/strategies", headers: { cookie: alice } }),
    );
    const spam = mine.items.find((s) => s.id === strategyId)!;
    const res = await t.app.inject({
      method: "PUT",
      url: `/api/strategies/${strategyId}`,
      headers: { cookie: alice },
      payload: { ...sampleStrategy, name: "Spam", visibility: "public" },
    });
    expect(json(res)).toMatchObject({ visibility: "hidden" });
    // Los demás ya no la ven.
    const anon = await t.app.inject(`/api/strategies/${spam.slug}`);
    expect(anon.statusCode).toBe(404);
  });
});

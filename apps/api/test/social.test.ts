import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { createTestApp, sampleStrategy, type TestApp } from "./helpers";

let t: TestApp;
let alice: string;
let bob: string;
let strategy: { id: string; slug: string };

const json = <T = Record<string, unknown>>(res: { body: string }) => JSON.parse(res.body) as T;

beforeAll(async () => {
  t = await createTestApp({ seed: false });
  alice = await t.signUp("Alice");
  bob = await t.signUp("Bob");
  const res = await t.app.inject({
    method: "POST",
    url: "/api/strategies",
    headers: { cookie: alice },
    payload: sampleStrategy,
  });
  strategy = json(res);
});
afterAll(() => t.close());

describe("forks", () => {
  it("una copia guarda en qué estrategia se basa", async () => {
    const res = await t.app.inject({
      method: "POST",
      url: "/api/strategies",
      headers: { cookie: bob },
      payload: { ...sampleStrategy, name: "Elefantes malayos (Bob)", basedOnId: strategy.id },
    });
    expect(res.statusCode).toBe(201);
    expect(json(res).basedOn).toEqual({ slug: strategy.slug, name: sampleStrategy.name });
  });

  it("no se puede basar en una que no existe", async () => {
    const res = await t.app.inject({
      method: "POST",
      url: "/api/strategies",
      headers: { cookie: bob },
      payload: { ...sampleStrategy, basedOnId: "00000000-0000-4000-8000-000000000000" },
    });
    expect(res.statusCode).toBe(404);
  });
});

describe("resultados", () => {
  it("requiere sesión", async () => {
    const res = await t.app.inject({
      method: "POST",
      url: `/api/strategies/${strategy.id}/results`,
      payload: { won: true },
    });
    expect(res.statusCode).toBe(401);
  });

  it("cuenta partidas y victorias, sin duplicar la misma partida", async () => {
    const post = (cookie: string, payload: object) =>
      t.app.inject({
        method: "POST",
        url: `/api/strategies/slug/${strategy.slug}/results`,
        headers: { cookie },
        payload,
      });
    expect(json(await post(alice, { won: true, matchId: "123" }))).toEqual({ games: 1, wins: 1 });
    // La misma partida otra vez (ahora como derrota): se corrige, no se suma.
    expect(json(await post(alice, { won: false, matchId: "123" }))).toEqual({ games: 1, wins: 0 });
    expect(json(await post(bob, { won: true, matchId: "123" }))).toEqual({ games: 2, wins: 1 });
    expect(json(await post(bob, { won: true }))).toEqual({ games: 3, wins: 2 });

    const detail = json(await t.app.inject(`/api/strategies/${strategy.slug}`));
    expect(detail).toMatchObject({ games: 3, wins: 2 });
  });
});

describe("comentarios", () => {
  let commentId: string;

  it("comentar requiere sesión y valida el texto", async () => {
    const url = `/api/strategies/${strategy.id}/comments`;
    expect(
      (await t.app.inject({ method: "POST", url, payload: { body: "hola" } })).statusCode,
    ).toBe(401);
    const empty = await t.app.inject({
      method: "POST",
      url,
      headers: { cookie: bob },
      payload: { body: "  " },
    });
    expect(empty.statusCode).toBe(400);
  });

  it("se listan con el autor y solo él (o un moderador) los borra", async () => {
    const url = `/api/strategies/${strategy.id}/comments`;
    const res = await t.app.inject({
      method: "POST",
      url,
      headers: { cookie: bob },
      payload: { body: "¿Funciona contra arqueros?" },
    });
    expect(res.statusCode).toBe(201);
    commentId = json<{ id: string }>(res).id;

    const list = json<{ items: { body: string; author: { name: string }; canDelete: boolean }[] }>(
      await t.app.inject({ url, headers: { cookie: alice } }),
    );
    expect(list.items).toHaveLength(1);
    expect(list.items[0]).toMatchObject({
      body: "¿Funciona contra arqueros?",
      author: { name: "Bob" },
      canDelete: false,
    });

    const forbidden = await t.app.inject({
      method: "DELETE",
      url: `/api/comments/${commentId}`,
      headers: { cookie: alice },
    });
    expect(forbidden.statusCode).toBe(403);
    const ok = await t.app.inject({
      method: "DELETE",
      url: `/api/comments/${commentId}`,
      headers: { cookie: bob },
    });
    expect(ok.statusCode).toBe(204);
  });
});

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { ANONYMOUS_AUTHOR } from "../src/db/delete-account";
import { createTestApp, ORIGIN, sampleStrategy, type TestApp } from "./helpers";

const PASSWORD = "contraseña-segura-123";
let t: TestApp;

beforeAll(async () => {
  t = await createTestApp({ seed: false });
});
afterAll(() => t.close());

const json = <T = Record<string, unknown>>(res: { body: string }) => JSON.parse(res.body) as T;

async function create(cookie: string, author: string, name: string) {
  const res = await t.app.inject({
    method: "POST",
    url: "/api/strategies",
    headers: { cookie },
    payload: { ...sampleStrategy, name, author },
  });
  expect(res.statusCode).toBe(201);
  return json<{ id: string; slug: string }>(res);
}

const deleteAccount = (cookie: string, password: string) =>
  t.app.inject({
    method: "POST",
    url: "/api/auth/delete-user",
    headers: { cookie, origin: ORIGIN },
    payload: { password },
  });

describe("eliminar la cuenta", () => {
  it("pide la contraseña correcta", async () => {
    const carla = await t.signUp("Carla");
    expect((await deleteAccount(carla, "otra-contraseña-999")).statusCode).toBe(400);
    expect((await t.app.inject({ url: "/api/me", headers: { cookie: carla } })).statusCode).toBe(
      200,
    );
  });

  it("deja las estrategias sin autor y recalcula los votos", async () => {
    const dana = await t.signUp("Dana");
    const eve = await t.signUp("Eve");
    const own = await create(dana, "Dana", "Propia de Dana");
    const credited = await create(dana, "Hera", "Build de Hera");
    const evesBuild = await create(eve, "Eve", "La de Eve");

    for (const id of [evesBuild.id, own.id]) {
      await t.app.inject({
        method: "POST",
        url: `/api/strategies/${id}/vote`,
        headers: { cookie: dana },
        payload: { value: 1 },
      });
    }

    const res = await deleteAccount(dana, PASSWORD);
    expect(res.statusCode).toBe(200);

    // La sesión ya no sirve.
    expect((await t.app.inject({ url: "/api/me", headers: { cookie: dana } })).statusCode).toBe(
      401,
    );

    const detail = async (slug: string) =>
      json<{ author: unknown; authorName: string; score: number }>(
        await t.app.inject(`/api/strategies/${slug}`),
      );

    const ownAfter = await detail(own.slug);
    expect(ownAfter.author).toBeNull();
    expect(ownAfter.authorName).toBe(ANONYMOUS_AUTHOR);
    expect(ownAfter.score).toBe(0);

    // Si acreditaba a otra persona, el crédito se respeta.
    const creditedAfter = await detail(credited.slug);
    expect(creditedAfter.author).toBeNull();
    expect(creditedAfter.authorName).toBe("Hera");

    // El voto que había dado a otra estrategia se descuenta.
    expect((await detail(evesBuild.slug)).score).toBe(0);
  });
});

import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { OVERLAY_CLIENT_ID } from "../src/auth";
import { createTestApp, ORIGIN, type TestApp } from "./helpers";

let t: TestApp;
let carla: string; // cookie de la web

beforeAll(async () => {
  t = await createTestApp();
  vi.useFakeTimers({ toFake: ["Date"] });
  carla = await t.signUp("Carla");
});
afterAll(async () => {
  vi.useRealTimers();
  await t.close();
});

const json = <T = Record<string, unknown>>(res: { body: string }) => JSON.parse(res.body) as T;

/** Lo que hace el overlay: pedir un código (sin cookies, desde su propio origen). */
const requestCode = (clientId = OVERLAY_CLIENT_ID) =>
  t.app.inject({
    method: "POST",
    url: "/api/auth/device/code",
    headers: { origin: "http://tauri.localhost" },
    payload: { client_id: clientId },
  });

/** El overlay consulta cada 5 s; en el test se adelanta el reloj en vez de esperar. */
const pollToken = (deviceCode: string) => {
  vi.setSystemTime(Date.now() + 6_000);
  return t.app.inject({
    method: "POST",
    url: "/api/auth/device/token",
    headers: { origin: "http://tauri.localhost" },
    payload: {
      grant_type: "urn:ietf:params:oauth:grant-type:device_code",
      device_code: deviceCode,
      client_id: OVERLAY_CLIENT_ID,
    },
  });
};

describe("login del overlay (device code)", () => {
  it("rechaza clientes desconocidos", async () => {
    expect((await requestCode("otra-app")).statusCode).toBe(400);
  });

  it("código → aprobación en la web → token Bearer → favoritas", async () => {
    const code = json<{
      device_code: string;
      user_code: string;
      verification_uri: string;
      verification_uri_complete: string;
    }>(await requestCode());
    expect(code.verification_uri).toBe(`${ORIGIN}/dispositivo`);
    expect(code.verification_uri_complete).toContain(code.user_code);

    // Antes de aprobar: pendiente.
    const pending = await pollToken(code.device_code);
    expect(pending.statusCode).toBe(400);
    expect(json(pending).error).toBe("authorization_pending");

    // La web (logueada) reclama el código y lo aprueba.
    const verify = await t.app.inject({
      url: `/api/auth/device?user_code=${code.user_code}`,
      headers: { cookie: carla },
    });
    expect(json(verify).status).toBe("pending");
    const approve = await t.app.inject({
      method: "POST",
      url: "/api/auth/device/approve",
      headers: { cookie: carla, origin: ORIGIN },
      payload: { userCode: code.user_code },
    });
    expect(approve.statusCode).toBe(200);

    const token = await pollToken(code.device_code);
    expect(token.statusCode).toBe(200);
    const { access_token } = json<{ access_token: string }>(token);
    const bearer = { authorization: `Bearer ${access_token}` };

    const me = json<{ name: string }>(await t.app.inject({ url: "/api/me", headers: bearer }));
    expect(me.name).toBe("Carla");

    // Con el token se pueden marcar y leer favoritas.
    const s = json<{ id: string }>(await t.app.inject("/api/strategies/scouts-feudal"));
    await t.app.inject({
      method: "POST",
      url: `/api/strategies/${s.id}/favorite`,
      headers: bearer,
      payload: { favorite: true },
    });
    const favs = json<{ items: { slug: string }[] }>(
      await t.app.inject({ url: "/api/me/favorites", headers: bearer }),
    );
    expect(favs.items.map((f) => f.slug)).toEqual(["scouts-feudal"]);

    // El overlay usa el slug: quitar y volver a poner, y 404 si no existe.
    const bySlug = (slug: string, favorite: boolean) =>
      t.app.inject({
        method: "POST",
        url: `/api/strategies/slug/${slug}/favorite`,
        headers: bearer,
        payload: { favorite },
      });
    expect(json(await bySlug("scouts-feudal", false)).isFavorite).toBe(false);
    const empty = json<{ items: unknown[] }>(
      await t.app.inject({ url: "/api/me/favorites", headers: bearer }),
    );
    expect(empty.items).toEqual([]);
    expect((await bySlug("no-existe", true)).statusCode).toBe(404);

    // El código no se puede usar dos veces.
    expect((await pollToken(code.device_code)).statusCode).toBe(400);
  });

  it("marcar favorita por slug pide sesión", async () => {
    const res = await t.app.inject({
      method: "POST",
      url: "/api/strategies/slug/scouts-feudal/favorite",
      payload: { favorite: true },
    });
    expect(res.statusCode).toBe(401);
  });

  it("un token inventado no da acceso", async () => {
    const res = await t.app.inject({
      url: "/api/me",
      headers: { authorization: "Bearer inventado" },
    });
    expect(res.statusCode).toBe(401);
  });
});

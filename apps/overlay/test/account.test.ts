import { describe, expect, it } from "vitest";
import { favoritesFirst, formatUserCode, pollDeviceToken } from "../src/lib/account";
import { parseDeepLink } from "../src/lib/deeplink";

describe("parseDeepLink", () => {
  it("lee el slug de una estrategia", () => {
    expect(parseDeepLink("ageoverlay://strategy/ram-spam-cumans")).toEqual({
      type: "strategy",
      slug: "ram-spam-cumans",
    });
    // Windows a veces agrega una barra final.
    expect(parseDeepLink("ageoverlay://strategy/scouts-feudal/")).toEqual({
      type: "strategy",
      slug: "scouts-feudal",
    });
  });

  it("ignora links inválidos o de otro esquema", () => {
    expect(parseDeepLink("https://strategy/x")).toBeNull();
    expect(parseDeepLink("ageoverlay://otra-cosa/x")).toBeNull();
    expect(parseDeepLink("ageoverlay://strategy/")).toBeNull();
    expect(parseDeepLink("ageoverlay://strategy/a/b")).toBeNull();
    expect(parseDeepLink("ageoverlay://strategy/..%2F..%2Fetc")).toBeNull();
    expect(parseDeepLink("no es una url")).toBeNull();
  });
});

describe("favoritesFirst", () => {
  const items = ["a", "b", "c", "d"];
  it("sube las favoritas en el orden en que se marcaron y deja el resto igual", () => {
    expect(favoritesFirst(items, (x) => x, ["d", "b"])).toEqual(["d", "b", "a", "c"]);
  });
  it("sin favoritas no cambia nada", () => {
    expect(favoritesFirst(items, (x) => x, [])).toEqual(items);
  });
});

it("formatUserCode", () => {
  expect(formatUserCode("ABCDEFGH")).toBe("ABCD-EFGH");
});

describe("pollDeviceToken", () => {
  const reply = (status: number, body: unknown) =>
    (async () => new Response(JSON.stringify(body), { status })) as unknown as typeof fetch;

  it("aprobado → token", async () => {
    const r = await pollDeviceToken("https://api", "dc", 5, reply(200, { access_token: "tok" }));
    expect(r).toEqual({ state: "approved", token: "tok" });
  });
  it("pendiente y slow_down", async () => {
    const pending = await pollDeviceToken(
      "https://api",
      "dc",
      5,
      reply(400, { error: "authorization_pending" }),
    );
    expect(pending).toEqual({ state: "pending", interval: 5 });
    const slow = await pollDeviceToken("https://api", "dc", 5, reply(400, { error: "slow_down" }));
    expect(slow).toEqual({ state: "pending", interval: 10 });
  });
  it("rechazado o vencido", async () => {
    expect(
      (await pollDeviceToken("https://api", "dc", 5, reply(400, { error: "access_denied" }))).state,
    ).toBe("failed");
    expect(
      (await pollDeviceToken("https://api", "dc", 5, reply(400, { error: "expired_token" }))).state,
    ).toBe("failed");
  });
});

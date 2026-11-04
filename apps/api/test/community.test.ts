import { describe, expect, it } from "vitest";
import { bogUrl, prepareCommunityStrategy } from "../src/db/community";

const base = {
  name: " Fast Imperial Turks Arena ",
  civilization: "Turks",
  author: "pro_player",
  build_order: [
    {
      villager_count: 6,
      age: 1,
      resources: { wood: 0, food: 6, gold: 0, stone: 0 },
      notes: ["Create 6 @resource/MaleVillDE.jpg@ on @animal/Sheep_aoe2DE.png@"],
    },
  ],
};

describe("prepareCommunityStrategy", () => {
  it("da crédito con la fuente original y el tag", () => {
    const r = prepareCommunityStrategy(base, "aqo8MRuR07aaUKTSTt6V");
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.strategy.source).toBe(bogUrl("aqo8MRuR07aaUKTSTt6V"));
    expect(r.strategy.author).toBe("pro_player");
    expect(r.strategy.tags).toContain("buildorderguide");
    expect(r.slug).toBe("fast-imperial-turks-arena-aqo8mr");
  });

  it("deduce mapa y tipo de mapa del nombre", () => {
    const r = prepareCommunityStrategy(base, "abc123");
    if (!r.ok) throw new Error("debería ser válida");
    expect(r.strategy.maps).toEqual(["arena"]);
    expect(r.strategy.map_types).toEqual(["closed"]);
  });

  it("respeta la fuente y los mapas que ya vienen", () => {
    const r = prepareCommunityStrategy(
      { ...base, source: "https://youtu.be/x", maps: ["arabia"], map_types: ["open"] },
      "abc123",
    );
    if (!r.ok) throw new Error("debería ser válida");
    expect(r.strategy.source).toBe("https://youtu.be/x");
    expect(r.strategy.maps).toEqual(["arabia"]);
  });

  it("avisa civilizaciones desconocidas", () => {
    const r = prepareCommunityStrategy({ ...base, civilization: "Atlantes" }, "abc123");
    expect(r.ok && r.warnings[0]).toMatch(/Atlantes/);
  });

  it("rechaza JSON inválidos", () => {
    const r = prepareCommunityStrategy({ name: "x" }, "abc123");
    expect(r.ok).toBe(false);
  });
});

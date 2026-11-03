import { describe, expect, it } from "vitest";
import { scoreStrategy, suggest, type Strategy } from "../src";

const base: Strategy = {
  name: "x",
  civilization: "Any",
  author: "test",
  build_order: [
    {
      villager_count: 6,
      age: 1,
      resources: { wood: 0, food: 6, gold: 0, stone: 0 },
      notes: ["-"],
    },
  ],
};

const make = (name: string, extra: Partial<Strategy>): Strategy => ({ ...base, name, ...extra });

const generic = make("generic", {});
const malayElephant = make("malay", { civilization: "Malay", map_types: ["closed"] });
const britonsArchers = make("britons", { civilization: ["Britons"], map_types: ["open"] });
const forestFC = make("forest", { maps: ["black_forest"], map_types: ["closed"] });
const flankScouts = make("flank", { positions: ["flank"], vs_civilizations: ["Britons"] });

describe("scoreStrategy", () => {
  it("descarta estrategias de otra civ", () => {
    expect(scoreStrategy(britonsArchers, { civ: "Malay" })).toBeNull();
  });

  it("compara civs sin importar mayúsculas", () => {
    expect(scoreStrategy(malayElephant, { civ: "malay" })?.reasons).toContain("civ");
  });

  it("descarta estrategias de otro tipo de mapa", () => {
    expect(scoreStrategy(britonsArchers, { civ: "Britons", mapType: "closed" })).toBeNull();
  });

  it("un mapa exacto gana aunque el tipo no coincida", () => {
    const r = scoreStrategy(forestFC, { map: "black_forest", mapType: "hybrid" });
    expect(r?.reasons).toContain("mapa");
  });

  it("los votos suman", () => {
    const sinVotos = scoreStrategy(generic, {})!.score;
    const conVotos = scoreStrategy(generic, {}, 99)!.score;
    expect(conVotos).toBeGreaterThan(sinVotos);
  });
});

describe("suggest", () => {
  const all = [generic, malayElephant, britonsArchers, forestFC, flankScouts];

  it("Selva Negra con malayos contra britanos", () => {
    const result = suggest(all, {
      civ: "Malay",
      vsCiv: "Britons",
      map: "black_forest",
      mapType: "closed",
      position: "flank",
    });
    const names = result.map((s) => s.strategy.name);
    expect(names[0]).toBe("malay");
    expect(names).not.toContain("britons");
    expect(names).toContain("forest");
    expect(names).toContain("generic");
  });

  it("respeta el límite y usa getVotes", () => {
    const result = suggest(
      [generic, flankScouts],
      {},
      {
        limit: 1,
        getVotes: (s) => (s.name === "flank" ? 100 : 0),
      },
    );
    expect(result).toHaveLength(1);
    expect(result[0]?.strategy.name).toBe("flank");
  });
});

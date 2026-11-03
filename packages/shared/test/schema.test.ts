import { describe, expect, it } from "vitest";
import { getCivilizations, strategySchema } from "../src";
import community from "./fixtures/community-20-min-elephant.json";

describe("strategySchema", () => {
  it("acepta el formato de la comunidad tal cual", () => {
    const parsed = strategySchema.parse(community);
    expect(parsed.name).toBe("20-Min Elephant"); // recorta espacios
    expect(parsed.build_order).toHaveLength(5);
    expect(parsed.build_order[3]?.resources.builder).toBe(5);
  });

  it("acepta las extensiones propias", () => {
    const parsed = strategySchema.parse({
      ...community,
      maps: ["arabia"],
      map_types: ["open"],
      positions: ["flank"],
      difficulty: "beginner",
    });
    expect(parsed.map_types).toEqual(["open"]);
  });

  it("rechaza pasos inválidos", () => {
    const bad = { ...community, build_order: [{ villager_count: -1, age: 5, notes: [] }] };
    expect(strategySchema.safeParse(bad).success).toBe(false);
  });

  it("solo acepta fuentes http/https", () => {
    for (const source of ["javascript:alert(1)", "data:text/html,hola", "ftp://x.com/a"]) {
      expect(strategySchema.safeParse({ ...community, source }).success).toBe(false);
    }
    expect(strategySchema.safeParse({ ...community, source: "https://x.com" }).success).toBe(true);
  });

  it("rechaza tiempos con formato inválido", () => {
    const step = { ...community.build_order[0], time: "1:75" };
    expect(strategySchema.safeParse({ ...community, build_order: [step] }).success).toBe(false);
  });
});

describe("getCivilizations", () => {
  it("devuelve lista vacía para estrategias genéricas", () => {
    expect(getCivilizations({ civilization: "Any" })).toEqual([]);
    expect(getCivilizations({ civilization: ["Generic"] })).toEqual([]);
  });

  it("normaliza string a lista", () => {
    expect(getCivilizations({ civilization: "Malay" })).toEqual(["Malay"]);
  });
});

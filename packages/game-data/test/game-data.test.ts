import { describe, expect, it } from "vitest";
import { CIVS, MAPS, findCiv, findMap, mapTypeOf } from "../src";

describe("datos", () => {
  it("ids únicos", () => {
    expect(new Set(CIVS.map((c) => c.id)).size).toBe(CIVS.length);
    expect(new Set(MAPS.map((m) => m.id)).size).toBe(MAPS.length);
  });

  it("ids en snake_case", () => {
    for (const { id } of [...CIVS, ...MAPS]) expect(id).toMatch(/^[a-z0-9_]+$/);
  });
});

describe("búsquedas", () => {
  it("encuentra civs por id, inglés o español", () => {
    expect(findCiv("malay")?.name.en).toBe("Malay");
    expect(findCiv("Malay")?.id).toBe("malay");
    expect(findCiv("malayos")?.id).toBe("malay");
    expect(findCiv("nope")).toBeUndefined();
  });

  it("encuentra mapas y su tipo", () => {
    expect(findMap("Selva Negra")?.id).toBe("black_forest");
    expect(mapTypeOf("black_forest")).toBe("closed");
    expect(mapTypeOf("Arabia")).toBe("open");
  });
});

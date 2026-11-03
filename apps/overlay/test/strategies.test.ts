import { describe, expect, it } from "vitest";
import { BUNDLED_STRATEGIES } from "../src/lib/strategies";

describe("estrategias empaquetadas", () => {
  it("carga todas las del repo y son válidas", () => {
    expect(BUNDLED_STRATEGIES.length).toBeGreaterThanOrEqual(5);
    expect(BUNDLED_STRATEGIES.map((s) => s.id)).toContain("fast-castle-boom");
  });
});

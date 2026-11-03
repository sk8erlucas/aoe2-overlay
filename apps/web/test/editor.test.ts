import { describe, expect, it } from "vitest";
import {
  emptyForm,
  fromStrategy,
  toStrategy,
  validate,
  warnings,
} from "../src/components/editor/form-state";

const strategy = {
  name: "Prueba",
  civilization: ["Malay", "Khmer"],
  author: "yo",
  maps: ["arena"],
  map_types: ["closed" as const],
  build_order: [
    {
      villager_count: 6,
      age: 1,
      time: "1:15",
      resources: { wood: 0, food: 6, gold: 0, stone: 0 },
      notes: ["a", "b"],
    },
  ],
};

describe("editor", () => {
  it("ida y vuelta: estrategia → formulario → estrategia", () => {
    const form = fromStrategy(strategy);
    expect(form.steps[0]?.notes).toBe("a\nb");
    expect(toStrategy(form)).toEqual(strategy);
  });

  it("sin civs es genérica", () => {
    const form = { ...emptyForm("yo"), name: "x" };
    expect(toStrategy(form).civilization).toBe("Generic");
  });

  it("valida con mensajes legibles", () => {
    const result = validate(emptyForm("yo"));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e) => e.startsWith("Nombre"))).toBe(true);
      expect(result.errors.some((e) => e.includes("Pasos › #1 › notas"))).toBe(true);
    }
  });

  it("avisa si los recursos no suman los aldeanos", () => {
    const form = fromStrategy(strategy);
    form.steps[0]!.villager_count = 7;
    expect(warnings(form)).toHaveLength(1);
  });
});

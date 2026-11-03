import { describe, expect, it } from "vitest";
import {
  estimateStepTimes,
  formatClock,
  gameToReal,
  getStepAt,
  parseClock,
  realToGame,
  type Step,
} from "../src";

const step = (villager_count: number, age = 1, time?: Step["time"]): Step => ({
  villager_count,
  age,
  resources: { wood: 0, food: 0, gold: 0, stone: 0 },
  notes: ["-"],
  ...(time === undefined ? {} : { time }),
});

describe("conversión de velocidad", () => {
  it("a 1.7, 170 s de juego son 100 s reales", () => {
    expect(gameToReal(170)).toBeCloseTo(100);
    expect(realToGame(100)).toBeCloseTo(170);
  });

  it("respeta otras velocidades", () => {
    expect(gameToReal(150, 1.5)).toBeCloseTo(100);
  });
});

describe("formatClock / parseClock", () => {
  it("formatea", () => {
    expect(formatClock(0)).toBe("0:00");
    expect(formatClock(125)).toBe("2:05");
    expect(formatClock(-3)).toBe("0:00");
    expect(formatClock(3725.9)).toBe("62:05");
  });

  it("parsea", () => {
    expect(parseClock("2:05")).toBe(125);
    expect(() => parseClock("2:5")).toThrow();
  });
});

describe("estimateStepTimes", () => {
  it("un aldeano cada 25 s desde los 3 iniciales", () => {
    expect(estimateStepTimes([step(6), step(10)])).toEqual([75, 175]);
  });

  it("suma el tiempo de avance de edad", () => {
    // 21 aldeanos: (21-3)*25 = 450; feudal +130
    expect(estimateStepTimes([step(21, 1), step(21, 2)])).toEqual([450, 580]);
  });

  it("suma todas las edades salteadas", () => {
    expect(estimateStepTimes([step(3, 3)])).toEqual([130 + 160]);
  });

  it("usa el tiempo explícito y nunca retrocede", () => {
    expect(estimateStepTimes([step(10, 1, "4:00"), step(11), step(12, 1, 30)])).toEqual([
      240, 240, 240,
    ]);
  });
});

describe("getStepAt", () => {
  const times = [0, 100, 200];

  it("antes y durante el primer paso", () => {
    expect(getStepAt(times, 0)).toEqual({ index: 0, nextIndex: 1, secondsToNext: 100 });
  });

  it("en medio", () => {
    expect(getStepAt(times, 150)).toEqual({ index: 1, nextIndex: 2, secondsToNext: 50 });
  });

  it("último paso", () => {
    expect(getStepAt(times, 999)).toEqual({ index: 2, nextIndex: null, secondsToNext: null });
  });
});

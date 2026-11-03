import { describe, expect, it } from "vitest";
import {
  gameTime,
  initialClock,
  jumpTo,
  pause,
  rebase,
  reset,
  shift,
  start,
  toggle,
} from "../src/lib/clock";

const SPEED = 1.7;

describe("reloj", () => {
  it("arranca en 0 y pausado", () => {
    expect(gameTime(initialClock, 5000, SPEED)).toBe(0);
  });

  it("100 s reales a 1.7 son 170 s de juego", () => {
    const c = start(initialClock, 0);
    expect(gameTime(c, 100_000, SPEED)).toBeCloseTo(170);
  });

  it("pausa y reanuda sin perder tiempo", () => {
    let c = start(initialClock, 0);
    c = pause(c, 10_000); // 10 s reales
    expect(gameTime(c, 50_000, SPEED)).toBeCloseTo(17); // pausado: no avanza
    c = start(c, 50_000);
    expect(gameTime(c, 60_000, SPEED)).toBeCloseTo(34);
  });

  it("toggle alterna", () => {
    const c = toggle(initialClock, 0);
    expect(c.running).toBe(true);
    expect(toggle(c, 1000).running).toBe(false);
  });

  it("±5 s y nunca negativo", () => {
    let c = start(initialClock, 0);
    c = shift(c, 10_000, SPEED, 5);
    expect(gameTime(c, 10_000, SPEED)).toBeCloseTo(22);
    c = shift(c, 10_000, SPEED, -100);
    expect(gameTime(c, 10_000, SPEED)).toBe(0);
    // y sigue corriendo desde 0
    expect(gameTime(c, 20_000, SPEED)).toBeCloseTo(17);
  });

  it("jumpTo lleva el reloj a un tiempo exacto", () => {
    const c = jumpTo(start(initialClock, 0), 30_000, SPEED, 300);
    expect(gameTime(c, 30_000, SPEED)).toBeCloseTo(300);
  });

  it("rebase cambia la velocidad sin saltos", () => {
    let c = start(initialClock, 0);
    c = rebase(c, 100_000, 1.7); // 170 s de juego
    expect(gameTime(c, 100_000, 1.5)).toBeCloseTo(170);
    expect(gameTime(c, 110_000, 1.5)).toBeCloseTo(185);
  });

  it("reset vuelve al inicio", () => {
    expect(reset()).toEqual(initialClock);
  });
});

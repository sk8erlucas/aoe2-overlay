import { describe, expect, it } from "vitest";
import { iconLabel, noteToText, parseNote } from "../src";

describe("parseNote", () => {
  it("separa texto e íconos", () => {
    expect(parseNote("Create 6 @resource/MaleVillDE.jpg@ on @animal/Sheep_aoe2DE.png@")).toEqual([
      { type: "text", text: "Crear 6 " },
      { type: "icon", path: "resource/MaleVillDE.jpg", label: "aldeanos" },
      { type: "text", text: " en " },
      { type: "icon", path: "animal/Sheep_aoe2DE.png", label: "ovejas" },
    ]);
  });

  it("texto sin íconos: un solo segmento (con las palabras clave traducidas)", () => {
    expect(parseNote("Explorar con el explorador")).toEqual([
      { type: "text", text: "Explorar con el explorador" },
    ]);
    expect(parseNote("Click up to feudalAge")).toEqual([
      { type: "text", text: "Avanzar a Edad Feudal" },
    ]);
  });
});

describe("iconLabel", () => {
  it("prefiere la coincidencia más específica", () => {
    expect(iconLabel("resource/FemaleVillDE.jpg")).toBe("aldeana");
  });

  it("limpia nombres desconocidos", () => {
    expect(iconLabel("unit/Battle_Elephant_aoe2DE.png")).toBe("Battle Elephant");
  });
});

describe("noteToText", () => {
  it("reemplaza íconos por etiquetas", () => {
    expect(noteToText("@resource/Aoe2de_hammer.png@ 1 @barracks/Barracks_aoe2DE.png@")).toBe(
      "construir 1 cuartel",
    );
  });
});

describe("palabras clave de la comunidad", () => {
  it("traduce las conocidas y deja el resto", async () => {
    const { noteToText } = await import("../src");
    expect(noteToText("Move 6 from foodUnderTC to stragglerTree")).toBe(
      "Mover 6 de comida bajo el centro urbano a árbol suelto",
    );
    expect(noteToText("Train ∞ battleElephant")).toBe("Entrenar ∞ elefantes de guerra");
    expect(noteToText("Click up to feudalAge")).toBe("Avanzar a Edad Feudal");
    expect(noteToText("Start moving close to opponent’s @town_center/Towncenter_aoe2DE.png@")).toBe(
      "Acercarse al rival: centro urbano",
    );
  });

  it("edificios escritos como texto y plurales según el número", async () => {
    const { noteToText } = await import("../src");
    expect(noteToText("@resource/Aoe2de_hammer.png@ 1 market, 2 @stable/Stable_aoe2DE.png@")).toBe(
      "construir 1 mercado, 2 establos",
    );
    expect(noteToText("@resource/Aoe2de_hammer.png@ 2 house, 1 barracks")).toBe(
      "construir 2 casas, 1 cuartel",
    );
    expect(noteToText("Create 1 @resource/MaleVillDE.jpg@ on @resource/BerryBushDE.png@")).toBe(
      "Crear 1 aldeano en bayas",
    );
    expect(noteToText("@resource/Aoe2de_hammer.png@ 2 townCenter")).toBe(
      "construir 2 centros urbanos",
    );
  });

  it("no toca el texto en español", async () => {
    const { noteToText } = await import("../src");
    const nota = "Con 6 aldeanos, cómo atraer el jabalí a tu centro urbano";
    expect(noteToText(nota)).toBe(nota);
  });
});

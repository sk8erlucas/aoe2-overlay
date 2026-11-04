import { describe, expect, it } from "vitest";
import { iconLabel, noteToText, parseNote } from "../src";

describe("parseNote", () => {
  it("separa texto e íconos", () => {
    expect(parseNote("Create 6 @resource/MaleVillDE.jpg@ on @animal/Sheep_aoe2DE.png@")).toEqual([
      { type: "text", text: "Create 6 " },
      { type: "icon", path: "resource/MaleVillDE.jpg", label: "aldeano" },
      { type: "text", text: " on " },
      { type: "icon", path: "animal/Sheep_aoe2DE.png", label: "ovejas" },
    ]);
  });

  it("texto sin íconos: un solo segmento (con las palabras clave traducidas)", () => {
    expect(parseNote("Explorar con el explorador")).toEqual([
      { type: "text", text: "Explorar con el explorador" },
    ]);
    expect(parseNote("Click up to feudalAge")).toEqual([
      { type: "text", text: "Click up to Edad Feudal" },
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
      "Move 6 from comida bajo el centro urbano to árbol suelto",
    );
    expect(noteToText("Train ∞ battleElephant")).toBe("Train ∞ elefantes de guerra");
    expect(noteToText("Click up to feudalAge")).toBe("Click up to Edad Feudal");
  });
});

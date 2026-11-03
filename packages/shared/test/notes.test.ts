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

  it("deja el texto sin íconos intacto", () => {
    expect(parseNote("Click up to feudalAge")).toEqual([
      { type: "text", text: "Click up to feudalAge" },
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

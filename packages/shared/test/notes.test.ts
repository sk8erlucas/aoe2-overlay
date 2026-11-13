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

  it("tecnologías e íconos con el nombre oficial en español", () => {
    expect(noteToText("Research bloodlines, paddedArcherArmor")).toBe(
      "Investigar pureza de sangre, armadura acolchada de arquero",
    );
    expect(noteToText("Research @town_center/WheelbarrowDE.png@")).toBe("Investigar carretilla");
    expect(noteToText("Train 2 @stable/Scoutcavalry_aoe2DE.png@")).toBe("Entrenar 2 exploradores");
  });

  it("usa artículo delante de una edad", () => {
    expect(noteToText("Before @age/FeudalAgeIconDE_alpha.png@")).toBe("Antes de la Edad Feudal");
    expect(noteToText("In @age/CastleAgeIconDE_alpha.png@")).toBe("En la Edad de los Castillos");
    expect(noteToText("In castleAge")).toBe("En la Edad de los Castillos");
    expect(noteToText("In @stable/Stable_aoe2DE.png@")).toBe("En establo");
  });

  it("el martillo como lugar es construcción", () => {
    expect(
      noteToText(
        "Move 5 @resource/MaleVillDE.jpg@ from @resource/Aoe2de_hammer.png@ to @resource/Aoe2de_gold.png@",
      ),
    ).toBe("Mover 5 aldeanos de construcción a oro");
    expect(noteToText("Create 5 @resource/MaleVillDE.jpg@ on @resource/Aoe2de_hammer.png@")).toBe(
      "Crear 5 aldeanos en construcción",
    );
    expect(noteToText("@resource/Aoe2de_hammer.png@ 1 @other/House_aoe2DE.png@")).toBe(
      "construir 1 casa",
    );
  });

  it("palabras con mayúscula, nombres de dos palabras y comercio", () => {
    expect(noteToText("Train 3 Militia")).toBe("Entrenar 3 milicias");
    expect(noteToText("Research Fletching, Bloodlines")).toBe(
      "Investigar emplumado de flechas, pureza de sangre",
    );
    expect(noteToText("Build 1 Archery range")).toBe("Construir 1 galería de tiro");
    expect(noteToText("Sell 100 food")).toBe("Vender 100 comida");
    expect(noteToText("constructor toString")).toBe("constructor toString");
  });

  it("no toca el texto en español", async () => {
    const { noteToText } = await import("../src");
    const nota = "Con 6 aldeanos, cómo atraer el jabalí a tu centro urbano";
    expect(noteToText(nota)).toBe(nota);
  });
});

import { strategySchema } from "@age-overlay/shared";
import { describe, expect, it } from "vitest";
import {
  bogBuildUrl,
  bogScore,
  fromFirestoreDocument,
  illustrate,
  nameAuthorKey,
  selectBest,
  toOverlayStrategy,
  type BogBuild,
} from "../src/db/bog";

describe("Firestore → JSON", () => {
  it("convierte valores anidados y toma el id del nombre del documento", () => {
    const build = fromFirestoreDocument({
      name: "projects/build-order-guide/databases/(default)/documents/published-builds/abc123",
      fields: {
        title: { stringValue: "Fast Scouts" },
        avg_rating: { doubleValue: 4.5 },
        number_of_ratings: { integerValue: "6" },
        attributes: { arrayValue: { values: [{ stringValue: "scouts" }] } },
        build: {
          arrayValue: {
            values: [
              {
                mapValue: {
                  fields: {
                    type: { stringValue: "newVillagers" },
                    count: { integerValue: "6" },
                    resources: { mapValue: { fields: { food: { integerValue: "6" } } } },
                  },
                },
              },
            ],
          },
        },
      },
    });
    expect(build).toEqual({
      id: "abc123",
      title: "Fast Scouts",
      avg_rating: 4.5,
      number_of_ratings: 6,
      attributes: ["scouts"],
      build: [{ type: "newVillagers", count: 6, resources: { food: 6 } }],
    });
  });
});

describe("conversión al formato del overlay", () => {
  it("usa íconos para los nombres conocidos, empezando por los más largos", () => {
    expect(illustrate("Create 6 villagers on sheep")).toBe(
      "Create 6 @resource/MaleVillDE.jpg@ on @animal/Sheep_aoe2DE.png@",
    );
    expect(illustrate("Build 1 lumber camp")).toBe(
      "@resource/Aoe2de_hammer.png@ 1 @lumber_camp/Lumber_camp_aoe2de.png@",
    );
  });

  const build: BogBuild = {
    id: "abc123",
    title: " Fast Scouts ",
    civilization: "Generic",
    author: "Hera",
    description: "Scouts en Feudal",
    difficulty: 2,
    attributes: ["scouts"],
    avg_rating: 5,
    number_of_ratings: 4,
    build: [
      { type: "newVillagers", count: 6, task: "sheep", resources: { food: 6 } },
      { type: "build", buildings: [{ type: "house", count: 2 }], resources: { food: 6 } },
      { type: "newVillagers", count: 3, task: "wood", resources: { food: 6, wood: 3 } },
      { type: "ageUp", age: "feudalAge", resources: { food: 6, wood: 3 } },
      { type: "research", tech: ["loom"], resources: { food: 6, wood: 3 } },
      { type: "newAge", age: "feudalAge", resources: { food: 6, wood: 3 } },
      { type: "trainUnit", count: 3, unit: "scouts", resources: { food: 6, wood: 3 } },
    ],
  };

  it("arma los pasos como el exportador de Build Order Guide", () => {
    const s = toOverlayStrategy(build);
    expect(s).toMatchObject({
      name: "Fast Scouts",
      civilization: "Any",
      author: "Hera",
      source: bogBuildUrl("abc123"),
      difficulty: "intermediate",
      tags: ["scouts"],
    });
    expect(s.build_order).toEqual([
      {
        villager_count: 6,
        age: 1,
        resources: { wood: 0, food: 6, gold: 0, stone: 0 },
        notes: [
          "Create 6 @resource/MaleVillDE.jpg@ on @animal/Sheep_aoe2DE.png@",
          "@resource/Aoe2de_hammer.png@ 2 @other/House_aoe2DE.png@",
        ],
      },
      {
        villager_count: 9,
        age: 1,
        resources: { wood: 3, food: 6, gold: 0, stone: 0 },
        notes: [
          "Create 3 @resource/MaleVillDE.jpg@ on @resource/Aoe2de_wood.png@",
          "Click up to feudalAge",
        ],
      },
      {
        villager_count: 9,
        age: 2,
        resources: { wood: 3, food: 6, gold: 0, stone: 0 },
        notes: ["Before @age/FeudalAgeIconDE_alpha.png@", "Research @town_center/LoomDE.png@"],
      },
      {
        villager_count: 9,
        age: 2,
        resources: { wood: 3, food: 6, gold: 0, stone: 0 },
        notes: ["In @age/FeudalAgeIconDE_alpha.png@", "Train 3 @stable/Scoutcavalry_aoe2DE.png@"],
      },
    ]);
    expect(strategySchema.safeParse(s).success).toBe(true);
  });

  it("civs agrupadas con los nombres de este proyecto", () => {
    expect(toOverlayStrategy({ ...build, civilization: "Meso" }).civilization).toEqual([
      "Aztecs",
      "Mayans",
    ]);
    expect(toOverlayStrategy({ ...build, civilization: "Spanish" }).civilization).toBe("Spanish");
  });
});

describe("selección", () => {
  const b = (id: string, civ: string, avg: number, n: number): BogBuild => ({
    id,
    title: `Build ${id}`,
    author: "x",
    civilization: civ,
    avg_rating: avg,
    number_of_ratings: n,
    build: [{ type: "custom", text: "hola" }],
  });

  it("el puntaje bayesiano premia tener más calificaciones", () => {
    expect(bogScore(b("a", "Franks", 4.5, 20))).toBeGreaterThan(bogScore(b("b", "Franks", 5, 1)));
  });

  it("elige las mejores por civ, completa civs sin calificar y saltea las ya cargadas", () => {
    const chosen = selectBest(
      [
        b("f1", "Franks", 5, 10),
        b("f2", "Franks", 4, 10),
        b("f3", "Franks", 4.5, 10),
        b("low", "Franks", 1, 10),
        b("h1", "Huns", 5, 1),
        b("h2", "Huns", 4, 1),
        b("bad", "Goths", 2, 1),
        b("none", "Saxons", 0, 0),
        b("dup", "Celts", 5, 10),
      ],
      { perCiv: 2, minRatings: 3, fill: true, skip: new Set([nameAuthorKey("Build dup", "x")]) },
    );
    expect(chosen.map((c) => c.id).sort()).toEqual(["f1", "f3", "h1"]);
  });
});

import { describe, expect, it } from "vitest";
import {
  chooseStrategy,
  civFromCompanion,
  elapsedGameSeconds,
  isOngoing,
  mapFromCompanion,
  parseMatch,
  type CompanionMatch,
} from "../src/lib/detect";
import { BUNDLED_STRATEGIES } from "../src/lib/strategies";

const ME = 199325;

const match = (over: Partial<CompanionMatch> = {}): CompanionMatch => ({
  matchId: 1,
  started: "2026-11-19T20:00:00.000Z",
  finished: null,
  map: "rm_arabia",
  mapName: "Arabia",
  speedFactor: 1.7,
  teams: [
    { teamId: 1, players: [{ profileId: ME, name: "Yo", civ: "franks", civName: "Franks" }] },
    { teamId: 2, players: [{ profileId: 2, name: "Rival", civ: "muisca", civName: "Muisca" }] },
  ],
  ...over,
});

describe("civs y mapas de AoE2 Companion", () => {
  it("traduce al nombre en inglés y al id de game-data", () => {
    expect(civFromCompanion("franks")).toBe("Franks");
    expect(civFromCompanion("xx", "Britons")).toBe("Britons");
    expect(civFromCompanion("desconocida")).toBeUndefined();
    expect(mapFromCompanion("rm_arabia", "Arabia")).toBe("arabia");
    expect(mapFromCompanion(undefined, "Black Forest")).toBe("black_forest");
    expect(mapFromCompanion("unknown", "PopulationBoost Arena (Custom)")).toBeUndefined();
  });
});

describe("parseMatch", () => {
  it("1 contra 1 en curso", () => {
    const m = parseMatch(match(), ME)!;
    expect(m).toMatchObject({
      matchId: 1,
      finished: false,
      civ: "Franks",
      vsCiv: "Muisca",
      map: "arabia",
      position: "1v1",
      speed: 1.7,
    });
    expect(m.won).toBeUndefined();
    expect(isOngoing(m, Date.parse("2026-11-19T20:10:00Z"))).toBe(true);
    // Una "en curso" de hace horas quedó colgada en la API.
    expect(isOngoing(m, Date.parse("2026-11-20T02:00:00Z"))).toBe(false);
  });

  it("terminada, con resultado", () => {
    const m = parseMatch(
      match({
        finished: "2026-11-19T20:30:00.000Z",
        teams: [
          {
            teamId: 1,
            players: [{ profileId: ME, name: "Yo", civ: "franks", won: true }],
          },
          { teamId: 2, players: [{ profileId: 2, name: "R", civ: "muisca", won: false }] },
        ],
      }),
      ME,
    )!;
    expect(m.finished).toBe(true);
    expect(m.won).toBe(true);
  });

  it("en equipos no adivina la posición; sin el jugador devuelve null", () => {
    const team = match({
      teams: [
        {
          teamId: 1,
          players: [
            { profileId: ME, name: "Yo", civ: "franks" },
            { profileId: 3, name: "Aliado", civ: "britons" },
          ],
        },
        { teamId: 2, players: [{ profileId: 2, name: "Rival", civ: "muisca" }] },
      ],
    });
    expect(parseMatch(team, ME)?.position).toBeUndefined();
    expect(parseMatch(match(), 999)).toBeNull();
  });
});

describe("estrategia y reloj", () => {
  const m = parseMatch(match(), ME)!;

  it("mantiene la elegida si sirve; si no, la mejor sugerencia", () => {
    const first = chooseStrategy(BUNDLED_STRATEGIES, m, undefined);
    expect(first).toBeTruthy();
    expect(chooseStrategy(BUNDLED_STRATEGIES, m, first)).toBe(first);
    expect(chooseStrategy(BUNDLED_STRATEGIES, m, "no-existe")).toBe(first);
  });

  it("el reloj arranca con el tiempo de juego ya transcurrido", () => {
    const now = m.startedAt + 60_000;
    expect(elapsedGameSeconds(m, 1.5, now)).toBeCloseTo(102); // usa la velocidad de la partida
  });
});

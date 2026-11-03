import { describe, expect, it } from "vitest";
import { ApiError, buildQuery, errorMessage } from "../src/lib/api";
import { civLabel, mapLabel } from "../src/lib/labels";

describe("buildQuery", () => {
  it("omite vacíos", () => {
    expect(buildQuery({ civ: "Malay", q: "", page: 2, map: undefined })).toBe("?civ=Malay&page=2");
    expect(buildQuery({})).toBe("");
  });
});

describe("errorMessage", () => {
  it("incluye los problemas de validación", () => {
    const e = new ApiError(400, "Datos inválidos", [{ path: "/name", message: "requerido" }]);
    expect(errorMessage(e)).toBe("Datos inválidos: /name requerido");
  });

  it("explica cuando la API no responde", () => {
    expect(errorMessage(new TypeError("fetch failed"))).toMatch(/conectar/);
  });
});

describe("etiquetas", () => {
  it("civs en español", () => {
    expect(civLabel("Malay")).toBe("Malayos");
    expect(civLabel(["Britons", "Franks"])).toBe("Britanos, Francos");
    expect(civLabel("Generic")).toBe("Cualquier civ");
  });

  it("mapas en español", () => {
    expect(mapLabel("black_forest")).toBe("Selva Negra");
  });
});

describe("safeNext", () => {
  it("acepta rutas internas y rechaza otros sitios", async () => {
    const { safeNext } = await import("../src/lib/safe-next");
    expect(safeNext("/perfil")).toBe("/perfil");
    for (const bad of ["https://malo.com", "//malo.com", "/\\malo.com", null, ""]) {
      expect(safeNext(bad)).toBe("/estrategias");
    }
  });
});

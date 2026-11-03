import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // PGlite tarda unos segundos en arrancar.
    testTimeout: 30_000,
    hookTimeout: 60_000,
  },
});

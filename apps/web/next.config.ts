import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const root = fileURLToPath(new URL("../..", import.meta.url));

const config: NextConfig = {
  // Build autocontenido para Docker (ver apps/web/Dockerfile).
  output: "standalone",
  outputFileTracingRoot: root,
  // Los paquetes internos exportan TypeScript sin compilar.
  transpilePackages: ["@age-overlay/shared", "@age-overlay/game-data"],
  turbopack: { root },
  poweredByHeader: false,
};

export default config;

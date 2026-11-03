import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const config: NextConfig = {
  // Los paquetes internos exportan TypeScript sin compilar.
  transpilePackages: ["@age-overlay/shared", "@age-overlay/game-data"],
  turbopack: { root: fileURLToPath(new URL("../..", import.meta.url)) },
  poweredByHeader: false,
};

export default config;

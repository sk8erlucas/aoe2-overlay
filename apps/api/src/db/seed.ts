/** Carga las estrategias base. Uso: pnpm --filter @age-overlay/api db:seed */
import { loadEnv } from "../env";
import { createDb } from "./client";
import { seedStrategies } from "./seed-strategies";

const { db, close } = createDb(loadEnv());
try {
  const n = await seedStrategies(db);
  console.log(`✓ ${n} estrategias base cargadas`);
} finally {
  await close();
}

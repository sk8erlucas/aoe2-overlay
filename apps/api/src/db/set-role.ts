/**
 * Cambia el rol de un usuario. Uso:
 *   pnpm --filter @age-overlay/api user:role tu@email.com admin
 */
import { eq } from "drizzle-orm";
import { loadEnv } from "../env";
import { createDb } from "./client";
import { ROLES, user, type Role } from "./schema";

const [email, role] = process.argv.slice(2);
if (!email || !ROLES.includes(role as Role)) {
  console.error(`Uso: user:role <email> <${ROLES.join("|")}>`);
  process.exit(1);
}

const { db, close } = createDb(loadEnv());
try {
  const updated = await db
    .update(user)
    .set({ role: role as Role })
    .where(eq(user.email, email.toLowerCase()))
    .returning({ id: user.id });
  if (updated.length === 0) {
    console.error(`No existe un usuario con email ${email}`);
    process.exitCode = 1;
  } else {
    console.log(`✓ ${email} ahora es ${role}`);
  }
} finally {
  await close();
}

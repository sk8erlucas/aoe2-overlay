import { buildApp } from "./app";
import { createAuth } from "./auth";
import { createDb } from "./db/client";
import { loadEnv } from "./env";

const env = loadEnv();
const { db, close } = createDb(env);
const auth = createAuth(db, env);

const app = await buildApp({
  db,
  auth,
  env,
  logger: {
    level: env.LOG_LEVEL,
    // Nunca loguear cookies ni el header Authorization.
    redact: ["req.headers.cookie", "req.headers.authorization", 'res.headers["set-cookie"]'],
  },
});

const shutdown = async () => {
  await app.close();
  await close();
  process.exit(0);
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

await app.listen({ port: env.PORT, host: env.HOST });
app.log.info(`Documentación: ${env.BETTER_AUTH_URL}/api/docs`);

/**
 * Lo que se hace antes de borrar una cuenta (better-auth borra después el usuario, y por
 * cascada sus sesiones, votos y favoritas).
 *
 * - Las estrategias que publicó quedan en el catálogo sin autor (`author_id` pasa a null por
 *   la FK). Si el campo "autor" del JSON es su nombre de cuenta, se reemplaza por "Anónimo";
 *   si acreditaba a otra persona (por ejemplo, un pro), se respeta.
 * - Sus votos se borran acá para recalcular el puntaje de esas estrategias.
 */
import { eq, inArray, sql } from "drizzle-orm";
import type { Database } from "./client";
import { strategies, votes } from "./schema";

export const ANONYMOUS_AUTHOR = "Anónimo";

export async function prepareAccountDeletion(db: Database, account: { id: string; name: string }) {
  await db.transaction(async (tx) => {
    await tx
      .update(strategies)
      .set({
        data: sql`jsonb_set(${strategies.data}, '{author}', to_jsonb(${ANONYMOUS_AUTHOR}::text))`,
      })
      .where(
        sql`${strategies.authorId} = ${account.id} and ${strategies.data}->>'author' = ${account.name}`,
      );

    const removed = await tx
      .delete(votes)
      .where(eq(votes.userId, account.id))
      .returning({ strategyId: votes.strategyId });
    const ids = [...new Set(removed.map((v) => v.strategyId))];
    if (ids.length) {
      await tx
        .update(strategies)
        .set({
          score: sql`(select coalesce(sum(${votes.value}), 0) from ${votes} where ${votes.strategyId} = ${strategies.id})`,
        })
        .where(inArray(strategies.id, ids));
    }
  });
}

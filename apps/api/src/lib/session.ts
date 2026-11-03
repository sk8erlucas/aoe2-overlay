import { fromNodeHeaders } from "better-auth/node";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { Auth } from "../auth";
import type { Role } from "../db/schema";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export class HttpError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
  }
}

export function sessionHelpers(auth: Auth) {
  /** Usuario logueado o null. */
  async function optionalUser(req: FastifyRequest): Promise<SessionUser | null> {
    const result = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) });
    if (!result) return null;
    const { id, name, email, role } = result.user as typeof result.user & { role?: Role };
    return { id, name, email, role: role ?? "user" };
  }

  /** Usuario logueado o error 401. */
  async function requireUser(req: FastifyRequest): Promise<SessionUser> {
    const user = await optionalUser(req);
    if (!user) throw new HttpError(401, "Tenés que iniciar sesión");
    return user;
  }

  /** Usuario con rol de moderador o admin, o error 401/403. */
  async function requireModerator(req: FastifyRequest): Promise<SessionUser> {
    const user = await requireUser(req);
    if (user.role !== "moderator" && user.role !== "admin") {
      throw new HttpError(403, "Solo moderadores");
    }
    return user;
  }

  return { optionalUser, requireUser, requireModerator };
}

export type SessionHelpers = ReturnType<typeof sessionHelpers>;

export const isStaff = (user: SessionUser | null) =>
  user?.role === "moderator" || user?.role === "admin";

/** Atajo para responder errores con el mismo formato que el error handler global. */
export function sendError(reply: FastifyReply, status: number, message: string) {
  return reply.status(status).send({ error: message });
}

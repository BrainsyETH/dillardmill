import { cookies } from "next/headers";
import { ADMIN_COOKIE, readSession, type AdminSession } from "./session";

/**
 * Defense in depth for server actions: the proxy already guards /admin, but
 * every mutation re-checks the session itself.
 */
export async function requireAdmin(): Promise<AdminSession> {
  const session = await readSession((await cookies()).get(ADMIN_COOKIE)?.value);
  if (!session) throw new Error("Not signed in");
  return session;
}

export async function currentAdmin(): Promise<AdminSession | null> {
  return readSession((await cookies()).get(ADMIN_COOKIE)?.value);
}

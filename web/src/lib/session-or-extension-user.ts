import { verifyExtensionBearer } from "@/lib/extension-jwt";
import { getSessionUserId } from "@/lib/supabase/server";

/**
 * Cookie session wins when present; otherwise accepts a valid extension JWT
 * (`Authorization: Bearer <jwt>`).
 */
export async function resolveSessionOrExtensionUserId(
  req: Request,
): Promise<string | null> {
  const sessionUser = await getSessionUserId();
  if (sessionUser) return sessionUser;
  return verifyExtensionBearer(req);
}

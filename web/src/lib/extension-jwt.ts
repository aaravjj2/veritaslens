import { SignJWT, jwtVerify } from "jose";

const TYP = "extension";

function getSecretKey(): Uint8Array | null {
  const s = process.env.EXTENSION_JWT_SECRET;
  if (!s || s.length < 16) return null;
  return new TextEncoder().encode(s);
}

export function isExtensionJwtConfigured(): boolean {
  return getSecretKey() !== null;
}

export async function signExtensionJwt(userId: string): Promise<string> {
  const secret = getSecretKey();
  if (!secret) {
    throw new Error("EXTENSION_JWT_SECRET is not configured");
  }
  return new SignJWT({ typ: TYP })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyExtensionJwt(token: string): Promise<string | null> {
  const secret = getSecretKey();
  if (!secret) return null;
  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });
    if (payload.typ !== TYP) return null;
    const sub = payload.sub;
    return typeof sub === "string" ? sub : null;
  } catch {
    return null;
  }
}

export async function verifyExtensionBearer(req: Request): Promise<string | null> {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const token = auth.slice(7).trim();
  if (!token) return null;
  return verifyExtensionJwt(token);
}

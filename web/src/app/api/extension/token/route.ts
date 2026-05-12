import { NextResponse } from "next/server";
import {
  isExtensionJwtConfigured,
  signExtensionJwt,
} from "@/lib/extension-jwt";
import { getSessionUserId } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST() {
  if (!isExtensionJwtConfigured()) {
    return NextResponse.json(
      { error: "EXTENSION_JWT_SECRET is not configured" },
      { status: 503 },
    );
  }

  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = await signExtensionJwt(userId);
  return NextResponse.json({
    token,
    expires_in_seconds: 7 * 24 * 60 * 60,
  });
}

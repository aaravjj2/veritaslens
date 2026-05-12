import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import {
  memoryGetByToken,
  memoryInsertCorrection,
  memoryListCorrectionsByUser,
} from "@/lib/memory-store";
import { resolveSessionOrExtensionUserId } from "@/lib/session-or-extension-user";

export const runtime = "nodejs";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isUuid(s: string): boolean {
  return UUID_RE.test(s);
}

export async function GET(req: Request) {
  const userId = await resolveSessionOrExtensionUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data, error } = await supabase
      .from("corrections")
      .select("id, analysis_id, correction_text, status, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ corrections: data ?? [] });
  }

  return NextResponse.json({
    corrections: memoryListCorrectionsByUser(userId),
  });
}

export async function POST(req: Request) {
  const userId = await resolveSessionOrExtensionUserId(req);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { share_token?: string; correction_text?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const shareToken =
    typeof body.share_token === "string" ? body.share_token.trim() : "";
  const correctionText =
    typeof body.correction_text === "string"
      ? body.correction_text.trim()
      : "";

  if (!shareToken || !isUuid(shareToken)) {
    return NextResponse.json({ error: "Invalid share_token" }, { status: 400 });
  }
  if (correctionText.length < 8 || correctionText.length > 4000) {
    return NextResponse.json(
      { error: "correction_text must be 8–4000 characters" },
      { status: 400 },
    );
  }

  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data: row, error: findErr } = await supabase
      .from("analyses")
      .select("id")
      .eq("share_token", shareToken)
      .maybeSingle();
    if (findErr) {
      return NextResponse.json({ error: findErr.message }, { status: 500 });
    }
    if (!row) {
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
    }
    const { error } = await supabase.from("corrections").insert({
      analysis_id: row.id,
      user_id: userId,
      correction_text: correctionText,
      status: "pending",
    });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  }

  const mem = memoryGetByToken(shareToken);
  if (!mem) {
    return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
  }
  memoryInsertCorrection({
    analysisId: mem.id,
    userId,
    correctionText,
  });
  return NextResponse.json({ ok: true });
}

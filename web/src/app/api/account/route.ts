import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getSessionUserId } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({
      language_pref: "en",
      digest_weekly: false,
      note: "Supabase not configured; preferences are not persisted remotely.",
    });
  }

  const { data, error } = await supabase
    .from("users_meta")
    .select("language_pref, digest_weekly")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({
      language_pref: "en",
      digest_weekly: false,
    });
  }

  return NextResponse.json({
    language_pref: data.language_pref ?? "en",
    digest_weekly: Boolean(data.digest_weekly),
  });
}

export async function PATCH(req: Request) {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { language_pref?: string; digest_weekly?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase is not configured" },
      { status: 503 },
    );
  }

  const { data: cur, error: readErr } = await supabase
    .from("users_meta")
    .select("language_pref, digest_weekly")
    .eq("id", userId)
    .maybeSingle();

  if (readErr) {
    return NextResponse.json({ error: readErr.message }, { status: 500 });
  }

  const languagePref =
    typeof body.language_pref === "string"
      ? body.language_pref.trim().slice(0, 8) || "en"
      : (cur?.language_pref ?? "en");
  const digestWeekly =
    typeof body.digest_weekly === "boolean"
      ? body.digest_weekly
      : Boolean(cur?.digest_weekly);

  const { error } = await supabase.from("users_meta").upsert(
    {
      id: userId,
      language_pref: languagePref,
      digest_weekly: digestWeekly,
    },
    { onConflict: "id" },
  );
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

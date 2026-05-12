import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { memoryListByUser } from "@/lib/memory-store";
import { getSessionUserId } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data, error } = await supabase
      .from("analyses")
      .select("share_token, language, created_at, input_text")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ analyses: data ?? [] });
  }

  const rows = memoryListByUser(userId).map((r) => ({
    share_token: r.share_token,
    language: r.language,
    created_at: r.created_at,
    input_text: r.input_text,
  }));
  return NextResponse.json({ analyses: rows });
}

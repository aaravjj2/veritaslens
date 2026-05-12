import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";

type DigestRow = { user_id: string; email: string };

function digestHtml(): string {
  return `<p>Thanks for using <strong>VeritasLens</strong>.</p>
<p>This is your weekly digest — highlights from your saved analyses will appear here as the product matures.</p>`;
}

export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "CRON_SECRET is not configured" },
      { status: 503 },
    );
  }

  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json({
      processed: 0,
      emailed: 0,
      message: "Supabase not configured; nothing to do.",
    });
  }

  const { data: rows, error: rpcError } = await supabase.rpc(
    "get_digest_subscribers",
  );

  if (rpcError) {
    const { count, error: countErr } = await supabase
      .from("users_meta")
      .select("id", { count: "exact", head: true })
      .eq("digest_weekly", true);
    if (countErr) {
      return NextResponse.json({ error: countErr.message }, { status: 500 });
    }
    return NextResponse.json({
      processed: count ?? 0,
      emailed: 0,
      warning: `get_digest_subscribers failed: ${rpcError.message}. Apply migration 004_digest_subscribers_rpc.sql.`,
    });
  }

  const subscribers = (rows ?? []) as DigestRow[];
  const resendKey = process.env.RESEND_API_KEY?.trim();
  const fromRaw = process.env.RESEND_FROM?.trim();
  const resend =
    resendKey && fromRaw
      ? { client: new Resend(resendKey), from: fromRaw }
      : null;

  let emailed = 0;
  const sendErrors: string[] = [];

  for (const row of subscribers) {
    if (!resend) continue;
    const { error: sendErr } = await resend.client.emails.send({
      from: resend.from,
      to: row.email,
      subject: "VeritasLens — weekly digest",
      html: digestHtml(),
    });
    if (sendErr) {
      sendErrors.push(`${row.user_id}: ${sendErr.message}`);
    } else {
      emailed++;
    }
  }

  return NextResponse.json({
    processed: subscribers.length,
    emailed,
    dryRun: !resend,
    message: resend
      ? undefined
      : "Set RESEND_API_KEY and RESEND_FROM to send real email.",
    errors: sendErrors.length ? sendErrors : undefined,
  });
}

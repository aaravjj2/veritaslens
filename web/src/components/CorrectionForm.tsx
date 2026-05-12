"use client";

import { useState } from "react";
import Link from "next/link";

export function CorrectionForm({ shareToken }: { shareToken: string }) {
  const [text, setText] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">(
    "idle",
  );
  const [msg, setMsg] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setMsg(null);
    try {
      const res = await fetch("/api/corrections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          share_token: shareToken,
          correction_text: text.trim(),
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setStatus("err");
        setMsg(data.error ?? "Could not submit");
        return;
      }
      setStatus("ok");
      setMsg("Submitted for community review (pending).");
      setText("");
    } catch {
      setStatus("err");
      setMsg("Network error");
    }
  }

  return (
    <section className="rounded-xl border border-white/10 bg-white/5 p-4">
      <h2 className="text-lg font-medium text-white">Community correction</h2>
      <p className="mt-1 text-sm text-slate-400">
        If you believe this automated analysis is wrong, suggest a correction.
        You must be signed in. This does not change the public link until a
        moderator workflow exists.
      </p>
      <p className="mt-2 text-xs text-slate-500">
        <Link href="/login" className="text-indigo-300 underline">
          Sign in
        </Link>{" "}
        to submit.
      </p>
      <form onSubmit={(ev) => void submit(ev)} className="mt-4 space-y-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          required
          minLength={8}
          maxLength={4000}
          className="w-full rounded-lg border border-white/10 bg-black/40 p-3 text-sm text-slate-100 outline-none ring-indigo-500/30 focus:ring-2"
          placeholder="Explain what should be corrected and why (factual, neutral tone)."
        />
        <button
          type="submit"
          disabled={status === "sending" || text.trim().length < 8}
          className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-white hover:bg-slate-600 disabled:bg-slate-800"
        >
          {status === "sending" ? "Submitting…" : "Submit correction"}
        </button>
        {msg && (
          <p
            className={
              status === "ok" ? "text-sm text-emerald-300" : "text-sm text-rose-300"
            }
            role="status"
          >
            {msg}
          </p>
        )}
      </form>
    </section>
  );
}

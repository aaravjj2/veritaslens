"use client";

import { useMemo, useState } from "react";
import { createSupabaseBrowser } from "@/lib/supabase/browser";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [message, setMessage] = useState<string | null>(null);

  const supabase = useMemo(() => {
    try {
      return createSupabaseBrowser();
    } catch {
      return null;
    }
  }, []);

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) {
      setStatus("error");
      setMessage("Supabase is not configured (missing public URL / anon key).");
      return;
    }
    setStatus("sending");
    setMessage(null);
    const redirectTo = `${window.location.origin}/auth/callback`;
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: redirectTo },
    });
    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }
    setStatus("sent");
    setMessage("Check your email for the magic link.");
  }

  return (
    <form onSubmit={(ev) => void sendLink(ev)} className="space-y-4">
      <label className="block text-sm text-slate-300">
        Email
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-slate-100 outline-none ring-indigo-500/30 focus:ring-2"
          placeholder="you@example.com"
          autoComplete="email"
        />
      </label>
      <button
        type="submit"
        disabled={status === "sending" || status === "sent"}
        className="w-full rounded-lg bg-indigo-500 py-2.5 text-sm font-semibold text-white disabled:bg-slate-600"
      >
        {status === "sending" ? "Sending…" : "Email magic link"}
      </button>
      {message && (
        <p
          className={
            status === "error" ? "text-sm text-rose-300" : "text-sm text-emerald-300"
          }
          role="status"
        >
          {message}
        </p>
      )}
    </form>
  );
}

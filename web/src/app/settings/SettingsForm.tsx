"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function SettingsForm() {
  const [lang, setLang] = useState("en");
  const [digest, setDigest] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/account");
        if (res.status === 401) {
          setNote("sign_in_required");
          return;
        }
        const data = (await res.json()) as {
          language_pref?: string;
          digest_weekly?: boolean;
          note?: string;
        };
        setLang(data.language_pref ?? "en");
        setDigest(Boolean(data.digest_weekly));
        if (data.note) setNote(data.note);
      } catch {
        setNote("load_failed");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setNote(null);
    try {
      const res = await fetch("/api/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language_pref: lang,
          digest_weekly: digest,
        }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setNote(data.error ?? "Save failed");
        return;
      }
      setNote("saved");
    } catch {
      setNote("Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-400">Loading…</p>;
  }

  if (note === "sign_in_required") {
    return (
      <p className="text-sm text-slate-300">
        <Link href="/login" className="text-indigo-300 underline">
          Sign in
        </Link>{" "}
        to manage preferences.
      </p>
    );
  }

  return (
    <form onSubmit={(ev) => void save(ev)} className="max-w-md space-y-6">
      <label className="block text-sm text-slate-300">
        Preferred UI / analysis language (ISO 639-1)
        <input
          value={lang}
          onChange={(e) => setLang(e.target.value)}
          maxLength={8}
          className="mt-1 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-slate-100"
        />
      </label>
      <label className="flex items-center gap-2 text-sm text-slate-300">
        <input
          type="checkbox"
          checked={digest}
          onChange={(e) => setDigest(e.target.checked)}
        />
        Weekly misinformation digest email (requires Supabase + future mail
        provider; cron hits{" "}
        <code className="rounded bg-black/50 px-1 text-xs">/api/cron/digest</code>
        )
      </label>
      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white disabled:bg-slate-600"
      >
        {saving ? "Saving…" : "Save preferences"}
      </button>
      {note && note !== "sign_in_required" && (
        <p
          className={
            note === "saved" ? "text-sm text-emerald-300" : "text-sm text-rose-300"
          }
        >
          {note === "saved" ? "Saved." : note}
        </p>
      )}
    </form>
  );
}

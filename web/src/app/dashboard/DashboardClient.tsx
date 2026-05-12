"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const HISTORY_KEY = "veritaslens_share_history";

type Row = {
  share_token: string;
  language: string;
  created_at: string;
  input_text: string;
};

type Correction = {
  id: string;
  analysis_id: string;
  correction_text: string;
  status: string;
  created_at: string;
};

export default function DashboardClient() {
  const [remote, setRemote] = useState<Row[] | null>(null);
  const [corrections, setCorrections] = useState<Correction[] | null>(null);
  const [localIds, setLocalIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [authNote, setAuthNote] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      setLocalIds(raw ? (JSON.parse(raw) as string[]) : []);
    } catch {
      setLocalIds([]);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [resA, resC] = await Promise.all([
          fetch("/api/analyses/me"),
          fetch("/api/corrections"),
        ]);

        let nextCorrections: Correction[] | null = null;
        if (resC.ok) {
          const cj = (await resC.json()) as { corrections?: Correction[] };
          nextCorrections = cj.corrections ?? [];
        }

        if (resA.status === 401) {
          if (!cancelled) {
            setRemote(null);
            setAuthNote("Sign in to load cloud history from Supabase.");
          }
        } else if (!resA.ok) {
          if (!cancelled) {
            setRemote([]);
            setAuthNote("Could not load server history.");
          }
        } else {
          const data = (await resA.json()) as { analyses?: Row[] };
          if (!cancelled) {
            setRemote(data.analyses ?? []);
            setAuthNote(null);
          }
        }

        if (!cancelled) {
          setCorrections(nextCorrections);
        }
      } catch {
        if (!cancelled) {
          setRemote([]);
          setCorrections(null);
          setAuthNote("Could not load server history.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const showRemote = remote && remote.length > 0;
  const showLocal = localIds.length > 0;
  const showCorrections = corrections && corrections.length > 0;

  if (loading) {
    return <p className="text-sm text-slate-400">Loading history…</p>;
  }

  return (
    <div className="space-y-8">
      {authNote && (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          {authNote}{" "}
          <Link href="/login" className="text-indigo-300 underline">
            Sign in
          </Link>
        </p>
      )}

      {showRemote && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Your account (Supabase)
          </h2>
          <ul className="space-y-2">
            {remote!.map((row) => (
              <li key={row.share_token}>
                <Link
                  href={`/analysis/${row.share_token}`}
                  className="block rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm hover:border-indigo-400/50"
                >
                  <span className="text-slate-200">
                    {row.input_text.slice(0, 120)}
                    {row.input_text.length > 120 ? "…" : ""}
                  </span>
                  <div className="mt-1 font-mono text-xs text-slate-500">
                    {row.language} ·{" "}
                    {new Date(row.created_at).toLocaleString()} ·{" "}
                    {row.share_token}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {showCorrections && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Your correction submissions
          </h2>
          <ul className="space-y-2">
            {corrections!.map((c) => (
              <li
                key={c.id}
                className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300"
              >
                <span className="text-xs uppercase text-slate-500">
                  {c.status}
                </span>
                <p className="mt-1 text-slate-200">{c.correction_text}</p>
                <p className="mt-1 font-mono text-xs text-slate-500">
                  {new Date(c.created_at).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {showLocal && (
        <section>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
            This device (recent share IDs)
          </h2>
          <ul className="space-y-2">
            {localIds.map((id) => (
              <li key={id}>
                <Link
                  href={`/analysis/${id}`}
                  className="block rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm hover:border-indigo-400/50"
                >
                  Open shared analysis{" "}
                  <span className="font-mono text-xs text-slate-400">{id}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {!showRemote && !showLocal && (
        <p className="rounded-lg border border-dashed border-white/15 p-6 text-sm text-slate-400">
          No saved analyses yet.{" "}
          <Link href="/login" className="text-indigo-300 underline">
            Sign in
          </Link>{" "}
          for cloud history, or run an analysis on the{" "}
          <Link href="/analyse" className="text-indigo-300 underline">
            paste page
          </Link>{" "}
          to capture share links locally.
        </p>
      )}
    </div>
  );
}

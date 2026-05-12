"use client";

import { useMemo, useState } from "react";
import { AnalysisResultView } from "@/components/AnalysisResultView";
import type { AnalysisResult } from "@/lib/analysis-schema";
import { readAnalyseNdjsonStream } from "@/lib/ndjson-analyse";

const HISTORY_KEY = "veritaslens_share_history";

function pushHistory(id: string) {
  try {
    const prev = JSON.parse(
      localStorage.getItem(HISTORY_KEY) ?? "[]",
    ) as string[];
    const next = [id, ...prev.filter((x) => x !== id)].slice(0, 50);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export default function AnalysePageClient() {
  const [text, setText] = useState("");
  const [simplified, setSimplified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamPreview, setStreamPreview] = useState("");
  const [result, setResult] = useState<
    (AnalysisResult & { share_id?: string }) | null
  >(null);

  const appOrigin = useMemo(() => {
    if (typeof window === "undefined") return "";
    return window.location.origin;
  }, []);

  async function run() {
    setLoading(true);
    setError(null);
    setResult(null);
    setStreamPreview("");
    try {
      const res = await fetch("/api/analyse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, simplified, stream: true }),
      });

      const ct = res.headers.get("content-type") ?? "";

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        setError(data.error ?? `Request failed (${res.status})`);
        return;
      }

      if (ct.includes("ndjson")) {
        const last = await readAnalyseNdjsonStream(res, (chunk) => {
          setStreamPreview((prev) => prev + chunk);
        });
        if (!last) {
          setError("Empty response stream");
          return;
        }
        if (last.type === "error") {
          setError(last.message);
          return;
        }
        if (last.type === "final") {
          const fin = last as unknown as AnalysisResult & { share_id?: string };
          if (fin.share_id) pushHistory(fin.share_id);
          setResult(fin);
        }
        return;
      }

      const data = (await res.json()) as AnalysisResult & {
        share_id?: string;
        error?: string;
      };
      if (data.error) {
        setError(data.error);
        return;
      }
      if (data.share_id) pushHistory(data.share_id);
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-12">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-white">Paste & analyse</h1>
        <p className="text-slate-400">
          VeritasLens streams the model output, then validates JSON and saves
          your run when Supabase is configured. Sign in to attach analyses to
          your account.
        </p>
      </header>

      <div className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-6">
        <label className="block text-sm font-medium text-slate-200">
          Article or claim text
        </label>
        <textarea
          className="min-h-[200px] w-full rounded-lg border border-white/10 bg-black/40 p-3 text-sm text-slate-100 outline-none ring-indigo-500/40 focus:ring-2"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste suspicious paragraphs here…"
        />
        <label className="flex items-center gap-2 text-sm text-slate-300">
          <input
            type="checkbox"
            checked={simplified}
            onChange={(e) => setSimplified(e.target.checked)}
          />
          Explain like I&apos;m 16 (DigComp-friendly wording)
        </label>
        <button
          type="button"
          disabled={loading || !text.trim()}
          onClick={() => void run()}
          className="rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 disabled:cursor-not-allowed disabled:bg-slate-600"
        >
          {loading ? "Streaming…" : "Run analysis"}
        </button>
        {error && (
          <p className="text-sm text-rose-300" role="alert">
            {error}
          </p>
        )}
      </div>

      {loading && streamPreview && (
        <section className="rounded-xl border border-white/10 bg-black/30 p-4">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Live model output
          </h2>
          <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-words text-xs text-slate-300">
            {streamPreview}
          </pre>
        </section>
      )}

      {result && (
        <AnalysisResultView
          result={result}
          inputText={text}
          shareId={result.share_id}
          appOrigin={appOrigin}
        />
      )}
    </div>
  );
}

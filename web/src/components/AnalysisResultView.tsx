"use client";

import type { AnalysisResult } from "@/lib/analysis-schema";
import { getSourceById } from "@/lib/sources";
import { isTier3Language } from "@/lib/language-tiers";
import { CorrectionForm } from "@/components/CorrectionForm";

function scoreColor(score: number): string {
  if (score < 40) return "bg-rose-500/90";
  if (score < 70) return "bg-amber-400/90";
  return "bg-emerald-500/85";
}

export function AnalysisResultView({
  result,
  inputText,
  shareId,
  appOrigin,
}: {
  result: AnalysisResult;
  inputText: string;
  shareId?: string;
  appOrigin: string;
}) {
  const tier3 = isTier3Language(result.language);
  const shareUrl =
    shareId && appOrigin
      ? `${appOrigin.replace(/\/$/, "")}/analysis/${shareId}`
      : "";

  return (
    <div className="space-y-8">
      {tier3 && (
        <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          This language is lower-resourced for automated analysis. Treat scores
          as indicative and verify with local fact-checkers where possible.
        </p>
      )}

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-wide text-slate-400">
            Overall credibility
          </p>
          <p className="text-5xl font-semibold tabular-nums text-white">
            {result.overall_score}
            <span className="text-2xl text-slate-400">/100</span>
          </p>
          <p className="text-sm text-slate-400">
            Language: <span className="text-slate-200">{result.language}</span>
          </p>
        </div>
        {shareUrl && (
          <div className="flex max-w-md flex-col gap-2">
            <span className="text-xs uppercase tracking-wide text-slate-400">
              Shareable link
            </span>
            <div className="flex gap-2">
              <input
                readOnly
                className="w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-xs text-slate-200"
                value={shareUrl}
              />
              <button
                type="button"
                className="shrink-0 rounded-md bg-indigo-500 px-3 py-2 text-xs font-medium text-white hover:bg-indigo-400"
                onClick={() => {
                  void navigator.clipboard.writeText(shareUrl);
                }}
              >
                Copy
              </button>
            </div>
          </div>
        )}
      </div>

      <section>
        <h2 className="mb-2 text-lg font-medium text-white">Summary</h2>
        <p className="leading-relaxed text-slate-200">{result.summary}</p>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-medium text-white">Detected tactics</h2>
        <div className="flex flex-wrap gap-2">
          {result.tactics.map((t) => (
            <span
              key={t.name + t.explanation.slice(0, 12)}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-100"
              title={t.explanation}
            >
              {t.name.replace(/-/g, " ")} ({t.severity})
            </span>
          ))}
        </div>
        <ul className="mt-4 space-y-3 text-sm text-slate-300">
          {result.tactics.map((t) => (
            <li key={t.name}>
              <span className="font-medium text-white">
                {t.name.replace(/-/g, " ")}
              </span>
              : {t.explanation}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-medium text-white">
          Sentence heatmap
        </h2>
        <p className="mb-3 text-sm text-slate-400">
          Original text with colour-coded risk per sentence (red = higher
          risk).
        </p>
        <HeatmapInline sentences={result.sentences} fallback={inputText} />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-medium text-white">
          EU source pointers
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          {collectSources(result).map((id) => {
            const s = getSourceById(id);
            if (!s) return null;
            return (
              <a
                key={id}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-indigo-200 hover:border-indigo-400/50"
              >
                <div className="font-medium text-white">{s.org_name}</div>
                <div className="text-xs text-slate-400">
                  {s.country} · {s.language.toUpperCase()}
                </div>
              </a>
            );
          })}
        </div>
      </section>

      {shareId && <CorrectionForm shareToken={shareId} />}
    </div>
  );
}

function collectSources(result: AnalysisResult): string[] {
  const ids = new Set<string>();
  for (const s of result.sentences) {
    for (const id of s.source_ids) ids.add(id);
  }
  return [...ids];
}

function HeatmapInline({
  sentences,
  fallback,
}: {
  sentences: AnalysisResult["sentences"];
  fallback: string;
}) {
  if (!sentences.length) {
    return (
      <p className="rounded-lg bg-black/30 p-4 text-sm text-slate-300">
        {fallback}
      </p>
    );
  }

  return (
    <div className="rounded-lg bg-black/40 p-4 text-base leading-8 text-slate-100">
      {sentences.map((s, i) => (
        <span
          key={i}
          className={`mx-0.5 rounded px-1 ${scoreColor(s.score)} text-white shadow-sm`}
          title={`Score ${s.score} · ${s.issues.join(", ")}`}
        >
          {s.text}{" "}
        </span>
      ))}
    </div>
  );
}

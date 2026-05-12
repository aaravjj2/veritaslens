import Link from "next/link";

const links = [
  { href: "/analyse", label: "Web analyser" },
  { href: "/dashboard", label: "History" },
  { href: "/settings", label: "Settings" },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_#312e81_0,_transparent_55%),radial-gradient(circle_at_bottom,_#0f172a_0,_transparent_50%)]" />
      <main className="relative mx-auto flex max-w-5xl flex-col gap-12 px-6 pb-24 pt-20 lg:flex-row lg:items-center">
        <section className="flex-1 space-y-6">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-300">
            Academia EU · Misinformation track
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
            VeritasLens
          </h1>
          <p className="max-w-xl text-lg text-slate-300">
            AI-assisted credibility analysis for European news: sentence-level
            heatmaps, named manipulation tactics, and citations grounded in a
            curated IFCN-style EU source list—never hallucinated URLs.
          </p>
          <div className="flex flex-wrap gap-3">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-full bg-indigo-500 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/40 transition hover:bg-indigo-400"
              >
                {l.label}
              </Link>
            ))}
            <a
              href="https://digital-strategy.ec.europa.eu/en/policies/digital-services-act-package"
              className="rounded-full border border-white/15 px-5 py-2 text-sm text-slate-200 hover:border-indigo-400/60"
              target="_blank"
              rel="noreferrer"
            >
            EU policy context
            </a>
          </div>
          <ul className="grid gap-3 text-sm text-slate-400 sm:grid-cols-2">
            <li>· Multilingual analysis (EU-24 coverage goal)</li>
            <li>· Shareable analysis permalinks</li>
            <li>· Browser extension + PWA web app</li>
            <li>· Transparency-first JSON reasoning trace</li>
          </ul>
        </section>
        <section className="flex-1 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl shadow-black/40 backdrop-blur">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-300">
            Live demo
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            Install the packaged extension for inline highlights on real sites,
            or open the web analyser to paste suspicious paragraphs. Configure{" "}
            <code className="rounded bg-black/40 px-1 py-0.5 text-xs">
              ANTHROPIC_API_KEY
            </code>{" "}
            and optional Supabase keys in{" "}
            <code className="rounded bg-black/40 px-1 py-0.5 text-xs">.env</code>{" "}
            for full persistence.
          </p>
        </section>
      </main>
    </div>
  );
}

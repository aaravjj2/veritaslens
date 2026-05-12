import { AnalysisResultView } from "@/components/AnalysisResultView";
import { loadAnalysisByShareToken } from "@/lib/load-analysis";

export const dynamic = "force-dynamic";

export default async function AnalysisSharePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await loadAnalysisByShareToken(id);
  const origin =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ??
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "");

  if (!data) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center text-slate-300">
        <h1 className="text-2xl font-semibold text-white">
          Analysis not found
        </h1>
        <p className="mt-2 text-sm">
          The link may be invalid or the server was restarted while using the
          in-memory demo store.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <p className="mb-6 text-xs uppercase tracking-wide text-slate-500">
        Shared analysis · {new Date(data.created_at).toLocaleString()}
      </p>
      <AnalysisResultView
        result={data.result_json}
        inputText={data.input_text}
        shareId={data.share_token}
        appOrigin={origin || "http://localhost:3000"}
      />
    </div>
  );
}

import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { memoryGetByToken } from "@/lib/memory-store";
import type { AnalysisResult } from "@/lib/analysis-schema";

export type StoredAnalysis = {
  share_token: string;
  input_text: string;
  result_json: AnalysisResult;
  language: string;
  created_at: string;
};

export async function loadAnalysisByShareToken(
  id: string,
): Promise<StoredAnalysis | null> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data, error } = await supabase
      .from("analyses")
      .select("share_token, input_text, result_json, language, created_at")
      .eq("share_token", id)
      .maybeSingle();
    if (error || !data) return null;
    return data as StoredAnalysis;
  }
  const row = memoryGetByToken(id);
  if (!row) return null;
  return {
    share_token: row.share_token,
    input_text: row.input_text,
    result_json: row.result_json,
    language: row.language,
    created_at: row.created_at,
  };
}

import type { AnalysisResult } from "./analysis-schema";
import { getSupabaseAdmin } from "./supabase-admin";
import { memoryInsert } from "./memory-store";

export type PersistAnalysisOutcome = {
  error: string | null;
  analysisId: string | null;
};

export async function persistAnalysisRecord(params: {
  shareToken: string;
  text: string;
  result: AnalysisResult;
  userId: string | null;
}): Promise<PersistAnalysisOutcome> {
  const { shareToken, text, result, userId } = params;
  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data, error } = await supabase
      .from("analyses")
      .insert({
        share_token: shareToken,
        input_text: text,
        result_json: result,
        language: result.language,
        user_id: userId,
      })
      .select("id")
      .single();
    if (error) {
      return { error: error.message, analysisId: null };
    }
    return { error: null, analysisId: data?.id as string };
  }
  const row = memoryInsert({
    share_token: shareToken,
    input_text: text,
    result_json: result,
    language: result.language,
    user_id: userId,
  });
  return { error: null, analysisId: row.id };
}

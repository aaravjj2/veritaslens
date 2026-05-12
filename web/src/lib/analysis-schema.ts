import { z } from "zod";

export const TACTIC_NAMES = [
  "cherry-picking",
  "false-equivalence",
  "loaded-language",
  "false-authority",
  "emotional-manipulation",
  "out-of-context",
  "misleading-statistics",
  "conspiracy-framing",
  "no-issues",
] as const;

export type TacticName = (typeof TACTIC_NAMES)[number];

const tacticNameSchema = z.enum(TACTIC_NAMES);

const sentenceSchema = z.object({
  text: z.string(),
  score: z.number().min(0).max(100),
  issues: z.array(tacticNameSchema),
  source_ids: z.array(z.string()),
});

const tacticSchema = z.object({
  name: tacticNameSchema,
  explanation: z.string(),
  severity: z.enum(["low", "medium", "high"]),
});

export const analysisResultSchema = z.object({
  language: z.string().min(2).max(8),
  overall_score: z.number().min(0).max(100),
  summary: z.string(),
  tactics: z.array(tacticSchema),
  sentences: z.array(sentenceSchema),
});

export type AnalysisResult = z.infer<typeof analysisResultSchema>;

export function normalizeScore(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.min(100, Math.max(0, Math.round(n)));
}

export function stripJsonFences(raw: string): string {
  let s = raw.trim();
  if (s.startsWith("```")) {
    s = s.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  }
  return s.trim();
}

export function parseAnalysisJson(raw: string): unknown {
  const cleaned = stripJsonFences(raw);
  return JSON.parse(cleaned);
}

export function validateSourceIds(
  sourceIds: string[],
  allowed: Set<string>,
): { valid: boolean; invalid: string[] } {
  const invalid = sourceIds.filter((id) => !allowed.has(id));
  return { valid: invalid.length === 0, invalid };
}

export function sanitizeAnalysisResult(
  parsed: unknown,
  allowedSourceIds: Set<string>,
): AnalysisResult {
  const base = analysisResultSchema.parse(parsed);
  const filteredSentences = base.sentences.map((s) => ({
    ...s,
    score: normalizeScore(s.score),
    source_ids: s.source_ids.filter((id) => allowedSourceIds.has(id)),
  }));
  return {
    ...base,
    overall_score: normalizeScore(base.overall_score),
    sentences: filteredSentences,
  };
}

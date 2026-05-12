import { randomUUID } from "crypto";
import type { AnalysisResult } from "./analysis-schema";

type Row = {
  id: string;
  share_token: string;
  input_text: string;
  result_json: AnalysisResult;
  language: string;
  created_at: string;
  user_id: string | null;
};

const store = new Map<string, Row>();

export type MemoryCorrection = {
  id: string;
  analysis_id: string;
  user_id: string;
  correction_text: string;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

const corrections: MemoryCorrection[] = [];

export function memoryInsert(row: Omit<Row, "created_at" | "id"> & { id?: string }): Row {
  const full: Row = {
    ...row,
    id: row.id ?? randomUUID(),
    created_at: new Date().toISOString(),
  };
  store.set(full.share_token, full);
  return full;
}

export function memoryGetByToken(token: string): Row | undefined {
  return store.get(token);
}

export function memoryListByUser(userId: string): Row[] {
  return [...store.values()]
    .filter((r) => r.user_id === userId)
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}

export function memoryInsertCorrection(params: {
  analysisId: string;
  userId: string;
  correctionText: string;
}): MemoryCorrection {
  const rec: MemoryCorrection = {
    id: randomUUID(),
    analysis_id: params.analysisId,
    user_id: params.userId,
    correction_text: params.correctionText,
    status: "pending",
    created_at: new Date().toISOString(),
  };
  corrections.push(rec);
  return rec;
}

export function memoryListCorrectionsByUser(userId: string): MemoryCorrection[] {
  return corrections
    .filter((c) => c.user_id === userId)
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}

/** Test-only: clears in-memory analyses and corrections. */
export function clearMemoryStoresForTests(): void {
  store.clear();
  corrections.length = 0;
}

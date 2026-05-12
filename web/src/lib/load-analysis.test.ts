import { describe, expect, it, beforeEach } from "vitest";
import { loadAnalysisByShareToken } from "@/lib/load-analysis";
import { clearMemoryStoresForTests, memoryInsert } from "@/lib/memory-store";
import type { AnalysisResult } from "@/lib/analysis-schema";

const minimal: AnalysisResult = {
  language: "en",
  overall_score: 90,
  summary: "Ok",
  tactics: [
    {
      name: "no-issues",
      explanation: "Fine",
      severity: "low",
    },
  ],
  sentences: [
    {
      text: "Hello.",
      score: 90,
      issues: ["no-issues"],
      source_ids: [],
    },
  ],
};

describe("loadAnalysisByShareToken", () => {
  beforeEach(() => {
    clearMemoryStoresForTests();
  });

  it("reads analyses from the in-memory store", async () => {
    memoryInsert({
      share_token: "aaaaaaaa-bbbb-4ccc-dddd-eeeeeeeeeeee",
      input_text: "Hello world",
      result_json: minimal,
      language: "en",
      user_id: null,
    });

    const row = await loadAnalysisByShareToken(
      "aaaaaaaa-bbbb-4ccc-dddd-eeeeeeeeeeee",
    );
    expect(row?.input_text).toBe("Hello world");
    expect(row?.result_json.overall_score).toBe(90);
  });

  it("returns null when share token is unknown", async () => {
    const row = await loadAnalysisByShareToken(
      "00000000-0000-4000-8000-000000000099",
    );
    expect(row).toBeNull();
  });
});

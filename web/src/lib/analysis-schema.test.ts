import { describe, expect, it } from "vitest";
import {
  analysisResultSchema,
  normalizeScore,
  parseAnalysisJson,
  sanitizeAnalysisResult,
  stripJsonFences,
  validateSourceIds,
} from "@/lib/analysis-schema";

const allowed = new Set(["euvsdisinfo", "correctiv"]);

const minimal = {
  language: "en",
  overall_score: 55,
  summary: "Test summary.",
  tactics: [
    {
      name: "cherry-picking",
      explanation: "Example",
      severity: "medium",
    },
  ],
  sentences: [
    {
      text: "A test sentence.",
      score: 40,
      issues: ["misleading-statistics" as const],
      source_ids: ["euvsdisinfo", "bogus-id"],
    },
  ],
};

describe("analysis-schema", () => {
  it("parses JSON with markdown fences", () => {
    const raw = "```json\n{\"a\":1}\n```";
    expect(stripJsonFences(raw)).toBe("{\"a\":1}");
  });

  it("validates tactic names strictly", () => {
    const bad = {
      ...minimal,
      sentences: [
        {
          ...minimal.sentences[0],
          issues: ["not-a-real-tactic"],
        },
      ],
    };
    expect(() => analysisResultSchema.parse(bad)).toThrow();
  });

  it("sanitizes unknown source ids", () => {
    const res = sanitizeAnalysisResult(minimal, allowed);
    expect(res.sentences[0].source_ids).toEqual(["euvsdisinfo"]);
  });

  it("validateSourceIds reports invalid entries", () => {
    expect(validateSourceIds(["euvsdisinfo", "nope"], allowed)).toEqual({
      valid: false,
      invalid: ["nope"],
    });
  });

  it("parseAnalysisJson accepts object", () => {
    const obj = parseAnalysisJson(JSON.stringify(minimal));
    expect(() => sanitizeAnalysisResult(obj, allowed)).not.toThrow();
  });

  it("normalizeScore clamps", () => {
    expect(normalizeScore(-5)).toBe(0);
    expect(normalizeScore(120)).toBe(100);
  });
});

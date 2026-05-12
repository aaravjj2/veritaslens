import { describe, expect, it } from "vitest";
import { readAnalyseNdjsonStream } from "@/lib/ndjson-analyse";

describe("readAnalyseNdjsonStream", () => {
  it("aggregates deltas and returns final event", async () => {
    const payload =
      `${JSON.stringify({ type: "delta", text: "{" })}\n` +
      `${JSON.stringify({ type: "delta", text: "}" })}\n` +
      `${JSON.stringify({
        type: "final",
        language: "en",
        overall_score: 50,
        summary: "S",
        tactics: [],
        sentences: [],
        share_id: "11111111-1111-4111-8111-111111111111",
      })}\n`;

    const res = new Response(
      new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(payload));
          controller.close();
        },
      }),
      { headers: { "content-type": "application/x-ndjson" } },
    );

    let deltas = "";
    const last = await readAnalyseNdjsonStream(res, (t) => {
      deltas += t;
    });

    expect(deltas).toBe("{}");
    expect(last?.type).toBe("final");
    if (last && last.type === "final") {
      expect((last as { share_id?: string }).share_id).toBe(
        "11111111-1111-4111-8111-111111111111",
      );
    }
  });
});

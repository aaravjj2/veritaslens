import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { runAnalysis, streamAnalysisTextDeltas } from "@/lib/claude-analyse";
import {
  parseAnalysisJson,
  sanitizeAnalysisResult,
} from "@/lib/analysis-schema";
import { getAllowedSourceIds } from "@/lib/sources";
import { persistAnalysisRecord } from "@/lib/persist-analysis";
import { resolveSessionOrExtensionUserId } from "@/lib/session-or-extension-user";

export const runtime = "nodejs";

const MAX_CHARS = 12_000;

type NdJsonLine =
  | { type: "delta"; text: string }
  | { type: "final" } & Record<string, unknown>
  | { type: "error"; message: string };

export async function POST(req: Request) {
  let body: { text?: string; simplified?: boolean; stream?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  const simplified = Boolean(body.simplified);
  const useStream = body.stream !== false;

  if (!text) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }
  if (text.length > MAX_CHARS) {
    return NextResponse.json(
      { error: `text exceeds maximum length (${MAX_CHARS})` },
      { status: 400 },
    );
  }

  const allowed = getAllowedSourceIds();
  const userId = await resolveSessionOrExtensionUserId(req);

  if (!useStream) {
    return runNonStreaming(text, simplified, allowed, userId);
  }

  const encoder = new TextEncoder();
  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (obj: NdJsonLine) => {
        controller.enqueue(encoder.encode(`${JSON.stringify(obj)}\n`));
      };
      try {
        let raw = "";
        for await (const delta of streamAnalysisTextDeltas(text, simplified)) {
          raw += delta;
          send({ type: "delta", text: delta });
        }

        let parsed: unknown;
        try {
          parsed = parseAnalysisJson(raw);
        } catch {
          send({ type: "error", message: "Model returned invalid JSON" });
          return;
        }

        let result;
        try {
          result = sanitizeAnalysisResult(parsed, allowed);
        } catch (e) {
          const msg = e instanceof Error ? e.message : "Validation failed";
          send({ type: "error", message: msg });
          return;
        }

        const shareToken = randomUUID();
        const { error } = await persistAnalysisRecord({
          shareToken,
          text,
          result,
          userId,
        });
        if (error) {
          send({
            type: "error",
            message: `Failed to persist analysis: ${error}`,
          });
          return;
        }

        send({ type: "final", ...result, share_id: shareToken });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Claude request failed";
        send({ type: "error", message: msg });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

async function runNonStreaming(
  text: string,
  simplified: boolean,
  allowed: Set<string>,
  userId: string | null,
) {
  let raw: string;
  try {
    raw = await runAnalysis(text, simplified);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Claude request failed";
    const status = msg.includes("ANTHROPIC_API_KEY") ? 503 : 502;
    return NextResponse.json({ error: msg }, { status });
  }

  let parsed: unknown;
  try {
    parsed = parseAnalysisJson(raw);
  } catch {
    return NextResponse.json(
      { error: "Model returned invalid JSON" },
      { status: 502 },
    );
  }

  let result;
  try {
    result = sanitizeAnalysisResult(parsed, allowed);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Validation failed";
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  const shareToken = randomUUID();
  const { error } = await persistAnalysisRecord({
    shareToken,
    text,
    result,
    userId,
  });
  if (error) {
    return NextResponse.json(
      { error: "Failed to persist analysis", detail: error },
      { status: 500 },
    );
  }

  return NextResponse.json({ ...result, share_id: shareToken });
}

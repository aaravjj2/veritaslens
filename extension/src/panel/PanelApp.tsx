/// <reference types="chrome" />

import { useMemo, useState } from "react";

const STORAGE_TOKEN_KEY = "veritasLensExtensionToken";

function getStoredBearerToken(): Promise<string | null> {
  return new Promise((resolve) => {
    if (typeof chrome === "undefined" || !chrome.storage?.local) {
      resolve(null);
      return;
    }
    chrome.storage.local.get([STORAGE_TOKEN_KEY], (items) => {
      const v = items[STORAGE_TOKEN_KEY];
      resolve(typeof v === "string" && v.trim() ? v.trim() : null);
    });
  });
}

type Analysis = {
  language: string;
  overall_score: number;
  summary: string;
  tactics: { name: string; explanation: string; severity: string }[];
  sentences: {
    text: string;
    score: number;
    issues: string[];
    source_ids: string[];
  }[];
  share_id?: string;
};

type StreamMsg =
  | { type: "delta"; text: string }
  | ({ type: "final" } & Analysis & { share_id: string })
  | { type: "error"; message: string };

function readParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    text: params.get("text") ?? "",
    apiBase: params.get("apiBase") ?? "http://localhost:3000",
  };
}

async function consumeNdjson(
  res: Response,
  onDelta: (t: string) => void,
): Promise<StreamMsg | null> {
  const reader = res.body?.getReader();
  if (!reader) return null;
  const decoder = new TextDecoder();
  let buffer = "";
  let last: StreamMsg | null = null;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n");
    buffer = parts.pop() ?? "";
    for (const line of parts) {
      const t = line.trim();
      if (!t) continue;
      const msg = JSON.parse(t) as StreamMsg;
      if (msg.type === "delta") onDelta(msg.text);
      else last = msg;
    }
  }
  const tail = buffer.trim();
  if (tail) {
    const msg = JSON.parse(tail) as StreamMsg;
    if (msg.type === "delta") onDelta(msg.text);
    else last = msg;
  }
  return last;
}

export function PanelApp() {
  const { text: initialText, apiBase } = useMemo(readParams, []);
  const [text, setText] = useState(initialText);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState<Analysis | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    setResult(null);
    setPreview("");
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      const bearer = await getStoredBearerToken();
      if (bearer) headers.Authorization = `Bearer ${bearer}`;

      const res = await fetch(`${apiBase.replace(/\/$/, "")}/api/analyse`, {
        method: "POST",
        headers,
        body: JSON.stringify({ text, stream: true }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        setError(data.error ?? "Request failed");
        return;
      }

      const ct = res.headers.get("content-type") ?? "";
      if (ct.includes("ndjson")) {
        const last = await consumeNdjson(res, (d) =>
          setPreview((p) => p + d),
        );
        if (!last) {
          setError("Empty stream");
          return;
        }
        if (last.type === "error") {
          setError(last.message);
          return;
        }
        if (last.type === "final") {
          setResult(last);
        }
        return;
      }

      const data = (await res.json()) as Analysis & { error?: string };
      if (data.error) {
        setError(data.error);
        return;
      }
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 12 }}>
      <header>
        <h1 style={{ margin: 0, fontSize: 18 }}>VeritasLens</h1>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: "#94a3b8" }}>
          Inline panel · API: {apiBase}
        </p>
      </header>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        style={{
          width: "100%",
          borderRadius: 8,
          border: "1px solid #1e293b",
          background: "#020617",
          color: "#e2e8f0",
          padding: 8,
          fontSize: 13,
        }}
      />
      <button
        type="button"
        disabled={loading || !text.trim()}
        onClick={() => void run()}
        style={{
          borderRadius: 8,
          border: "none",
          padding: "10px 12px",
          fontWeight: 600,
          background: "#6366f1",
          color: "white",
          cursor: loading ? "wait" : "pointer",
        }}
      >
        {loading ? "Streaming…" : "Run analysis"}
      </button>
      {error && (
        <p style={{ color: "#fecaca", fontSize: 12 }} role="alert">
          {error}
        </p>
      )}
      {loading && preview.length > 0 && (
        <pre
          style={{
            maxHeight: 120,
            overflow: "auto",
            fontSize: 11,
            color: "#94a3b8",
            margin: 0,
            whiteSpace: "pre-wrap",
          }}
        >
          {preview}
        </pre>
      )}
      {result && (
        <section style={{ fontSize: 13, lineHeight: 1.5 }}>
          <p style={{ margin: 0, fontSize: 28, fontWeight: 600 }}>
            {result.overall_score}
            <span style={{ fontSize: 14, color: "#94a3b8" }}>/100</span>
          </p>
          <p style={{ color: "#cbd5f5" }}>{result.summary}</p>
          <ul style={{ paddingLeft: 16 }}>
            {result.tactics.map((t) => (
              <li key={t.name}>
                <strong>{t.name}</strong> ({t.severity}): {t.explanation}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

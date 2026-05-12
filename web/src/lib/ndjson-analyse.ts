export type AnalyseStreamEvent =
  | { type: "delta"; text: string }
  | { type: "error"; message: string }
  | ({ type: "final" } & Record<string, unknown>);

/**
 * Reads newline-delimited JSON events from a fetch Response body (VeritasLens /api/analyse stream).
 */
export async function readAnalyseNdjsonStream(
  res: Response,
  onDelta: (chunk: string) => void,
): Promise<AnalyseStreamEvent | null> {
  const reader = res.body?.getReader();
  if (!reader) return null;
  const decoder = new TextDecoder();
  let buffer = "";
  let last: AnalyseStreamEvent | null = null;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const parts = buffer.split("\n");
    buffer = parts.pop() ?? "";
    for (const line of parts) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      const msg = JSON.parse(trimmed) as AnalyseStreamEvent;
      if (msg.type === "delta") onDelta(msg.text);
      else last = msg;
    }
  }
  const tail = buffer.trim();
  if (tail) {
    const msg = JSON.parse(tail) as AnalyseStreamEvent;
    if (msg.type === "delta") onDelta(msg.text);
    else last = msg;
  }
  return last;
}

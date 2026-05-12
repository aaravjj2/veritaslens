import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT, SIMPLIFIED_ADDON } from "@/lib/prompts/analyse";
import { getSourceListForPrompt } from "@/lib/sources";

const model =
  process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-20250514";

function buildUserContent(text: string) {
  const sourceList = getSourceListForPrompt();
  return `INPUT_TEXT:\n${text}\n\nSOURCE_LIST:\n${JSON.stringify(sourceList)}`;
}

export async function* streamAnalysisTextDeltas(
  text: string,
  simplified: boolean,
): AsyncGenerator<string, void, undefined> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }
  const client = new Anthropic({ apiKey });
  const userContent = buildUserContent(text);

  const stream = await client.messages.create({
    model,
    max_tokens: 4096,
    system: SYSTEM_PROMPT + (simplified ? SIMPLIFIED_ADDON : ""),
    messages: [{ role: "user", content: userContent }],
    stream: true,
  });

  for await (const event of stream) {
    if (event.type === "content_block_delta") {
      const delta = event.delta;
      if (delta.type === "text_delta") {
        yield delta.text;
      }
    }
  }
}

export async function runAnalysis(
  text: string,
  simplified: boolean,
): Promise<string> {
  let acc = "";
  for await (const d of streamAnalysisTextDeltas(text, simplified)) {
    acc += d;
  }
  return acc;
}

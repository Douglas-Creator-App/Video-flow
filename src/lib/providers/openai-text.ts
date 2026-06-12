import { ensureProviderCredentials } from "@/lib/providers/credentials";
import { estimateOpenAiTextCost, estimateTextTokens, friendlyProviderError, jsonHeaders, providerMissing, sanitizePrompt } from "@/lib/providers/provider-utils";

export async function generateText(input: {
  systemPrompt: string;
  userPrompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}) {
  const startedAt = Date.now();
  await ensureProviderCredentials();
  const apiKey = process.env.OPENAI_API_KEY;
  const systemPrompt = sanitizePrompt(input.systemPrompt, 4000);
  const userPrompt = sanitizePrompt(input.userPrompt, 12000);
  const model = input.model ?? "gpt-4.1-mini";

  if (!apiKey) {
    const text = mockText(userPrompt);
    const inputTokens = estimateTextTokens(`${systemPrompt} ${userPrompt}`);
    const outputTokens = estimateTextTokens(text);
    return { status: "completed" as const, providerMode: "mock" as const, provider: "openai", model, text, inputTokens, outputTokens, cost: 0, durationMs: Date.now() - startedAt, warning: providerMissing("OPENAI_API_KEY") };
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: jsonHeaders(apiKey),
      body: JSON.stringify({
        model,
        instructions: systemPrompt,
        input: userPrompt,
        temperature: input.temperature ?? 0.7,
        max_output_tokens: input.maxTokens ?? 1200
      })
    });

    if (!response.ok) throw new Error(await response.text());
    const data = await response.json();
    const text = extractOutputText(data) || mockText(userPrompt);
    const usage = data.usage ?? {};
    const inputTokens = usage.input_tokens ?? estimateTextTokens(`${systemPrompt} ${userPrompt}`);
    const outputTokens = usage.output_tokens ?? estimateTextTokens(text);
    return { status: "completed" as const, providerMode: "real" as const, provider: "openai", model, text, inputTokens, outputTokens, cost: estimateOpenAiTextCost(inputTokens, outputTokens), durationMs: Date.now() - startedAt, warning: null };
  } catch (error) {
    const text = mockText(userPrompt);
    const inputTokens = estimateTextTokens(`${systemPrompt} ${userPrompt}`);
    const outputTokens = estimateTextTokens(text);
    return { status: "fallback" as const, providerMode: "fallback" as const, provider: "openai", model, text, inputTokens, outputTokens, cost: 0, durationMs: Date.now() - startedAt, warning: friendlyProviderError("OpenAI Text", error) };
  }
}

function extractOutputText(data: unknown) {
  if (typeof data !== "object" || data === null) return "";
  const record = data as { output_text?: string; output?: Array<{ content?: Array<{ text?: string }> }> };
  if (record.output_text) return record.output_text;
  return record.output?.flatMap((item) => item.content ?? []).map((content) => content.text ?? "").join("\n").trim() ?? "";
}

function mockText(prompt: string) {
  return `Resposta mockada Video Flow para: ${prompt.slice(0, 180)}\n\nProvider nao configurado ou indisponivel. Fluxo preservado sem expor secrets.`;
}

import { getProviderKey } from "@/lib/providers/credentials";
import type { AiCompletionInput, AiCompletionResult, AiProviderAdapter } from "@/lib/ai/provider-types";

export class OpenAiProvider implements AiProviderAdapter {
  async generate(input: AiCompletionInput): Promise<AiCompletionResult> {
    const apiKey = getProviderKey("OPENAI_API_KEY");
    if (!apiKey) {
      throw new Error("OPENAI_API_KEY não configurada no backend.");
    }

    const startedAt = Date.now();
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: input.model,
        instructions: input.systemPrompt,
        input: input.userPrompt,
        temperature: input.temperature ?? 0.7,
        max_output_tokens: input.maxTokens ?? 1200
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI respondeu com erro ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const text = extractOutputText(data);
    const usage = data.usage ?? {};

    return {
      text,
      inputTokens: usage.input_tokens ?? 0,
      outputTokens: usage.output_tokens ?? 0,
      durationMs: Date.now() - startedAt
    };
  }
}

function extractOutputText(data: unknown) {
  if (typeof data !== "object" || data === null) return "";
  const record = data as { output_text?: string; output?: Array<{ content?: Array<{ text?: string }> }> };
  if (record.output_text) return record.output_text;
  return record.output?.flatMap((item) => item.content ?? []).map((content) => content.text ?? "").join("\n").trim() ?? "";
}

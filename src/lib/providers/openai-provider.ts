import { generateText } from "@/lib/providers/openai-text";
import { providerMissing } from "@/lib/providers/provider-utils";
import { getProviderKey } from "@/lib/providers/credentials";

export interface OpenAiTextInput {
  systemPrompt: string;
  userPrompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  allowFallback?: boolean;
}

export async function generateOpenAiTextStrict(input: OpenAiTextInput) {
  if (!getProviderKey("OPENAI_API_KEY")) throw new Error(providerMissing("OPENAI_API_KEY"));
  const result = await generateText({
    systemPrompt: input.systemPrompt,
    userPrompt: input.userPrompt,
    model: input.model ?? process.env.OPENAI_TEXT_MODEL,
    temperature: input.temperature,
    maxTokens: input.maxTokens
  });
  if (result.providerMode !== "real" && !input.allowFallback) {
    throw new Error(result.warning ?? "OpenAI indisponível. Geração real não concluída.");
  }
  return result;
}

export function openAiTextConfigured() {
  return Boolean(getProviderKey("OPENAI_API_KEY"));
}

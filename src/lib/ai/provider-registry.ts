import type { AiProviderType } from "@/lib/types";
import type { AiCompletionInput, AiCompletionResult, AiProviderAdapter } from "@/lib/ai/provider-types";
import { OpenAiProvider } from "@/lib/ai/openai-provider";

class UnsupportedProvider implements AiProviderAdapter {
  constructor(private readonly name: string) {}

  async generate(_input: AiCompletionInput): Promise<AiCompletionResult> {
    throw new Error(`${this.name} está preparado na arquitetura, mas ainda não foi conectado nesta fase.`);
  }
}

export function getAiProvider(provider: AiProviderType): AiProviderAdapter {
  if (provider === "openai") return new OpenAiProvider();
  if (provider === "gemini") return new UnsupportedProvider("Gemini");
  return new UnsupportedProvider("Claude");
}

import type { AiProviderType } from "@/lib/types";

export interface AiCompletionInput {
  provider: AiProviderType;
  model: string;
  systemPrompt: string;
  userPrompt: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AiCompletionResult {
  text: string;
  inputTokens: number;
  outputTokens: number;
  durationMs: number;
}

export interface AiProviderAdapter {
  generate(input: AiCompletionInput): Promise<AiCompletionResult>;
}

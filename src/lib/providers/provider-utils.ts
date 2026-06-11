export type ProviderMode = "real" | "mock" | "fallback";

export function sanitizePrompt(value: string, maxLength = 8000) {
  return value.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

export function estimateTextTokens(text: string) {
  return Math.max(1, Math.ceil(text.length / 4));
}

export function estimateOpenAiTextCost(inputTokens: number, outputTokens: number) {
  return Number(((inputTokens / 1_000_000) * 0.4 + (outputTokens / 1_000_000) * 1.6).toFixed(6));
}

export function providerMissing(name: string) {
  return `${name} nao configurado; fallback mockado utilizado.`;
}

export function jsonHeaders(apiKey?: string) {
  return {
    ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    "Content-Type": "application/json"
  };
}

export function friendlyProviderError(provider: string, error: unknown) {
  if (error instanceof Error) return `${provider} falhou: ${error.message}`;
  return `${provider} falhou com erro desconhecido.`;
}

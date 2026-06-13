import { getProviderKey } from "@/lib/providers/credentials";
import { friendlyProviderError, providerMissing, sanitizePrompt } from "@/lib/providers/provider-utils";

export async function generateOpenAiTts(input: { text: string; voice?: string; speed?: number; format?: "mp3" | "wav" | "opus"; model?: string }) {
  const startedAt = Date.now();
  const apiKey = getProviderKey("OPENAI_API_KEY");
  const text = sanitizePrompt(input.text, 4096);
  const voice = input.voice ?? "alloy";
  const format = input.format ?? "mp3";

  if (!apiKey) return mockAudio(text, "mock", providerMissing("OPENAI_API_KEY"), startedAt);

  try {
    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: input.model ?? "gpt-4o-mini-tts", voice, input: text, speed: input.speed ?? 1, response_format: format })
    });
    if (!response.ok) throw new Error(await response.text());
    const bytes = Buffer.from(await response.arrayBuffer());
    return { status: "completed" as const, providerMode: "real" as const, provider: "openai_tts", audioUrl: `data:audio/${format};base64,${bytes.toString("base64")}`, durationSeconds: estimateDuration(text), cost: Number((text.length * 0.000015).toFixed(6)), durationMs: Date.now() - startedAt, warning: null };
  } catch (error) {
    return mockAudio(text, "fallback", friendlyProviderError("OpenAI TTS", error), startedAt);
  }
}

function mockAudio(text: string, providerMode: "mock" | "fallback", warning: string, startedAt: number) {
  return { status: "completed" as const, providerMode, provider: "openai_tts", audioUrl: "/media/mock-narration.mp3", durationSeconds: estimateDuration(text), cost: 0, durationMs: Date.now() - startedAt, warning };
}

function estimateDuration(text: string) {
  return Math.max(2, Math.round(text.length / 14));
}

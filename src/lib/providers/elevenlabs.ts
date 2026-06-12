import { ensureProviderCredentials } from "@/lib/providers/credentials";
import { friendlyProviderError, providerMissing, sanitizePrompt } from "@/lib/providers/provider-utils";

const elevenBaseUrl = "https://api.elevenlabs.io/v1";

export async function listElevenLabsVoices() {
  await ensureProviderCredentials();
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) return { status: "completed" as const, providerMode: "mock" as const, voices: mockVoices(), warning: providerMissing("ELEVENLABS_API_KEY") };
  try {
    const response = await fetch(`${elevenBaseUrl}/voices`, { headers: { "xi-api-key": apiKey } });
    if (!response.ok) throw new Error(await response.text());
    const data = await response.json();
    return { status: "completed" as const, providerMode: "real" as const, voices: data.voices ?? [], warning: null };
  } catch (error) {
    return { status: "completed" as const, providerMode: "fallback" as const, voices: mockVoices(), warning: friendlyProviderError("ElevenLabs", error) };
  }
}

export async function generateElevenLabsSpeech(input: { text: string; voiceId?: string; model?: string }) {
  const startedAt = Date.now();
  await ensureProviderCredentials();
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const text = sanitizePrompt(input.text, 5000);
  const voiceId = input.voiceId ?? "21m00Tcm4TlvDq8ikWAM";
  if (!apiKey) return mockSpeech(text, "mock", providerMissing("ELEVENLABS_API_KEY"), startedAt);
  try {
    const response = await fetch(`${elevenBaseUrl}/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: { "xi-api-key": apiKey, "Content-Type": "application/json", Accept: "audio/mpeg" },
      body: JSON.stringify({ text, model_id: input.model ?? "eleven_multilingual_v2", voice_settings: { stability: 0.45, similarity_boost: 0.75 } })
    });
    if (!response.ok) throw new Error(await response.text());
    const bytes = Buffer.from(await response.arrayBuffer());
    return { status: "completed" as const, providerMode: "real" as const, provider: "elevenlabs", audioUrl: `data:audio/mpeg;base64,${bytes.toString("base64")}`, durationSeconds: Math.max(2, Math.round(text.length / 14)), cost: Number((text.length * 0.00003).toFixed(6)), durationMs: Date.now() - startedAt, warning: null };
  } catch (error) {
    return mockSpeech(text, "fallback", friendlyProviderError("ElevenLabs", error), startedAt);
  }
}

export async function testElevenLabsVoice(voiceId?: string) {
  return generateElevenLabsSpeech({ voiceId, text: "Teste de voz do Video Flow." });
}

function mockVoices() {
  return [
    { voice_id: "alloy", name: "Alloy Mock", category: "fallback" },
    { voice_id: "nova", name: "Nova Mock", category: "fallback" },
    { voice_id: "verse", name: "Verse Mock", category: "fallback" }
  ];
}

function mockSpeech(text: string, providerMode: "mock" | "fallback", warning: string, startedAt: number) {
  return { status: "completed" as const, providerMode, provider: "elevenlabs", audioUrl: "/media/mock-narration.mp3", durationSeconds: Math.max(2, Math.round(text.length / 14)), cost: 0, durationMs: Date.now() - startedAt, warning };
}

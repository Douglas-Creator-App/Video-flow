import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { openAiTextConfigured } from "@/lib/providers/openai-provider";
import { imageProviderStatus } from "@/lib/providers/image-provider";
import { ttsProviderStatus } from "@/lib/providers/tts-provider";
import { videoProviderStatus } from "@/lib/providers/video-provider";
import { isSupabaseStorageConfigured } from "@/lib/storage/media-storage";

export async function GET() {
  await requireAuth();
  const checks = [
    { provider: "OpenAI Text", type: "text", configured: openAiTextConfigured(), env: "OPENAI_API_KEY" },
    { provider: "OpenAI TTS", type: "tts", configured: ttsProviderStatus().openai_tts, env: "OPENAI_API_KEY" },
    { provider: "ElevenLabs", type: "tts", configured: ttsProviderStatus().elevenlabs, env: "ELEVENLABS_API_KEY" },
    { provider: "OpenAI Images", type: "image", configured: imageProviderStatus().openai_images, env: "OPENAI_API_KEY" },
    ...Object.entries(videoProviderStatus()).map(([provider, configured]) => ({ provider, type: "video", configured, env: `${provider.toUpperCase()}_API_KEY` })),
    { provider: "Supabase Storage", type: "storage", configured: isSupabaseStorageConfigured(), env: "SUPABASE_SERVICE_ROLE_KEY" }
  ];
  return NextResponse.json({
    status: "ok",
    fallback_allowed: process.env.PROVIDER_ALLOW_MOCK_FALLBACK === "true",
    checks: checks.map((item) => ({ ...item, status: item.configured ? "available" : "missing_key", masked_key: item.configured ? maskEnv(item.env) : null }))
  });
}

function maskEnv(name: string) {
  const value = process.env[name];
  if (!value) return null;
  return `${value.slice(0, 3)}••••••${value.slice(-4)}`;
}

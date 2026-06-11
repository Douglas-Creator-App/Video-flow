import { logMediaUsage, logProviderUsage } from "@/lib/billing/credit-ledger";
import { generateElevenLabsSpeech } from "@/lib/providers/elevenlabs";
import { generateOpenAiTts } from "@/lib/providers/openai-tts";
import { buildWorkspaceStoragePath, uploadMediaFile, isSupabaseStorageConfigured } from "@/lib/storage/media-storage";

export interface TtsProviderInput {
  workspaceId: string;
  userId?: string;
  text: string;
  voiceId?: string;
  provider?: "openai_tts" | "elevenlabs";
  model?: string;
  speed?: number;
  referenceId?: string;
  allowFallback?: boolean;
}

export async function generateTtsReal(input: TtsProviderInput) {
  const provider = input.provider ?? (process.env.DEFAULT_TTS_PROVIDER as "openai_tts" | "elevenlabs" | undefined) ?? "openai_tts";
  const result = provider === "elevenlabs"
    ? await generateElevenLabsSpeech({ text: input.text, voiceId: input.voiceId, model: input.model })
    : await generateOpenAiTts({ text: input.text, voice: input.voiceId ?? "alloy", model: input.model ?? process.env.OPENAI_TTS_MODEL, speed: input.speed, format: "mp3" });

  if (result.providerMode !== "real" && !input.allowFallback) {
    throw new Error(result.warning ?? `${provider} indisponível. Narração real não concluída.`);
  }

  let storageUrl = result.audioUrl;
  if (result.providerMode === "real" && isSupabaseStorageConfigured() && result.audioUrl.startsWith("data:")) {
    const bytes = Buffer.from(result.audioUrl.split(",")[1] ?? "", "base64");
    const object = await uploadMediaFile({
      bucket: "audio",
      objectPath: buildWorkspaceStoragePath({ workspaceId: input.workspaceId, resourceType: "tts", fileId: String(input.referenceId ?? Date.now()), extension: "mp3" }),
      data: bytes,
      contentType: "audio/mpeg"
    });
    storageUrl = object.url;
  }

  await logMediaUsage({ workspaceId: input.workspaceId, userId: input.userId, provider: result.provider, actionType: "tts_generation", units: result.durationSeconds, cost: result.cost, referenceId: input.referenceId });
  await logProviderUsage({ workspaceId: input.workspaceId, userId: input.userId, jobId: input.referenceId, provider: result.provider, model: input.model, taskType: "tts_generation", inputUnits: input.text.length, outputUnits: result.durationSeconds, costEstimate: result.cost, status: "completed" });
  return { ...result, storageUrl, audioUrl: storageUrl, voiceId: input.voiceId ?? "alloy" };
}

export function ttsProviderStatus() {
  return {
    openai_tts: Boolean(process.env.OPENAI_API_KEY),
    elevenlabs: Boolean(process.env.ELEVENLABS_API_KEY)
  };
}

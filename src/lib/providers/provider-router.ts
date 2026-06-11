import { generateOpenAiTextStrict } from "@/lib/providers/openai-provider";
import { generateImagesReal } from "@/lib/providers/image-provider";
import { generateTtsReal } from "@/lib/providers/tts-provider";
import { generateAiVideoReal } from "@/lib/providers/video-provider";

export type ProviderTaskType = "text" | "metadata" | "tts" | "image" | "video" | "speech_to_text" | "transcription" | "thumbnail" | "moderation";

export async function runProviderTask(input: {
  type: ProviderTaskType;
  workspaceId?: string;
  userId?: string;
  prompt?: string;
  systemPrompt?: string;
  text?: string;
  style?: string;
  aspectRatio?: string;
  quantity?: number;
  voiceId?: string;
  provider?: string;
  referenceId?: string;
  allowFallback?: boolean;
}) {
  const allowFallback = input.allowFallback ?? process.env.PROVIDER_ALLOW_MOCK_FALLBACK === "true";
  if (input.type === "text" || input.type === "metadata" || input.type === "moderation") {
    return generateOpenAiTextStrict({
      systemPrompt: input.systemPrompt ?? "Você é o motor de conteúdo do Video Flow.",
      userPrompt: input.prompt ?? input.text ?? "",
      allowFallback
    });
  }
  if (input.type === "tts") {
    return generateTtsReal({
      workspaceId: input.workspaceId ?? "ws_1",
      userId: input.userId,
      text: input.text ?? input.prompt ?? "",
      voiceId: input.voiceId,
      provider: input.provider === "elevenlabs" ? "elevenlabs" : "openai_tts",
      referenceId: input.referenceId,
      allowFallback
    });
  }
  if (input.type === "image" || input.type === "thumbnail") {
    return generateImagesReal({
      workspaceId: input.workspaceId ?? "ws_1",
      userId: input.userId,
      prompt: input.prompt ?? "",
      style: input.style,
      aspectRatio: input.aspectRatio ?? (input.type === "thumbnail" ? "16:9" : "9:16"),
      quantity: input.quantity ?? 1,
      referenceId: input.referenceId,
      allowFallback
    });
  }
  if (input.type === "video") {
    return generateAiVideoReal({ task: "text_to_video", prompt: input.prompt ?? "", provider: input.provider as never });
  }
  if (input.type === "speech_to_text" || input.type === "transcription") {
    throw new Error("Transcrição real ainda não configurada. Defina provider de speech-to-text antes de executar.");
  }
  throw new Error(`Tipo de provider não suportado: ${input.type}`);
}

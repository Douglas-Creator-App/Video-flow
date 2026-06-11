import { generateOpenAiImages } from "@/lib/providers/openai-images";
import { generateOpenAiTts } from "@/lib/providers/openai-tts";

export async function generateOpenAiSpeech(input: {
  text: string;
  voiceId: string;
  model?: string;
  speed?: number;
  emotion?: string;
}) {
  const result = await generateOpenAiTts({ text: input.text, voice: input.voiceId, speed: input.speed, model: input.model, format: "mp3" });
  return { audioUrl: result.audioUrl, durationSeconds: result.durationSeconds, status: result.status, providerMode: result.providerMode === "mock" ? "demo" as const : result.providerMode, warning: result.warning };
}

export async function generateOpenAiImage(input: {
  prompt: string;
  style: string;
  aspectRatio: string;
  quantity: number;
}) {
  const result = await generateOpenAiImages({ prompt: input.prompt, style: input.style, aspectRatio: input.aspectRatio, quantity: input.quantity });
  return { imageUrl: result.imageUrl, status: result.status, providerMode: result.providerMode === "mock" ? "demo" as const : result.providerMode, warning: result.warning };
}

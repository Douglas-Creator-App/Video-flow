import { ensureProviderCredentials } from "@/lib/providers/credentials";

export type VideoProviderTask = "text_to_video" | "image_to_video" | "talking_character";

export interface VideoProviderInput {
  task: VideoProviderTask;
  provider?: "runway" | "kling" | "pika" | "veo" | "luma";
  prompt: string;
  inputImageUrl?: string;
  durationSeconds?: number;
}

const keyByProvider: Record<string, string> = {
  runway: "RUNWAY_API_KEY",
  kling: "KLING_API_KEY",
  pika: "PIKA_API_KEY",
  veo: "VEO_API_KEY",
  luma: "LUMA_API_KEY"
};

export async function generateAiVideoReal(input: VideoProviderInput): Promise<Record<string, unknown>> {
  await ensureProviderCredentials();
  const provider = input.provider ?? (process.env.DEFAULT_VIDEO_PROVIDER as VideoProviderInput["provider"]) ?? "runway";
  const envKey = keyByProvider[provider];
  if (!process.env[envKey]) throw new Error(`${envKey} ausente. Provider de vídeo IA não configurado.`);
  throw new Error(`Provider ${provider} ainda exige adapter HTTP específico. Nenhum vídeo real foi gerado.`);
}

export function videoProviderStatus() {
  return Object.fromEntries(Object.entries(keyByProvider).map(([provider, key]) => [provider, Boolean(process.env[key])]));
}

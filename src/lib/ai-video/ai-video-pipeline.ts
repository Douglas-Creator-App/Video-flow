import type { AiVideoProviderType } from "@/lib/types";

export const motionPrompts = [
  "Movimento cinematografico suave",
  "Zoom lento dramatico",
  "Camera se aproximando",
  "Camera se afastando",
  "Movimento epico",
  "Movimento documental",
  "Movimento de batalha",
  "Movimento religioso contemplativo",
  "Movimento misterioso",
  "Movimento anime"
];

const realProviderCosts: Record<Exclude<AiVideoProviderType, "mock">, { base: number; perSecond: number }> = {
  runway: { base: 8, perSecond: 1.2 },
  kling: { base: 7, perSecond: 1.1 },
  pika: { base: 6, perSecond: 0.9 },
  luma: { base: 7, perSecond: 1 },
  veo: { base: 12, perSecond: 1.8 }
};

const realProviders = new Set<AiVideoProviderType>(["runway", "kling", "pika", "luma", "veo"]);

export function normalizeAiVideoProvider(value: unknown): AiVideoProviderType {
  const provider = String(value ?? "").toLowerCase() as AiVideoProviderType;
  return realProviders.has(provider) ? provider : "mock";
}

export function isSupportedRealVideoProvider(provider: AiVideoProviderType): provider is Exclude<AiVideoProviderType, "mock"> {
  return realProviders.has(provider) && provider !== "mock";
}

export function estimateAiVideoCost(provider: AiVideoProviderType, durationSeconds: number) {
  if (!isSupportedRealVideoProvider(provider)) return 0;
  const config = realProviderCosts[provider];
  return Number((config.base + config.perSecond * Math.max(1, durationSeconds)).toFixed(2));
}

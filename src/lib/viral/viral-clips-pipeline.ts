import type {
  VideoAspectRatio,
  ViralClipDurationMode,
  ViralClipOutputFormat,
  ViralCostEstimate,
  ViralSourceType
} from "@/lib/types";

export const viralSteps = [
  { status: "downloading_source", label: "Validando fonte", progress: 12 },
  { status: "extracting_audio", label: "Extraindo audio", progress: 24 },
  { status: "transcribing", label: "Transcrevendo", progress: 42 },
  { status: "analyzing_moments", label: "Analisando momentos", progress: 64 },
  { status: "generating_clips", label: "Gerando cortes", progress: 78 },
  { status: "rendering", label: "Renderizando", progress: 92 },
  { status: "completed", label: "Concluido", progress: 100 }
] as const;

export function validateSourceUrl(sourceUrl: string): { sourceType: ViralSourceType; valid: boolean; reason?: string } {
  try {
    const url = new URL(sourceUrl);
    const host = url.hostname.replace(/^www\./, "");
    const isYoutube = host === "youtube.com" || host === "youtu.be" || host === "m.youtube.com";
    if (!isYoutube) return { sourceType: "youtube", valid: false, reason: "Nesta fase, apenas URLs do YouTube sao aceitas." };
    return { sourceType: "youtube", valid: true };
  } catch {
    return { sourceType: "youtube", valid: false, reason: "URL invalida." };
  }
}

export function aspectRatioForOutput(format: ViralClipOutputFormat): VideoAspectRatio {
  if (format === "horizontal") return "16:9";
  if (format === "square") return "1:1";
  return "9:16";
}

export function secondsForClipDuration(mode: ViralClipDurationMode, customSeconds?: number) {
  if (mode === "auto") return 32;
  if (mode === "custom") return Math.max(10, Math.min(customSeconds ?? 30, 180));
  return Number(mode.replace("s", ""));
}

export function estimateViralCost(input: { durationSeconds: number; clipsQuantity: number; renderClips?: boolean }): ViralCostEstimate {
  const processingCost = roundCredits(Math.max(1.2, input.durationSeconds / 600));
  const transcriptionCost = roundCredits(Math.max(1.8, input.durationSeconds * 0.006));
  const analysisCost = roundCredits(Math.max(1.5, input.clipsQuantity * 0.7));
  const renderCost = roundCredits(input.renderClips === false ? 0 : input.clipsQuantity * 1.25);
  return {
    processingCost,
    transcriptionCost,
    analysisCost,
    renderCost,
    totalCredits: roundCredits(processingCost + transcriptionCost + analysisCost + renderCost)
  };
}

export function titleFromUrl(sourceUrl: string) {
  const validation = validateSourceUrl(sourceUrl);
  if (!validation.valid) return "Video externo";
  return "Fonte YouTube processada";
}

function roundCredits(value: number) {
  return Math.round(value * 10) / 10;
}

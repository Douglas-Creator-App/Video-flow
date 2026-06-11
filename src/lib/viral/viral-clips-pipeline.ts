import type {
  ReframeMode,
  SourceVideo,
  TranscriptSegment,
  VideoAspectRatio,
  VideoTranscript,
  ViralClip,
  ViralClipDurationMode,
  ViralClipJob,
  ViralClipOutputFormat,
  ViralClipPipelineResult,
  ViralCostEstimate,
  ViralMoment,
  ViralSourceType,
  ViralSubtitleStyle
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

export async function runViralClipsPipeline(input: {
  workspaceId?: string;
  projectId: string;
  userId?: string;
  sourceUrl: string;
  outputFormat: ViralClipOutputFormat;
  clipDurationMode: ViralClipDurationMode;
  clipDurationSeconds?: number;
  clipsQuantity: number;
  subtitleStyle: ViralSubtitleStyle;
  removeSilence: boolean;
  reframeVertical: boolean;
  reframeMode: ReframeMode;
  rightsConfirmed: boolean;
  renderNow?: boolean;
}): Promise<ViralClipPipelineResult> {
  const validation = validateSourceUrl(input.sourceUrl);
  if (!input.rightsConfirmed) throw new Error("Confirme que voce possui direito de uso deste conteudo.");
  if (!validation.valid) throw new Error(validation.reason ?? "Fonte invalida.");

  if (!input.workspaceId) throw new Error("workspaceId obrigatorio para Viral Clips.");
  const workspaceId = input.workspaceId;
  const userId = input.userId ?? "system";
  const jobId = `viral_job_${Date.now()}`;
  const sourceVideo = processSourceVideo({
    workspaceId,
    projectId: input.projectId,
    sourceUrl: input.sourceUrl,
    sourceType: validation.sourceType
  });
  const costEstimate = estimateViralCost({
    durationSeconds: sourceVideo.durationSeconds,
    clipsQuantity: input.clipsQuantity,
    renderClips: input.renderNow
  });
  const transcript = transcribeSourceVideo(workspaceId, sourceVideo);
  const clipDuration = secondsForClipDuration(input.clipDurationMode, input.clipDurationSeconds);
  const moments = analyzeViralMoments({
    workspaceId,
    jobId,
    sourceVideoId: sourceVideo.id,
    segments: transcript.segments,
    quantity: input.clipsQuantity,
    clipDuration
  });
  const clips = input.renderNow === false ? [] : renderViralClips({
    workspaceId,
    jobId,
    sourceVideoId: sourceVideo.id,
    moments,
    aspectRatio: aspectRatioForOutput(input.outputFormat),
    subtitleStyle: input.subtitleStyle,
    reframeMode: input.reframeMode
  });

  const job: ViralClipJob = {
    id: jobId,
    workspaceId,
    projectId: input.projectId,
    userId,
    sourceUrl: input.sourceUrl,
    sourceType: validation.sourceType,
    outputFormat: input.outputFormat,
    aspectRatio: aspectRatioForOutput(input.outputFormat),
    clipDurationMode: input.clipDurationMode,
    clipDurationSeconds: clipDuration,
    clipsQuantity: input.clipsQuantity,
    subtitleStyle: input.subtitleStyle,
    removeSilence: input.removeSilence,
    reframeVertical: input.reframeVertical,
    reframeMode: input.reframeMode,
    rightsConfirmed: input.rightsConfirmed,
    status: input.renderNow === false ? "analyzing_moments" : "completed",
    progress: input.renderNow === false ? 64 : 100,
    currentStep: input.renderNow === false ? "Momentos sugeridos para revisao" : "Cortes renderizados",
    estimatedCost: costEstimate.totalCredits,
    finalCost: input.renderNow === false ? undefined : costEstimate.totalCredits,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  return {
    job,
    sourceVideo: { ...sourceVideo, transcriptId: transcript.id },
    transcript,
    moments,
    clips,
    logs: [
      "Direitos de uso confirmados",
      "URL do YouTube validada",
      "Download real nao executado nesta fase; fonte mock segura criada",
      "Audio extraido via placeholder",
      "Transcricao mock concluida",
      `${moments.length} momentos virais sugeridos`,
      input.renderNow === false ? "Aguardando revisao antes do render" : `${clips.length} cortes renderizados como placeholder`
    ],
    costEstimate
  };
}

function processSourceVideo(input: { workspaceId: string; projectId: string; sourceUrl: string; sourceType: ViralSourceType }): SourceVideo {
  return {
    id: `source_video_${Date.now()}`,
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    sourceUrl: input.sourceUrl,
    sourceType: input.sourceType,
    title: titleFromUrl(input.sourceUrl),
    durationSeconds: 1840,
    thumbnailUrl: "/media/mock-thumbnail-1.jpg",
    localVideoUrl: "/media/mock-source-video.mp4",
    localAudioUrl: "/media/mock-narration.mp3",
    status: "ready",
    createdAt: new Date().toISOString()
  };
}

function transcribeSourceVideo(workspaceId: string, sourceVideo: SourceVideo): VideoTranscript {
  const segments: TranscriptSegment[] = [
    { start: 12, end: 20, text: "O erro mais comum e tentar publicar todos os dias sem um sistema." },
    { start: 42, end: 55, text: "Quando voce cria um fluxo, a equipe para de depender de inspiracao." },
    { start: 78, end: 96, text: "O melhor corte comeca quando existe uma promessa simples e visual." },
    { start: 121, end: 146, text: "Se a primeira frase nao segura, o resto do video vira detalhe invisivel." },
    { start: 188, end: 218, text: "Transforme uma explicacao longa em uma promessa, um exemplo e uma acao." },
    { start: 260, end: 294, text: "Um bom corte tem dor, virada e beneficio em menos de um minuto." },
    { start: 360, end: 392, text: "A pergunta certa no inicio faz o publico esperar pela resposta." }
  ];
  return {
    id: `transcript_${Date.now()}`,
    workspaceId,
    sourceVideoId: sourceVideo.id,
    provider: "mock",
    language: "pt-BR",
    fullText: segments.map((segment) => segment.text).join(" "),
    segments,
    durationSeconds: sourceVideo.durationSeconds,
    status: "completed",
    createdAt: new Date().toISOString()
  };
}

function analyzeViralMoments(input: { workspaceId: string; jobId: string; sourceVideoId: string; segments: TranscriptSegment[]; quantity: number; clipDuration: number }): ViralMoment[] {
  return input.segments.slice(0, input.quantity).map((segment, index) => {
    const startTime = Math.max(0, segment.start - 3);
    const endTime = startTime + input.clipDuration;
    const score = 92 - index * 4;
    return {
      id: `${input.jobId}_moment_${index + 1}`,
      workspaceId: input.workspaceId,
      viralClipJobId: input.jobId,
      sourceVideoId: input.sourceVideoId,
      startTime,
      endTime,
      title: momentTitle(segment.text, index),
      hook: hookFromSegment(segment.text),
      reason: "Selecionado por conter dor clara, promessa objetiva e frase facil de legendar.",
      viralScore: Math.max(70, score),
      retentionScore: Math.max(68, score - 5),
      clarityScore: Math.max(72, score - 2),
      transcriptExcerpt: segment.text,
      status: "suggested",
      createdAt: new Date().toISOString()
    };
  });
}

function renderViralClips(input: { workspaceId: string; jobId: string; sourceVideoId: string; moments: ViralMoment[]; aspectRatio: VideoAspectRatio; subtitleStyle: ViralSubtitleStyle; reframeMode: ReframeMode }): ViralClip[] {
  return input.moments.map((moment, index) => ({
    id: `${input.jobId}_clip_${index + 1}`,
    workspaceId: input.workspaceId,
    viralClipJobId: input.jobId,
    sourceVideoId: input.sourceVideoId,
    viralMomentId: moment.id,
    title: moment.title,
    startTime: moment.startTime,
    endTime: moment.endTime,
    durationSeconds: Math.round(moment.endTime - moment.startTime),
    aspectRatio: input.aspectRatio,
    subtitleStyle: input.subtitleStyle,
    reframeMode: input.reframeMode,
    renderUrl: "/media/mock-render.mp4",
    thumbnailUrl: `/media/mock-thumbnail-${(index % 6) + 1}.jpg`,
    status: "completed",
    createdAt: new Date().toISOString()
  }));
}

function titleFromUrl(sourceUrl: string) {
  const validation = validateSourceUrl(sourceUrl);
  if (!validation.valid) return "Video externo";
  return "Fonte YouTube processada";
}

function momentTitle(text: string, index: number) {
  const titles = [
    "O erro que trava seus cortes",
    "A promessa que prende atencao",
    "A primeira frase decide tudo",
    "Dor, virada e beneficio",
    "A pergunta que segura a audiencia"
  ];
  return titles[index] ?? text.slice(0, 54);
}

function hookFromSegment(text: string) {
  if (text.length < 62) return text;
  return `${text.slice(0, 59)}...`;
}

function roundCredits(value: number) {
  return Math.round(value * 10) / 10;
}

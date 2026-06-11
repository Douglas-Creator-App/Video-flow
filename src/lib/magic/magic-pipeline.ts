import { generateOpenAiImage, generateOpenAiSpeech } from "@/lib/media/openai-media";
import { generateText } from "@/lib/providers/openai-text";
import type {
  MagicAdvancedSettings,
  MagicCostEstimate,
  MagicDurationTarget,
  MagicJobStatus,
  MagicNarrativeType,
  MagicPipelineResult,
  MagicScenePlan,
  MagicVideoFormat,
  MagicVideoJob,
  MagicVisualSource,
  MagicVisualStyle,
  MotionType,
  SubtitleSegment,
  TransitionType,
  VideoAspectRatio,
  VideoFormat,
  VideoProject,
  VideoScene
} from "@/lib/types";

export const narrativeInstructions: Record<MagicNarrativeType, string> = {
  historia_real: "Construa como uma historia real, com contexto, conflito, virada e aprendizado.",
  historia_religiosa: "Use tom reverente, linguagem clara e cenas contemplativas inspiradas em relatos espirituais.",
  curiosidade: "Abra com uma pergunta forte, revele fatos em ordem crescente e feche com surpresa.",
  documentario: "Use narracao editorial, contexto historico, evidencias e conclusao objetiva.",
  misterio: "Crie tensao progressiva, pistas, perguntas abertas e revelacao controlada.",
  top_5: "Organize em cinco pontos curtos, cada um com gancho proprio.",
  top_10: "Organize em dez pontos muito escaneaveis, com ritmo alto.",
  comparativo: "Compare lados com criterios claros, exemplos e veredito equilibrado.",
  motivacional: "Use linguagem direta, emocional e orientada a acao.",
  educacional: "Explique passo a passo, com exemplos simples e CTA pratico.",
  canal_dark: "Use suspense, curiosidade e tom profundo, sem prometer fatos nao verificados.",
  biografia: "Conte origem, conflito, decisao importante, consequencia e legado.",
  noticias: "Resuma fato, contexto, impacto e proximos desdobramentos com tom neutro.",
  roteiro_personalizado: "Preserve o roteiro enviado e apenas organize a montagem por cenas."
};

export const magicSteps: Array<{ status: MagicJobStatus; label: string; progress: number }> = [
  { status: "generating_script", label: "Criando roteiro", progress: 12 },
  { status: "generating_scenes", label: "Separando cenas", progress: 25 },
  { status: "generating_voice", label: "Gerando narracao", progress: 40 },
  { status: "generating_images", label: "Gerando imagens", progress: 58 },
  { status: "generating_subtitles", label: "Criando legendas", progress: 72 },
  { status: "selecting_music", label: "Selecionando musica", progress: 82 },
  { status: "generating_thumbnail", label: "Criando thumbnail", progress: 90 },
  { status: "creating_video_project", label: "Montando projeto", progress: 96 },
  { status: "ready_for_editor", label: "Pronto para editar", progress: 100 }
];

export function aspectRatioFromFormat(format: MagicVideoFormat): VideoAspectRatio {
  if (format === "horizontal" || format === "youtube_long") return "16:9";
  if (format === "square") return "1:1";
  return "9:16";
}

export function videoFormatFromMagic(format: MagicVideoFormat): VideoFormat {
  if (format === "youtube_long" || format === "horizontal") return "youtube_long";
  if (format === "square") return "square";
  if (format === "shorts") return "short";
  if (format === "vertical") return "reels";
  return format;
}

export function secondsFromDuration(target: MagicDurationTarget, customSeconds?: number) {
  if (target === "custom") return Math.max(15, Math.min(customSeconds ?? 60, 1800));
  const map: Record<Exclude<MagicDurationTarget, "custom">, number> = {
    "30s": 30,
    "60s": 60,
    "90s": 90,
    "3m": 180,
    "5m": 300,
    "8m": 480,
    "10m": 600
  };
  return map[target];
}

export function estimateMagicCost(input: {
  durationSeconds: number;
  sceneCount: number;
  subtitleEnabled: boolean;
  musicEnabled: boolean;
  autoThumbnail: boolean;
}): MagicCostEstimate {
  const textCost = roundCredits(Math.max(0.5, input.durationSeconds * 0.018));
  const voiceCost = roundCredits(Math.max(0.8, input.durationSeconds * 0.035));
  const imageCost = roundCredits(input.sceneCount * 0.55);
  const thumbnailCost = input.autoThumbnail ? 1.4 : 0;
  const renderCost = roundCredits(Math.max(1.2, input.durationSeconds * 0.028));
  const musicCost = input.musicEnabled ? 0.6 : 0;
  const subtitleCost = input.subtitleEnabled ? 0.4 : 0;
  return {
    textCost,
    voiceCost,
    imageCost,
    thumbnailCost,
    renderCost,
    totalCredits: roundCredits(textCost + voiceCost + imageCost + thumbnailCost + renderCost + musicCost + subtitleCost)
  };
}

export function splitScriptIntoScenes(input: {
  script: string;
  durationSeconds: number;
  format: MagicVideoFormat;
  desiredSceneCount: number;
  visualStyle: MagicVisualStyle;
}) {
  const compactScript = input.script.replace(/\s+/g, " ").trim();
  const chunks = compactScript.split(/(?<=[.!?])\s+/).filter(Boolean);
  const targetCount = Math.max(3, Math.min(input.desiredSceneCount || sceneCountForDuration(input.durationSeconds, input.format), 32));
  const grouped = Array.from({ length: targetCount }, (_, index) => chunks.filter((_, chunkIndex) => chunkIndex % targetCount === index).join(" "));
  const duration = Math.max(3, Math.round(input.durationSeconds / targetCount));

  return grouped.map<MagicScenePlan>((text, index) => {
    const sceneText = text || `Cena ${index + 1}: detalhe importante sobre ${compactScript.slice(0, 70)}`;
    return {
      order: index + 1,
      text: sceneText,
      durationSeconds: duration,
      visualPrompt: buildVisualPrompt(sceneText, input.visualStyle),
      motionType: motionForIndex(index),
      transitionType: transitionForIndex(index)
    };
  });
}

export function generateSceneVisualPrompts(scenes: MagicScenePlan[], visualStyle: MagicVisualStyle, extraInstructions = "") {
  return scenes.map((scene) => ({
    ...scene,
    visualPrompt: `${buildVisualPrompt(scene.text, visualStyle)} ${extraInstructions}`.trim()
  }));
}

async function generateRealMagicScript(input: {
  theme: string;
  narrativeType: MagicNarrativeType;
  durationSeconds: number;
  format: MagicVideoFormat;
  visualStyle: MagicVisualStyle;
  settings: MagicAdvancedSettings;
}) {
  if (input.narrativeType === "roteiro_personalizado" && input.settings.customScript?.trim()) {
    return input.settings.customScript.trim();
  }

  const instruction = narrativeInstructions[input.narrativeType];
  const response = await generateText({
    systemPrompt: [
      "Voce e um roteirista senior da plataforma Video Flow.",
      "Crie roteiros claros, ritmados e prontos para virar cenas de video.",
      "Nao use markdown complexo. Entregue blocos curtos e narraveis.",
      "Evite promessas falsas, dados inventados e claims medicos/financeiros sem ressalva."
    ].join("\n"),
    userPrompt: [
      `Tema: ${input.theme}`,
      `Formato: ${input.format}`,
      `Duracao alvo: ${input.durationSeconds} segundos`,
      `Narrativa: ${input.narrativeType}`,
      `Direcao narrativa: ${instruction}`,
      `Estilo visual: ${input.visualStyle}`,
      `Idioma: ${input.settings.language}`,
      `Publico: ${input.settings.targetAudience}`,
      `Tom: ${input.settings.narrationTone}`,
      `CTA: ${input.settings.cta || "Convide a pessoa a continuar acompanhando o canal."}`,
      input.settings.scriptInstructions ? `Instrucoes extras: ${input.settings.scriptInstructions}` : "",
      input.settings.forbiddenWords ? `Palavras proibidas: ${input.settings.forbiddenWords}` : "",
      "Estrutura obrigatoria: gancho forte, contexto, desenvolvimento em progressao, virada e CTA final."
    ].filter(Boolean).join("\n"),
    model: "gpt-4.1-mini",
    temperature: 0.75,
    maxTokens: Math.max(700, Math.min(2200, Math.round(input.durationSeconds * 7)))
  });

  if (response.providerMode !== "real") {
    throw new Error(response.warning ?? "OpenAI Text real indisponivel. Configure OPENAI_API_KEY antes de executar o Magic Mode real.");
  }

  return response.text.trim();
}

export async function runMagicVideoPipeline(input: {
  workspaceId?: string;
  projectId: string;
  userId?: string;
  theme: string;
  format: MagicVideoFormat;
  durationTarget: MagicDurationTarget;
  narrativeType: MagicNarrativeType;
  voiceId: string;
  visualStyle: MagicVisualStyle;
  visualSource: MagicVisualSource;
  subtitleEnabled: boolean;
  musicEnabled: boolean;
  autoThumbnail: boolean;
  advancedSettings: MagicAdvancedSettings;
}): Promise<MagicPipelineResult> {
  if (!input.workspaceId) throw new Error("workspaceId obrigatorio para Magic Mode real.");
  const workspaceId = input.workspaceId;
  const durationSeconds = secondsFromDuration(input.durationTarget, input.advancedSettings.customDurationSeconds);
  const sceneCount = input.advancedSettings.sceneCount || sceneCountForDuration(durationSeconds, input.format);
  const aspectRatio = aspectRatioFromFormat(input.format);
  const logs = ["Job recebido", "Validando workspace", "Calculando creditos estimados"];
  const costEstimate = estimateMagicCost({
    durationSeconds,
    sceneCount,
    subtitleEnabled: input.subtitleEnabled,
    musicEnabled: input.musicEnabled,
    autoThumbnail: input.autoThumbnail
  });

  const script = await generateRealMagicScript({
    theme: input.theme,
    narrativeType: input.narrativeType,
    durationSeconds,
    format: input.format,
    visualStyle: input.visualStyle,
    settings: input.advancedSettings
  });
  logs.push("Roteiro criado com OpenAI Text real ou roteiro personalizado preservado");

  const scenePlans = generateSceneVisualPrompts(
    splitScriptIntoScenes({
      script,
      durationSeconds,
      format: input.format,
      desiredSceneCount: sceneCount,
      visualStyle: input.visualStyle
    }),
    input.visualStyle,
    input.advancedSettings.imageInstructions
  );
  logs.push(`${scenePlans.length} cenas planejadas`);

  const speech = await generateOpenAiSpeech({ text: script, voiceId: input.voiceId });
  if (speech.providerMode !== "real") {
    throw new Error(speech.warning ?? "TTS real indisponivel. Configure OPENAI_API_KEY antes de executar o pipeline real.");
  }
  logs.push("Narracao gerada com OpenAI TTS real");

  for (const scene of scenePlans) {
    const image = await generateOpenAiImage({
      prompt: scene.visualPrompt,
      style: input.visualStyle,
      aspectRatio,
      quantity: 1
    });
    if (image.providerMode !== "real") {
      throw new Error(image.warning ?? `Imagem real indisponivel para cena ${scene.order}. Configure OPENAI_API_KEY antes de executar o pipeline real.`);
    }
    scene.generatedImageUrl = image.imageUrl;
    scene.mediaAssetId = createId();
  }
  logs.push(`${scenePlans.length} imagens reais geradas com OpenAI Images`);

  const videoProjectId = createId();
  const videoProject: VideoProject = {
    id: videoProjectId,
    workspaceId,
    projectId: input.projectId,
    title: input.theme,
    format: videoFormatFromMagic(input.format),
    aspectRatio,
    durationTarget: durationSeconds,
    narrationAudioUrl: speech.audioUrl,
    backgroundMusicUrl: undefined,
    subtitleEnabled: input.subtitleEnabled,
    subtitleStyle: "tiktok",
    visualStyle: input.visualStyle,
    status: "ready_to_render",
    thumbnailUrl: input.autoThumbnail ? scenePlans[0]?.generatedImageUrl : undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const videoScenes = scenePlans.map<VideoScene>((scene) => {
    const id = createId();
    scene.mediaAssetId = scene.mediaAssetId ?? createId();
    return {
      id,
      workspaceId,
      videoProjectId,
      orderIndex: scene.order,
      scriptText: scene.text,
      narrationStart: (scene.order - 1) * scene.durationSeconds,
      narrationEnd: scene.order * scene.durationSeconds,
      imagePrompt: scene.visualPrompt,
      mediaAssetId: scene.mediaAssetId,
      durationSeconds: scene.durationSeconds,
      motionType: input.advancedSettings.useOrganicMotion ? "organic_motion" : scene.motionType,
      transitionType: scene.transitionType,
      zoomEnabled: input.advancedSettings.useZoom,
      organicMotionEnabled: input.advancedSettings.useOrganicMotion,
      status: "completed"
    };
  });

  const subtitles = input.subtitleEnabled ? createSubtitles(videoProjectId, workspaceId, videoScenes) : [];
  logs.push("Legendas, movimentos e projeto de video montados");
  if (input.musicEnabled) logs.push("Musica nao foi anexada: nenhum provedor real de trilha esta configurado nesta fase.");
  if (input.autoThumbnail) logs.push("Thumbnail sugerida anexada");

  const job: MagicVideoJob = {
    id: createId(),
    workspaceId,
    projectId: input.projectId,
    userId: input.userId ?? "",
    theme: input.theme,
    format: input.format,
    aspectRatio,
    durationTarget: durationSeconds,
    narrativeType: input.narrativeType,
    voiceId: input.voiceId,
    visualStyle: input.visualStyle,
    visualSource: input.visualSource,
    subtitleEnabled: input.subtitleEnabled,
    musicEnabled: input.musicEnabled,
    autoThumbnail: input.autoThumbnail,
    advancedSettings: input.advancedSettings,
    status: "ready_for_editor",
    progress: 100,
    currentStep: "Pronto para editar",
    videoProjectId,
    costCredits: costEstimate.totalCredits,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  return {
    job,
    script,
    scenes: scenePlans,
    videoProject,
    videoScenes,
    subtitles,
    thumbnailUrl: videoProject.thumbnailUrl,
    logs: logs.filter(Boolean),
    costEstimate
  };
}

function sceneCountForDuration(durationSeconds: number, format: MagicVideoFormat) {
  if (format === "shorts" || format === "reels" || format === "tiktok") return Math.max(5, Math.min(12, Math.round(durationSeconds / 7)));
  return Math.max(8, Math.min(28, Math.round(durationSeconds / 20)));
}

function buildVisualPrompt(text: string, style: MagicVisualStyle) {
  const styleMap: Record<MagicVisualStyle, string> = {
    realista: "realistic professional scene",
    cinematografico: "cinematic lighting, premium composition",
    preto_e_branco: "black and white high contrast documentary frame",
    vintage: "vintage film look, warm grain",
    anime: "anime style, clean line art, expressive lighting",
    manga: "manga inspired frame, dramatic ink shadows",
    documentario: "documentary style, realistic natural light",
    religioso: "reverent spiritual historical scene, warm dramatic light",
    historico: "historical realistic scene, period accurate, dramatic lighting",
    luxo: "luxury dark gold aesthetic, premium shadows",
    sombrio: "dark cinematic atmosphere, suspense, deep shadows",
    futurista: "futuristic sleek interface, neon highlights, premium",
    infantil: "playful bright educational style, soft shapes",
    minimalista: "minimalist editorial composition, clean negative space"
  };
  return `${styleMap[style]}, ${text.slice(0, 180)}, high detail, Video Flow production frame`;
}

function motionForIndex(index: number): MotionType {
  const motions: MotionType[] = ["zoom_in", "pan_left", "pan_right", "zoom_out", "random_subtle"];
  return motions[index % motions.length];
}

function transitionForIndex(index: number): TransitionType {
  const transitions: TransitionType[] = ["fade", "cinematic", "slide"];
  return transitions[index % transitions.length];
}

function createSubtitles(videoProjectId: string, workspaceId: string, scenes: VideoScene[]): SubtitleSegment[] {
  return scenes.map((scene) => ({
    id: createId(),
    workspaceId,
    videoProjectId,
    startTime: scene.narrationStart,
    endTime: scene.narrationEnd,
    text: scene.scriptText.slice(0, 86),
    style: "tiktok",
    position: "bottom"
  }));
}

function roundCredits(value: number) {
  return Math.round(value * 10) / 10;
}

function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `id_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

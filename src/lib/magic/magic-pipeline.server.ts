import { generateOpenAiImage, generateOpenAiSpeech } from "@/lib/media/openai-media";
import { generateText } from "@/lib/providers/openai-text";
import {
  aspectRatioFromFormat,
  createId,
  createSubtitles,
  estimateMagicCost,
  generateSceneVisualPrompts,
  narrativeInstructions,
  sceneCountForDuration,
  secondsFromDuration,
  splitScriptIntoScenes,
  videoFormatFromMagic
} from "@/lib/magic/magic-pipeline";
import type {
  MagicAdvancedSettings,
  MagicDurationTarget,
  MagicNarrativeType,
  MagicPipelineResult,
  MagicVideoFormat,
  MagicVideoJob,
  MagicVisualSource,
  MagicVisualStyle,
  VideoProject,
  VideoScene
} from "@/lib/types";

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
    throw new Error(response.warning ?? "OpenAI Text real indisponivel. Configure sua OPENAI_API_KEY em Configuracao antes de gerar.");
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
    throw new Error(speech.warning ?? "TTS real indisponivel. Configure sua OPENAI_API_KEY em Configuracao antes de gerar.");
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
      throw new Error(image.warning ?? `Imagem real indisponivel para cena ${scene.order}. Configure sua OPENAI_API_KEY em Configuracao antes de gerar.`);
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

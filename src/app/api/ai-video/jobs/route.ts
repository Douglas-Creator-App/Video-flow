import { NextResponse, type NextRequest } from "next/server";
import { aiVideoAssets, imageToVideoJobs, introOutroGenerations, talkingCharacterJobs, textToVideoJobs } from "@/lib/mock-data";
import { requireAuth, requirePermission, requireRateLimit } from "@/lib/auth";
import { canUseFeature } from "@/lib/billing";
import { runImageToVideo, runIntroOutro, runTalkingCharacter, runTextToVideo } from "@/lib/ai-video/ai-video-pipeline";

export async function GET() {
  await requireAuth();
  return NextResponse.json({
    text_to_video_jobs: textToVideoJobs,
    image_to_video_jobs: imageToVideoJobs,
    talking_character_jobs: talkingCharacterJobs,
    intro_outro_generations: introOutroGenerations,
    assets: aiVideoAssets
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const type = body.type ?? "text_to_video";
  try {
    const workspaceId = String(body.workspace_id ?? "");
    if (!workspaceId) return NextResponse.json({ status: "failed", error: "workspace_id obrigatorio." }, { status: 400 });
    const { user } = await requireAuth();
    await requirePermission(workspaceId, "content.create");
    await requireRateLimit({ workspaceId, userId: user.id, feature: "openai_images", route: "/api/ai-video/jobs" });
    const usage = await canUseFeature(workspaceId, "ai_video");
    if (!usage.allowed) return NextResponse.json({ status: "blocked", error: usage.reason, usage }, { status: 402 });

    if (type === "image_to_video") return NextResponse.json({ ...(await runImageToVideo({
      workspaceId,
      videoProjectId: body.video_project_id ?? "video_1",
      sceneId: body.scene_id ?? "scene_1",
      provider: body.provider ?? "mock",
      inputImageUrl: body.input_image_url ?? "/media/mock-scene-1.jpg",
      motionPrompt: body.motion_prompt ?? "Movimento cinematografico suave",
      durationSeconds: Number(body.duration_seconds ?? 5),
      aspectRatio: body.aspect_ratio ?? "9:16"
    })), usage });
    if (type === "talking_character") return NextResponse.json({ ...(await runTalkingCharacter({
      workspaceId,
      projectId: body.project_id ?? "project_1",
      inputImageUrl: body.input_image_url ?? "/media/mock-thumbnail-4.jpg",
      characterDescription: body.character_description ?? "Personagem narrador",
      speechText: body.speech_text ?? "",
      voiceId: body.voice_id ?? "alloy",
      provider: body.provider ?? "mock",
      durationSeconds: Number(body.duration_seconds ?? 8)
    })), usage });
    if (type === "intro" || type === "outro") return NextResponse.json({ ...(await runIntroOutro({
      workspaceId,
      videoProjectId: body.video_project_id ?? "video_1",
      type,
      provider: body.provider ?? "mock",
      prompt: body.prompt ?? "Cena cinematografica",
      durationSeconds: Number(body.duration_seconds ?? 5),
      aspectRatio: body.aspect_ratio ?? "9:16"
    })), usage });
    return NextResponse.json({ ...(await runTextToVideo({
      workspaceId,
      projectId: body.project_id ?? "project_1",
      provider: body.provider ?? "mock",
      prompt: body.prompt ?? "Cena cinematografica Video Flow",
      negativePrompt: body.negative_prompt ?? "",
      visualStyle: body.visual_style ?? "cinematografico",
      durationSeconds: Number(body.duration_seconds ?? 5),
      aspectRatio: body.aspect_ratio ?? "9:16",
      cameraMotion: body.camera_motion ?? "slow_zoom",
      quality: body.quality ?? "standard"
    })), usage });
  } catch (error) {
    return NextResponse.json({ status: "failed", error: error instanceof Error ? error.message : "Erro ao gerar video IA." }, { status: 400 });
  }
}


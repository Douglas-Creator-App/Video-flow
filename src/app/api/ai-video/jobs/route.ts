import { NextResponse, type NextRequest } from "next/server";
import { requireAuth, requirePermission, requireRateLimit } from "@/lib/auth";
import { canUseFeature } from "@/lib/billing";
import { enqueueJob, getJobs, type BackgroundJobType } from "@/lib/jobs/job-queue";
import { estimateAiVideoCost, isSupportedRealVideoProvider, normalizeAiVideoProvider } from "@/lib/ai-video/ai-video-pipeline";
import { createAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import type { AiVideoProviderType } from "@/lib/types";

const allowedTypes = new Set(["text_to_video", "image_to_video", "talking_character", "intro", "outro"]);

export async function GET(request: NextRequest) {
  const workspaceId = request.nextUrl.searchParams.get("workspace_id");
  await requireAuth();
  if (!workspaceId) return NextResponse.json({ status: "failed", error: "workspace_id obrigatorio." }, { status: 400 });
  await requirePermission(workspaceId, "content.create");

  const [textJobs, imageJobs, talkingJobs, assets] = await Promise.all([
    getJobs({ workspaceId, type: "text_to_video" }),
    getJobs({ workspaceId, type: "image_to_video" }),
    getJobs({ workspaceId, type: "talking_character" }),
    listAiVideoAssets(workspaceId)
  ]);

  return NextResponse.json({
    source: "background_jobs",
    jobs: [...textJobs, ...imageJobs, ...talkingJobs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    assets
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const type = String(body.type ?? "text_to_video");
  if (!allowedTypes.has(type)) {
    return NextResponse.json({ status: "failed", error: "Tipo de AI Video invalido." }, { status: 400 });
  }

  const workspaceId = String(body.workspace_id ?? "");
  if (!workspaceId) return NextResponse.json({ status: "failed", error: "workspace_id obrigatorio." }, { status: 400 });

  const provider = normalizeAiVideoProvider(body.provider);
  if (!isSupportedRealVideoProvider(provider)) {
    return NextResponse.json({ status: "failed", error: "Provider de video real obrigatorio. Use runway, kling, pika, veo ou luma." }, { status: 400 });
  }

  const { user } = await requireAuth();
  await requirePermission(workspaceId, "content.create");
  await requireRateLimit({ workspaceId, userId: user.id, feature: "ai_video", route: "/api/ai-video/jobs" });

  const durationSeconds = Number(body.duration_seconds ?? 5);
  const requiredCredits = Math.max(1, estimateAiVideoCost(provider, durationSeconds));
  const usage = await canUseFeature(workspaceId, "ai_video", requiredCredits);
  if (!usage.allowed) return NextResponse.json({ status: "blocked", error: usage.reason, usage }, { status: 402 });

  const validation = validateInput(type, body);
  if (validation) return NextResponse.json({ status: "failed", error: validation }, { status: 400 });

  const jobType = type === "intro" || type === "outro" ? "text_to_video" : type as BackgroundJobType;
  const job = await enqueueJob({
    workspaceId,
    userId: user.id,
    type: jobType,
    priority: 6,
    payload: {
      ...body,
      type,
      provider,
      duration_seconds: durationSeconds,
      required_credits: requiredCredits
    }
  });

  return NextResponse.json({
    status: "queued",
    job_id: job.id,
    job_type: job.type,
    ai_video_type: type,
    provider,
    provider_mode: "worker",
    usage,
    cost_estimate: requiredCredits,
    polling_url: `/api/jobs/${job.id}`,
    warning: "AI Video enfileirado. O worker tentara usar provider real; sem adapter/API key, o job falhara com erro claro."
  });
}

function validateInput(type: string, body: Record<string, unknown>) {
  if ((type === "text_to_video" || type === "intro" || type === "outro") && !String(body.prompt ?? "").trim()) return "prompt obrigatorio.";
  if (type === "image_to_video" && !String(body.input_image_url ?? "").trim()) return "input_image_url obrigatorio para image_to_video.";
  if (type === "talking_character" && !String(body.speech_text ?? "").trim()) return "speech_text obrigatorio para talking_character.";
  return "";
}

async function listAiVideoAssets(workspaceId: string) {
  if (!isSupabaseAdminConfigured()) return [];
  const { data, error } = await createAdminClient()
    .from("ai_video_assets")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw new Error(`Falha ao listar ai_video_assets: ${error.message}`);
  return data ?? [];
}

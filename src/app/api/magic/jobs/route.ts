import { NextResponse, type NextRequest } from "next/server";
import { magicVideoJobs } from "@/lib/mock-data";
import { requireAuth, requirePermission, requireRateLimit } from "@/lib/auth";
import { canUseFeature } from "@/lib/billing";
import { enqueueJob } from "@/lib/jobs/job-queue";
import { estimateMagicCost, secondsFromDuration } from "@/lib/magic/magic-pipeline";
import type { MagicAdvancedSettings, MagicDurationTarget } from "@/lib/types";

export async function GET() {
  await requireAuth();
  return NextResponse.json({ jobs: magicVideoJobs });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const workspaceId = String(body.workspace_id ?? "");
  if (!workspaceId) return NextResponse.json({ status: "failed", error: "workspace_id obrigatorio." }, { status: 400 });
  const advancedSettings = normalizeAdvancedSettings(body.advanced_settings);
  const { user } = await requireAuth();
  const workspace = await requirePermission(workspaceId, "content.create");
  const durationTarget = (body.duration_target ?? "60s") as MagicDurationTarget;
  const durationSeconds = secondsFromDuration(durationTarget, advancedSettings.customDurationSeconds);
  const sceneCount = advancedSettings.sceneCount || Math.max(5, Math.round(durationSeconds / 8));
  const costEstimate = estimateMagicCost({
    durationSeconds,
    sceneCount,
    subtitleEnabled: body.subtitle_enabled ?? true,
    musicEnabled: body.music_enabled ?? true,
    autoThumbnail: body.auto_thumbnail ?? true
  });
  await requireRateLimit({ workspaceId, userId: user.id, feature: "jobs", route: "/api/magic/jobs" });
  const usage = await canUseFeature(workspaceId, "generate_script", costEstimate.totalCredits);

  if (body.preview === true) {
    return NextResponse.json({
      cost_estimate: costEstimate,
      duration_seconds: durationSeconds,
      scene_count: sceneCount,
      available_credits: body.available_credits ?? null,
      can_generate: usage.allowed && (body.available_credits === undefined || Number(body.available_credits) >= costEstimate.totalCredits),
      usage,
      status: "preview"
    });
  }

  if (!usage.allowed) {
    return NextResponse.json({ status: "blocked", error: usage.reason, usage, cost_estimate: costEstimate }, { status: 402 });
  }

  if (body.available_credits !== undefined && Number(body.available_credits) < costEstimate.totalCredits) {
    return NextResponse.json(
      {
        status: "blocked",
        error: `Creditos insuficientes. Necessario: ${costEstimate.totalCredits}. Disponivel: ${Number(body.available_credits)}.`,
        cost_estimate: costEstimate
      },
      { status: 402 }
    );
  }

  const job = await enqueueJob({
    workspaceId,
    userId: user.id,
    type: "magic_video",
    priority: 9,
    payload: {
      ...body,
      duration_target: durationTarget,
      duration_seconds: durationSeconds,
      scene_count: sceneCount,
      advanced_settings: advancedSettings,
      required_credits: costEstimate.totalCredits
    }
  });

  return NextResponse.json({
    status: "queued",
    job_id: job.id,
    polling_url: `/api/jobs/${job.id}`,
    cost_estimate: costEstimate,
    usage,
    worker_required: true,
    warning: "Magic Mode enfileirado. Execute npm run worker ou acompanhe em /app/queue."
  });
}

function normalizeAdvancedSettings(settings: Partial<MagicAdvancedSettings> | undefined): MagicAdvancedSettings {
  return {
    scriptInstructions: settings?.scriptInstructions ?? "",
    imageInstructions: settings?.imageInstructions ?? "",
    forbiddenWords: settings?.forbiddenWords ?? "",
    targetAudience: settings?.targetAudience ?? "",
    language: settings?.language ?? "pt-BR",
    narrationTone: settings?.narrationTone ?? "confiante",
    cta: settings?.cta ?? "",
    sceneCount: Number(settings?.sceneCount ?? 8),
    customDurationSeconds: settings?.customDurationSeconds ? Number(settings.customDurationSeconds) : undefined,
    customScript: settings?.customScript ?? "",
    useZoom: settings?.useZoom ?? true,
    useOrganicMotion: settings?.useOrganicMotion ?? true,
    autoThumbnail: settings?.autoThumbnail ?? true,
    autoMusic: settings?.autoMusic ?? true,
    autoSubtitles: settings?.autoSubtitles ?? true
  };
}


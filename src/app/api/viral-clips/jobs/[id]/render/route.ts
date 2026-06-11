import { NextResponse, type NextRequest } from "next/server";
import { requireAuth, requirePermission, requireRateLimit } from "@/lib/auth";
import { canUseFeature } from "@/lib/billing";
import { enqueueJob } from "@/lib/jobs/job-queue";
import { createAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { user } = await requireAuth();
  const body = await request.json();
  const selectedIds = Array.isArray(body.moment_ids) ? body.moment_ids.map(String).filter(Boolean) : [];

  const viralJob = await loadViralJob(id);
  if (!viralJob) return NextResponse.json({ status: "failed", error: "Job de cortes virais nao encontrado." }, { status: 404 });
  await requirePermission(viralJob.workspace_id, "content.create");
  await requireRateLimit({ workspaceId: viralJob.workspace_id, userId: user.id, feature: "jobs", route: "/api/viral-clips/jobs/[id]/render" });

  const requiredCredits = Math.max(1, selectedIds.length || Number(viralJob.clips_quantity ?? 1));
  const usage = await canUseFeature(viralJob.workspace_id, "viral_clips", requiredCredits);
  if (!usage.allowed) return NextResponse.json({ status: "blocked", error: usage.reason, usage }, { status: 402 });

  if (isSupabaseAdminConfigured() && selectedIds.length) {
    const { error } = await createAdminClient()
      .from("viral_moments")
      .update({ status: "approved" })
      .eq("viral_clip_job_id", id)
      .in("id", selectedIds);
    if (error) return NextResponse.json({ status: "failed", error: `Falha ao aprovar momentos: ${error.message}` }, { status: 400 });
  }

  const job = await enqueueJob({
    workspaceId: viralJob.workspace_id,
    userId: user.id,
    type: "viral_clip",
    priority: 7,
    payload: {
      viral_clip_job_id: id,
      action: "render_selected",
      moment_ids: selectedIds,
      titles: body.titles ?? {},
      subtitle_style: body.subtitle_style ?? viralJob.subtitle_style,
      reframe_mode: body.reframe_mode ?? viralJob.reframe_mode,
      output_format: body.output_format ?? viralJob.output_format,
      required_credits: requiredCredits
    }
  });

  return NextResponse.json({
    status: "queued",
    job_id: job.id,
    provider_mode: "worker",
    usage,
    warning: "Render real de cortes foi enfileirado. Se o worker nao tiver transcricao e FFmpeg/adapter real, o job falhara com erro claro.",
    clips: []
  });
}

async function loadViralJob(id: string) {
  if (!isSupabaseAdminConfigured()) return null;
  const { data, error } = await createAdminClient().from("viral_clip_jobs").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(`Falha ao carregar job viral: ${error.message}`);
  return data as null | {
    id: string;
    workspace_id: string;
    clips_quantity: number;
    subtitle_style: string;
    reframe_mode: string;
    output_format: string;
  };
}

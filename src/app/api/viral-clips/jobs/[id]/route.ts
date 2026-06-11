import { NextResponse, type NextRequest } from "next/server";
import { requireAuth, requirePermission } from "@/lib/auth";
import { getJob } from "@/lib/jobs/job-queue";
import { createAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { viralSteps } from "@/lib/viral/viral-clips-pipeline";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireAuth();

  const detail = await loadViralDetail(id);
  if (!detail) return NextResponse.json({ status: "failed", error: "Job de cortes virais nao encontrado." }, { status: 404 });
  await requirePermission(detail.workspace_id, "content.create");

  return NextResponse.json({
    ...detail,
    steps: viralSteps,
    logs: detail.logs.length ? detail.logs : ["Job criado", detail.job.current_step ?? detail.job.currentStep ?? "Aguardando worker"]
  });
}

async function loadViralDetail(id: string) {
  if (isSupabaseAdminConfigured()) {
    const admin = createAdminClient();
    const { data: viralJob, error } = await admin.from("viral_clip_jobs").select("*").eq("id", id).maybeSingle();
    if (error) throw new Error(`Falha ao carregar job viral: ${error.message}`);
    if (viralJob) {
      const [sourceVideo, transcript, moments, clips] = await Promise.all([
        admin.from("source_videos").select("*").eq("workspace_id", viralJob.workspace_id).eq("source_url", viralJob.source_url).order("created_at", { ascending: false }).limit(1).maybeSingle(),
        admin.from("video_transcripts").select("*").eq("workspace_id", viralJob.workspace_id).order("created_at", { ascending: false }).limit(1).maybeSingle(),
        admin.from("viral_moments").select("*").eq("viral_clip_job_id", id).order("viral_score", { ascending: false }),
        admin.from("viral_clips").select("*").eq("viral_clip_job_id", id).order("created_at", { ascending: false })
      ]);
      for (const result of [sourceVideo, transcript, moments, clips]) {
        if (result.error) throw new Error(`Falha ao carregar artefatos virais: ${result.error.message}`);
      }
      return {
        workspace_id: String(viralJob.workspace_id),
        job: viralJob,
        source_video: sourceVideo.data ?? null,
        transcript: transcript.data ?? null,
        moments: moments.data ?? [],
        clips: clips.data ?? [],
        logs: []
      };
    }
  }

  const background = await getJob(id);
  if (!background) return null;
  return {
    workspace_id: background.job.workspaceId,
    job: background.job,
    source_video: null,
    transcript: null,
    moments: [],
    clips: [],
    logs: background.logs.map((log) => log.message)
  };
}

import type { JobHandler } from "@/workers/handlers/types";
import { createAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";

export const viralClipHandler: JobHandler = async (job, context) => {
  const viralClipJobId = String(job.payload.viral_clip_job_id ?? "");
  await context.update(10, "Validando pipeline real de cortes virais");

  if (!viralClipJobId) {
    throw new Error("viral_clip_job_id obrigatorio para processar cortes virais reais.");
  }
  if (!isSupabaseAdminConfigured()) {
    throw new Error("Supabase service role obrigatorio para cortes virais reais.");
  }

  const admin = createAdminClient();
  const { data: viralJob, error } = await admin.from("viral_clip_jobs").select("*").eq("id", viralClipJobId).maybeSingle();
  if (error || !viralJob) throw new Error(`Job de cortes virais nao encontrado: ${error?.message ?? viralClipJobId}`);

  await updateViralJob(viralClipJobId, { status: "transcribing", progress: 35, current_step: "Aguardando transcricao real" });
  await context.update(35, "Aguardando transcricao real");

  const { data: sourceVideo } = await admin
    .from("source_videos")
    .select("*")
    .eq("workspace_id", viralJob.workspace_id)
    .eq("source_url", viralJob.source_url)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!sourceVideo?.local_video_url && !sourceVideo?.local_audio_url) {
    await failViralJob(viralClipJobId, "Video/audio fonte real ausente. Faca upload de um arquivo fonte antes de transcrever e cortar.");
    throw new Error("Video/audio fonte real ausente. Faca upload de um arquivo fonte antes de transcrever e cortar.");
  }

  const { data: transcript } = await admin
    .from("video_transcripts")
    .select("*")
    .eq("source_video_id", sourceVideo.id)
    .eq("status", "completed")
    .maybeSingle();
  if (!transcript) {
    await failViralJob(viralClipJobId, "Transcricao real ausente. Configure Whisper/STT antes de gerar cortes virais.");
    throw new Error("Transcricao real ausente. Configure Whisper/STT antes de gerar cortes virais.");
  }

  await updateViralJob(viralClipJobId, { status: "rendering", progress: 80, current_step: "Aguardando render real dos cortes" });
  await context.update(80, "Aguardando render real dos cortes");

  await failViralJob(viralClipJobId, "Render real de cortes ainda nao possui adapter FFmpeg implementado.");
  throw new Error("Render real de cortes ainda nao possui adapter FFmpeg implementado.");
};

async function updateViralJob(id: string, patch: Record<string, unknown>) {
  await createAdminClient().from("viral_clip_jobs").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", id);
}

async function failViralJob(id: string, message: string) {
  await updateViralJob(id, { status: "failed", progress: 99, current_step: "Falhou", error_message: message });
}

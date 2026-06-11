import { assertFfmpegAvailable } from "@/lib/media/ffmpeg";
import { renderVideoWithFfmpeg, type RenderQuality } from "@/lib/render/ffmpeg-renderer";
import { logMediaUsage } from "@/lib/billing/credit-ledger";
import type { JobHandler } from "@/workers/handlers/types";

export const renderVideoHandler: JobHandler = async (job, context) => {
  const videoProjectId = String(job.payload.video_project_id ?? job.payload.videoProjectId ?? "");
  if (!videoProjectId) throw new Error("video_project_id obrigatorio para render_video.");
  const quality = (job.payload.quality ?? "final") as RenderQuality;
  await context.update(12, "Validando projeto e FFmpeg");
  const ffmpeg = assertFfmpegAvailable();
  await context.log("FFmpeg disponivel", { path: ffmpeg.path, version: ffmpeg.version });
  if (await context.shouldCancel()) throw new Error("Job cancelado antes do render.");
  await context.update(35, "Renderizando cenas");
  const result = await renderVideoWithFfmpeg({ videoProjectId, quality });
  await context.log("Render executado", { status: result.status, providerMode: result.providerMode });
  if (result.status === "failed" || !("renderUrl" in result)) {
    throw new Error("error" in result ? result.error : "Render falhou.");
  }
  await logMediaUsage({ workspaceId: job.workspaceId, userId: job.userId, provider: "ffmpeg", actionType: "render_video", units: 1, cost: Number(job.payload.required_credits ?? 0), referenceId: job.id });
  await context.update(90, "MP4 verificado");
  return {
    video_project_id: videoProjectId,
    render_url: result.renderUrl,
    thumbnail_url: result.thumbnailUrl,
    artifact_verified: true,
    provider: "ffmpeg",
    provider_mode: "real",
    duration_ms: result.durationMs,
    logs: result.logs
  };
};

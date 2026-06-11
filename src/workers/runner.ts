import {
  appendJobLog,
  claimNextJob,
  completeJob,
  failJob,
  recordHeartbeat,
  recoverStuckJobs,
  shouldCancel,
  updateJobStatus,
  type BackgroundJob,
  type BackgroundJobType
} from "@/lib/jobs/job-queue";
import { aiGenerationHandler } from "@/workers/handlers/ai-generation";
import { aiVideoHandler } from "@/workers/handlers/ai-video";
import { backupHandler } from "@/workers/handlers/backup";
import { exportPackageHandler } from "@/workers/handlers/export-package";
import { factoryGenerationHandler } from "@/workers/handlers/factory-generation";
import { imageGenerationHandler } from "@/workers/handlers/image-generation";
import { magicVideoHandler } from "@/workers/handlers/magic-video";
import { renderVideoHandler } from "@/workers/handlers/render-video";
import { ttsGenerationHandler } from "@/workers/handlers/tts-generation";
import { viralClipHandler } from "@/workers/handlers/viral-clip";
import type { JobHandler } from "@/workers/handlers/types";

const handlers: Record<BackgroundJobType, JobHandler> = {
  magic_video: magicVideoHandler,
  ai_generation: aiGenerationHandler,
  tts_generation: ttsGenerationHandler,
  image_generation: imageGenerationHandler,
  render_video: renderVideoHandler,
  export_package: exportPackageHandler,
  viral_clip: viralClipHandler,
  text_to_video: aiVideoHandler,
  image_to_video: aiVideoHandler,
  talking_character: aiVideoHandler,
  backup: backupHandler,
  factory_generation: factoryGenerationHandler
};

export async function processNextJob(workerId = `worker_${Date.now()}`) {
  await recoverStuckJobs();
  await recordHeartbeat(workerId, "active", { mode: "process_next" });
  const job = await claimNextJob(workerId);
  if (!job) {
    await recordHeartbeat(workerId, "idle", { lastResult: "no_job" });
    return { status: "idle" as const, message: "Nenhum job pendente." };
  }

  try {
    const result = await processJob(job);
    await completeJob(job.id, result);
    await recordHeartbeat(workerId, "idle", { lastJobId: job.id, lastStatus: "completed" });
    return { status: "completed" as const, job_id: job.id, result };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha desconhecida no worker.";
    if (await shouldCancel(job.id)) {
      await updateJobStatus(job.id, { status: "cancelled", progress: 0, currentStep: "Cancelado", errorMessage: message });
      await appendJobLog(job.id, "warning", "Job cancelado durante execucao", { message });
      await recordHeartbeat(workerId, "idle", { lastJobId: job.id, lastStatus: "cancelled" });
      return { status: "cancelled" as const, job_id: job.id, error: message };
    }
    await failJob(job.id, message);
    await recordHeartbeat(workerId, "idle", { lastJobId: job.id, lastStatus: "failed" });
    return { status: "failed" as const, job_id: job.id, error: message };
  }
}

export async function processJob(job: BackgroundJob) {
  const handler = handlers[job.type];
  if (!handler) throw new Error(`Handler nao implementado para ${job.type}.`);

  await appendJobLog(job.id, "info", `Iniciando handler ${job.type}`);
  const result = await handler(job, {
    update: async (progress, currentStep) => {
      await updateJobStatus(job.id, { progress: Math.max(0, Math.min(99, progress)), currentStep });
    },
    log: async (message, metadata) => {
      await appendJobLog(job.id, "info", message, metadata);
    },
    warn: async (message, metadata) => {
      await appendJobLog(job.id, "warning", message, metadata);
    },
    error: async (message, metadata) => {
      await appendJobLog(job.id, "error", message, metadata);
    },
    shouldCancel: async () => shouldCancel(job.id)
  });
  return result;
}

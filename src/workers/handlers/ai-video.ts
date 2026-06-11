import { generateAiVideoReal } from "@/lib/providers/video-provider";
import { logProviderUsage } from "@/lib/billing/credit-ledger";
import type { JobHandler } from "@/workers/handlers/types";

export const aiVideoHandler: JobHandler = async (job, context) => {
  const task = job.type === "image_to_video" ? "image_to_video" : job.type === "talking_character" ? "talking_character" : "text_to_video";
  const provider = String(job.payload.provider ?? "");
  await context.update(20, "Validando provider de video IA");
  await context.log("AI Video provider selecionado", { provider, task });
  try {
    const result = await generateAiVideoReal({
      task,
      provider: job.payload.provider as never,
      prompt: String(job.payload.prompt ?? job.payload.motion_prompt ?? job.payload.speech_text ?? ""),
      inputImageUrl: job.payload.input_image_url ? String(job.payload.input_image_url) : undefined,
      durationSeconds: job.payload.duration_seconds ? Number(job.payload.duration_seconds) : undefined
    });
    if (!result.outputVideoUrl && !result.videoUrl) {
      throw new Error("Provider de video nao retornou outputVideoUrl real.");
    }
    await logProviderUsage({
      workspaceId: job.workspaceId,
      userId: job.userId,
      jobId: job.id,
      provider,
      taskType: task,
      costEstimate: Number(job.payload.required_credits ?? 0),
      creditsCharged: Number(job.payload.required_credits ?? 0),
      status: "completed",
      metadata: result
    });
    await context.update(100, "Video IA gerado");
    return { ...result, provider_mode: "real" };
  } catch (error) {
    await logProviderUsage({
      workspaceId: job.workspaceId,
      userId: job.userId,
      jobId: job.id,
      provider,
      taskType: task,
      costEstimate: Number(job.payload.required_credits ?? 0),
      creditsCharged: 0,
      status: "failed",
      errorMessage: error instanceof Error ? error.message : "Falha em provider de video IA."
    });
    throw error;
  }
};

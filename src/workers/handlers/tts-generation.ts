import { runProviderTask } from "@/lib/providers/provider-router";
import type { JobHandler } from "@/workers/handlers/types";

export const ttsGenerationHandler: JobHandler = async (job, context) => {
  await context.update(25, "Gerando voz");
  const result = await runProviderTask({
    type: "tts",
    workspaceId: job.workspaceId,
    userId: job.userId,
    text: String(job.payload.text ?? job.payload.script ?? ""),
    voiceId: job.payload.voice_id ? String(job.payload.voice_id) : job.payload.voice ? String(job.payload.voice) : undefined,
    provider: job.payload.provider ? String(job.payload.provider) : undefined,
    referenceId: job.id
  }) as Awaited<ReturnType<typeof import("@/lib/providers/tts-provider").generateTtsReal>>;
  await context.log("TTS concluido", { providerMode: result.providerMode, durationSeconds: result.durationSeconds });
  return result;
};

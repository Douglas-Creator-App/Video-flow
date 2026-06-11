import { generateAiVideoReal } from "@/lib/providers/video-provider";
import type { JobHandler } from "@/workers/handlers/types";

export const aiVideoHandler: JobHandler = async (job, context) => {
  await context.update(50, "Validando provider de video IA");
  const result = await generateAiVideoReal({
    task: job.type === "image_to_video" ? "image_to_video" : job.type === "talking_character" ? "talking_character" : "text_to_video",
    provider: job.payload.provider as never,
    prompt: String(job.payload.prompt ?? job.payload.motion_prompt ?? job.payload.speech_text ?? ""),
    inputImageUrl: job.payload.input_image_url ? String(job.payload.input_image_url) : undefined,
    durationSeconds: job.payload.duration_seconds ? Number(job.payload.duration_seconds) : undefined
  });
  return result;
};

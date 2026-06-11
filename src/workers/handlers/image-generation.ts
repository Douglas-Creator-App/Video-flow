import { runProviderTask } from "@/lib/providers/provider-router";
import type { JobHandler } from "@/workers/handlers/types";

export const imageGenerationHandler: JobHandler = async (job, context) => {
  await context.update(25, "Gerando imagem");
  const result = await runProviderTask({
    type: "image",
    workspaceId: job.workspaceId,
    userId: job.userId,
    prompt: String(job.payload.prompt ?? ""),
    aspectRatio: job.payload.aspect_ratio ? String(job.payload.aspect_ratio) : undefined,
    quantity: job.payload.quantity ? Number(job.payload.quantity) : undefined,
    style: job.payload.style ? String(job.payload.style) : undefined,
    referenceId: job.id
  }) as Awaited<ReturnType<typeof import("@/lib/providers/image-provider").generateImagesReal>>;
  await context.log("Imagem concluida", { providerMode: result.providerMode, quantity: result.images.length });
  return result;
};

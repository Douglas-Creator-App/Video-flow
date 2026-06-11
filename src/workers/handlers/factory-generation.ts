import { runFactoryGeneration } from "@/lib/content-factory";
import type { JobHandler } from "@/workers/handlers/types";

export const factoryGenerationHandler: JobHandler = async (job, context) => {
  await context.update(20, "Carregando factory");
  const result = runFactoryGeneration(String(job.payload.factory_id ?? job.payload.factoryId ?? "factory_1"));
  if (!result) throw new Error("Factory nao encontrada.");
  await context.update(80, "Factory gerada em modo interno");
  return { status: "completed", result, warning: "Factory ainda usa motor interno/mock ate persistencia Supabase real." };
};

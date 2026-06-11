import { runProviderTask } from "@/lib/providers/provider-router";
import { logMediaUsage, logProviderUsage } from "@/lib/billing/credit-ledger";
import type { JobHandler } from "@/workers/handlers/types";

export const aiGenerationHandler: JobHandler = async (job, context) => {
  await context.update(20, "Preparando prompt");
  const result = await runProviderTask({
    type: "text",
    workspaceId: job.workspaceId,
    userId: job.userId,
    systemPrompt: String(job.payload.system_prompt ?? job.payload.systemPrompt ?? "Voce e o motor de conteudo do Video Flow."),
    prompt: String(job.payload.user_prompt ?? job.payload.userPrompt ?? job.payload.prompt ?? ""),
    referenceId: job.id
  }) as Awaited<ReturnType<typeof import("@/lib/providers/openai-provider").generateOpenAiTextStrict>>;
  await context.log("Geracao IA concluida", { providerMode: result.providerMode, model: result.model, cost: result.cost });
  await logMediaUsage({ workspaceId: job.workspaceId, userId: job.userId, provider: result.provider, actionType: "ai_generation", units: result.inputTokens + result.outputTokens, cost: result.cost, referenceId: job.id });
  await logProviderUsage({ workspaceId: job.workspaceId, userId: job.userId, jobId: job.id, provider: result.provider, model: result.model, taskType: "ai_generation", inputUnits: result.inputTokens, outputUnits: result.outputTokens, costEstimate: result.cost, creditsCharged: Number(job.payload.required_credits ?? 0), status: "completed" });
  return result;
};

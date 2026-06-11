import type { JobHandler } from "@/workers/handlers/types";

export const viralClipHandler: JobHandler = async (_job, context) => {
  await context.update(50, "Validando pipeline de cortes virais");
  await context.warn("Cortes virais ainda nao possuem transcricao/render real neste ambiente.");
  return { status: "completed", provider_mode: "mock_guarded", warning: "Viral clip handler preparado; processamento real depende de transcricao/render." };
};

import type { JobHandler } from "@/workers/handlers/types";

export const backupHandler: JobHandler = async (_job, context) => {
  await context.update(40, "Validando rotina de backup");
  await context.warn("Backup real depende de Supabase service role e storage configurados.");
  return { status: "completed", provider_mode: "not_configured", warning: "Backup registrado, mas execucao real exige SUPABASE_SERVICE_ROLE_KEY." };
};

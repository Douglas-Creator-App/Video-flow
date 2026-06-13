import { createAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import type { BackgroundJobType } from "@/lib/jobs/job-queue";

export function isCreditLedgerConfigured() {
  return isSupabaseAdminConfigured();
}

export function creditsFromPayload(payload?: Record<string, unknown>) {
  // Modelo BYOK: sem cobrança de créditos (o cliente paga o provedor direto).
  // Defina BYOK_MODE=false para reativar a reserva/cobrança de créditos.
  if (process.env.BYOK_MODE !== "false") return 0;
  const value = Number(payload?.required_credits ?? payload?.requiredCredits ?? 0);
  return Number.isFinite(value) && value > 0 ? value : 0;
}

export async function reserveCreditsForJob(input: {
  workspaceId: string;
  userId?: string;
  jobId: string;
  jobType: BackgroundJobType;
  amount: number;
}) {
  if (!isCreditLedgerConfigured() || input.amount <= 0) return { skipped: true };
  const { data, error } = await createAdminClient().rpc("reserve_credits_for_job", {
    workspace_id_input: input.workspaceId,
    user_id_input: input.userId || null,
    job_id_input: input.jobId,
    job_type_input: input.jobType,
    amount_input: input.amount
  });
  if (error) throw new Error(`Falha ao reservar creditos: ${error.message}`);
  return data;
}

export async function settleReservedCreditsForJob(input: {
  workspaceId: string;
  userId?: string;
  jobId: string;
  jobType: BackgroundJobType;
  amount: number;
  consumed: boolean;
}) {
  if (!isCreditLedgerConfigured() || input.amount <= 0) return { skipped: true };
  const { data, error } = await createAdminClient().rpc("settle_reserved_credits_for_job", {
    workspace_id_input: input.workspaceId,
    user_id_input: input.userId || null,
    job_id_input: input.jobId,
    job_type_input: input.jobType,
    amount_input: input.amount,
    consumed_input: input.consumed
  });
  if (error) throw new Error(`Falha ao consolidar creditos: ${error.message}`);
  return data;
}

export async function logMediaUsage(input: {
  workspaceId: string;
  userId?: string;
  provider: string;
  actionType: string;
  units?: number;
  cost?: number;
  referenceId?: string;
}) {
  if (!isCreditLedgerConfigured()) return { skipped: true };
  const { error } = await createAdminClient().from("media_usage_logs").insert({
    workspace_id: input.workspaceId,
    user_id: input.userId || null,
    provider: input.provider,
    action_type: input.actionType,
    units: input.units ?? 0,
    cost: input.cost ?? 0,
    reference_id: input.referenceId ?? null
  });
  if (error) throw new Error(`Falha ao registrar media usage: ${error.message}`);
  return { inserted: true };
}

export async function logProviderUsage(input: {
  workspaceId: string;
  userId?: string;
  jobId?: string;
  provider: string;
  model?: string;
  taskType: string;
  inputUnits?: number;
  outputUnits?: number;
  costEstimate?: number;
  creditsCharged?: number;
  status: "completed" | "failed" | "blocked";
  errorMessage?: string;
  metadata?: Record<string, unknown>;
}) {
  if (!isCreditLedgerConfigured()) return { skipped: true };
  const { error } = await createAdminClient().from("provider_usage_logs").insert({
    workspace_id: input.workspaceId,
    user_id: input.userId || null,
    job_id: input.jobId ?? null,
    provider: input.provider,
    model: input.model ?? null,
    task_type: input.taskType,
    input_units: input.inputUnits ?? 0,
    output_units: input.outputUnits ?? 0,
    cost_estimate: input.costEstimate ?? 0,
    credits_charged: input.creditsCharged ?? 0,
    status: input.status,
    error_message: input.errorMessage ?? null,
    metadata: input.metadata ?? {}
  });
  if (error) throw new Error(`Falha ao registrar provider usage: ${error.message}`);
  return { inserted: true };
}

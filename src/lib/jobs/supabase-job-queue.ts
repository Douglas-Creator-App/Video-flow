import { createAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { creditsFromPayload, reserveCreditsForJob, settleReservedCreditsForJob } from "@/lib/billing/credit-ledger";
import type { BackgroundJob, BackgroundJobLog, BackgroundJobLogLevel, BackgroundJobStatus, BackgroundJobType, WorkerHeartbeat } from "@/lib/jobs/job-queue";

type DbJob = {
  id: string;
  workspace_id: string;
  user_id: string | null;
  type: BackgroundJobType;
  status: BackgroundJobStatus;
  priority: number;
  payload: Record<string, unknown>;
  result: Record<string, unknown> | null;
  progress: number;
  current_step: string;
  attempts: number;
  max_attempts: number;
  error_message: string | null;
  scheduled_at: string;
  started_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  cancel_requested: boolean;
  locked_at: string | null;
  locked_by: string | null;
  lock_expired_at: string | null;
  created_at: string;
  updated_at: string;
};

type DbLog = {
  id: string;
  job_id: string;
  workspace_id: string;
  level: BackgroundJobLogLevel;
  message: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

type DbHeartbeat = {
  id: string;
  worker_id: string;
  status: WorkerHeartbeat["status"];
  last_seen_at: string;
  metadata: Record<string, unknown> | null;
};

export function shouldUseSupabaseJobs() {
  return isSupabaseAdminConfigured();
}

export async function enqueueSupabaseJob(input: {
  workspaceId?: string;
  userId?: string;
  type: BackgroundJobType;
  priority?: number;
  payload?: Record<string, unknown>;
  maxAttempts?: number;
  scheduledAt?: string;
}) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("background_jobs")
    .insert({
      workspace_id: input.workspaceId ?? "ws_1",
      user_id: input.userId ?? null,
      type: input.type,
      priority: input.priority ?? 5,
      payload: input.payload ?? {},
      max_attempts: input.maxAttempts ?? 3,
      scheduled_at: input.scheduledAt ?? new Date().toISOString()
    })
    .select("*")
    .single();
  if (error) throw new Error(`Falha ao criar job no Supabase: ${error.message}`);
  const job = mapJob(data as DbJob);
  const requiredCredits = creditsFromPayload(job.payload);
  if (requiredCredits > 0) await reserveCreditsForJob({ workspaceId: job.workspaceId, userId: job.userId, jobId: job.id, jobType: job.type, amount: requiredCredits });
  await appendSupabaseJobLog(job.id, "info", "Job enfileirado", { type: job.type, priority: job.priority });
  return job;
}

export async function getSupabaseJobs(filters: { workspaceId?: string; status?: BackgroundJobStatus; type?: BackgroundJobType } = {}) {
  const supabase = createAdminClient();
  let query = supabase.from("background_jobs").select("*").order("created_at", { ascending: false });
  if (filters.workspaceId) query = query.eq("workspace_id", filters.workspaceId);
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.type) query = query.eq("type", filters.type);
  const { data, error } = await query;
  if (error) throw new Error(`Falha ao listar jobs: ${error.message}`);
  return (data as DbJob[]).map(mapJob);
}

export async function getSupabaseJob(jobId: string) {
  const supabase = createAdminClient();
  const { data: job, error } = await supabase.from("background_jobs").select("*").eq("id", jobId).single();
  if (error || !job) return null;
  const { data: logs, error: logsError } = await supabase.from("background_job_logs").select("*").eq("job_id", jobId).order("created_at", { ascending: true });
  if (logsError) throw new Error(`Falha ao carregar logs do job: ${logsError.message}`);
  return { job: mapJob(job as DbJob), logs: ((logs ?? []) as DbLog[]).map(mapLog) };
}

export async function updateSupabaseJobStatus(jobId: string, patch: Partial<Pick<BackgroundJob, "status" | "progress" | "currentStep" | "result" | "errorMessage" | "cancelRequested">>) {
  const supabase = createAdminClient();
  const dbPatch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.status !== undefined) dbPatch.status = patch.status;
  if (patch.progress !== undefined) dbPatch.progress = patch.progress;
  if (patch.currentStep !== undefined) dbPatch.current_step = patch.currentStep;
  if (patch.result !== undefined) dbPatch.result = patch.result;
  if (patch.errorMessage !== undefined) dbPatch.error_message = patch.errorMessage;
  if (patch.cancelRequested !== undefined) dbPatch.cancel_requested = patch.cancelRequested;
  const { data, error } = await supabase.from("background_jobs").update(dbPatch).eq("id", jobId).select("*").single();
  if (error) throw new Error(`Falha ao atualizar job: ${error.message}`);
  return mapJob(data as DbJob);
}

export async function appendSupabaseJobLog(jobId: string, level: BackgroundJobLogLevel, message: string, metadata?: Record<string, unknown>) {
  const current = await getSupabaseJob(jobId);
  if (!current) return null;
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("background_job_logs")
    .insert({ job_id: jobId, workspace_id: current.job.workspaceId, level, message, metadata: metadata ?? {} })
    .select("*")
    .single();
  if (error) throw new Error(`Falha ao gravar log do job: ${error.message}`);
  return mapLog(data as DbLog);
}

export async function retrySupabaseJob(jobId: string) {
  const supabase = createAdminClient();
  const scheduledAt = new Date(Date.now() + 5_000).toISOString();
  const { data, error } = await supabase.from("background_jobs").update({
    status: "queued",
    progress: 0,
    current_step: "Reenfileirado",
    error_message: null,
    cancel_requested: false,
    locked_at: null,
    locked_by: null,
    lock_expired_at: null,
    scheduled_at: scheduledAt,
    updated_at: new Date().toISOString()
  }).eq("id", jobId).select("*").single();
  if (error) throw new Error(`Falha ao reenfileirar job: ${error.message}`);
  await appendSupabaseJobLog(jobId, "info", "Job reenfileirado para retry");
  return mapJob(data as DbJob);
}

export async function cancelSupabaseJob(jobId: string) {
  const current = await getSupabaseJob(jobId);
  if (!current) return null;
  const patch = current.job.status === "running"
    ? { cancel_requested: true, current_step: "Cancelamento solicitado" }
    : { status: "cancelled", progress: 0, current_step: "Cancelado", cancelled_at: new Date().toISOString() };
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("background_jobs").update({ ...patch, updated_at: new Date().toISOString() }).eq("id", jobId).select("*").single();
  if (error) throw new Error(`Falha ao cancelar job: ${error.message}`);
  const job = mapJob(data as DbJob);
  const requiredCredits = creditsFromPayload(job.payload);
  if (requiredCredits > 0 && job.status === "cancelled") {
    await settleReservedCreditsForJob({ workspaceId: job.workspaceId, userId: job.userId, jobId: job.id, jobType: job.type, amount: requiredCredits, consumed: false });
  }
  await appendSupabaseJobLog(jobId, "warning", "Cancelamento solicitado");
  return job;
}

export async function failSupabaseJob(jobId: string, errorMessage: string) {
  const current = await getSupabaseJob(jobId);
  if (!current) return null;
  const canRetry = current.job.attempts < current.job.maxAttempts && !current.job.cancelRequested && !/credito/i.test(errorMessage);
  const { data, error } = await createAdminClient().from("background_jobs").update({
    status: canRetry ? "retrying" : "failed",
    error_message: errorMessage,
    current_step: canRetry ? "Aguardando retry automatico" : "Falhou",
    progress: Math.min(current.job.progress, 99),
    locked_at: null,
    locked_by: null,
    lock_expired_at: null,
    scheduled_at: canRetry ? new Date(Date.now() + Math.min(60_000, 2 ** Math.max(0, current.job.attempts - 1) * 5_000)).toISOString() : current.job.scheduledAt,
    updated_at: new Date().toISOString()
  }).eq("id", jobId).select("*").single();
  if (error) throw new Error(`Falha ao marcar job como falho: ${error.message}`);
  const job = mapJob(data as DbJob);
  const requiredCredits = creditsFromPayload(job.payload);
  if (requiredCredits > 0 && !/provider consumiu|consumed/i.test(errorMessage)) {
    await settleReservedCreditsForJob({ workspaceId: job.workspaceId, userId: job.userId, jobId: job.id, jobType: job.type, amount: requiredCredits, consumed: false });
  }
  await appendSupabaseJobLog(jobId, "error", `Job falhou: ${errorMessage}`);
  return job;
}

export async function completeSupabaseJob(jobId: string, result: Record<string, unknown>) {
  const { data, error } = await createAdminClient().from("background_jobs").update({
    status: "completed",
    result,
    progress: 100,
    current_step: "Concluido",
    completed_at: new Date().toISOString(),
    locked_at: null,
    locked_by: null,
    lock_expired_at: null,
    updated_at: new Date().toISOString()
  }).eq("id", jobId).select("*").single();
  if (error) throw new Error(`Falha ao concluir job: ${error.message}`);
  const job = mapJob(data as DbJob);
  const requiredCredits = creditsFromPayload(job.payload);
  if (requiredCredits > 0) await settleReservedCreditsForJob({ workspaceId: job.workspaceId, userId: job.userId, jobId: job.id, jobType: job.type, amount: requiredCredits, consumed: true });
  await appendSupabaseJobLog(jobId, "info", "Job concluido");
  return job;
}

export async function claimNextSupabaseJob(workerId: string) {
  const supabase = createAdminClient();
  const { data: rpcData, error: rpcError } = await supabase.rpc("claim_background_job", { worker_id_input: workerId, lock_minutes_input: 15 });
  if (!rpcError && Array.isArray(rpcData) && rpcData[0]) return mapJob(rpcData[0] as DbJob);

  const { data: next, error } = await supabase.from("background_jobs")
    .select("*")
    .in("status", ["queued", "retrying"])
    .lte("scheduled_at", new Date().toISOString())
    .order("priority", { ascending: false })
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error || !next) return null;
  const { data: updated, error: updateError } = await supabase.from("background_jobs").update({
    status: "running",
    attempts: Number((next as DbJob).attempts) + 1,
    started_at: (next as DbJob).started_at ?? new Date().toISOString(),
    locked_at: new Date().toISOString(),
    locked_by: workerId,
    lock_expired_at: new Date(Date.now() + 15 * 60_000).toISOString(),
    current_step: `Processando tentativa ${Number((next as DbJob).attempts) + 1}`,
    updated_at: new Date().toISOString()
  }).eq("id", (next as DbJob).id).in("status", ["queued", "retrying"]).select("*").single();
  if (updateError) return null;
  await appendSupabaseJobLog((updated as DbJob).id, "info", "Job travado pelo worker", { workerId });
  return mapJob(updated as DbJob);
}

export async function recordSupabaseHeartbeat(workerId: string, status: WorkerHeartbeat["status"], metadata?: Record<string, unknown>) {
  const { data, error } = await createAdminClient().from("worker_heartbeats").upsert({
    worker_id: workerId,
    status,
    last_seen_at: new Date().toISOString(),
    metadata: metadata ?? {}
  }, { onConflict: "worker_id" }).select("*").single();
  if (error) throw new Error(`Falha ao gravar heartbeat: ${error.message}`);
  return mapHeartbeat(data as DbHeartbeat);
}

export async function getSupabaseQueueHealth() {
  const supabase = createAdminClient();
  const [{ data: jobs }, { data: heartbeats }] = await Promise.all([
    supabase.from("background_jobs").select("status, lock_expired_at"),
    supabase.from("worker_heartbeats").select("*").order("last_seen_at", { ascending: false })
  ]);
  const now = Date.now();
  const rows = (jobs ?? []) as Array<{ status: BackgroundJobStatus; lock_expired_at?: string | null }>;
  const mappedHeartbeats = ((heartbeats ?? []) as DbHeartbeat[]).map(mapHeartbeat);
  return {
    heartbeats: mappedHeartbeats,
    pending: rows.filter((job) => job.status === "queued" || job.status === "retrying").length,
    running: rows.filter((job) => job.status === "running").length,
    failed: rows.filter((job) => job.status === "failed").length,
    stuck: rows.filter((job) => job.status === "running" && job.lock_expired_at && new Date(job.lock_expired_at).getTime() < now).length,
    workerActive: mappedHeartbeats.some((item) => item.status === "active" && now - new Date(item.lastSeenAt).getTime() < 60_000),
    backend: "supabase"
  };
}

export async function recoverSupabaseStuckJobs() {
  const supabase = createAdminClient();
  const { data } = await supabase.from("background_jobs").select("*").eq("status", "running").lt("lock_expired_at", new Date().toISOString());
  const jobs = (data ?? []) as DbJob[];
  for (const job of jobs) {
    await failSupabaseJob(job.id, "Job travado recuperado pelo worker.");
  }
  return jobs.length;
}

function mapJob(row: DbJob): BackgroundJob {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    userId: row.user_id ?? "",
    type: row.type,
    status: row.status,
    priority: row.priority,
    payload: row.payload ?? {},
    result: row.result ?? undefined,
    progress: row.progress,
    currentStep: row.current_step,
    attempts: row.attempts,
    maxAttempts: row.max_attempts,
    errorMessage: row.error_message ?? undefined,
    scheduledAt: row.scheduled_at,
    startedAt: row.started_at ?? undefined,
    completedAt: row.completed_at ?? undefined,
    cancelledAt: row.cancelled_at ?? undefined,
    cancelRequested: row.cancel_requested,
    lockedAt: row.locked_at ?? undefined,
    lockedBy: row.locked_by ?? undefined,
    lockExpiredAt: row.lock_expired_at ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapLog(row: DbLog): BackgroundJobLog {
  return { id: row.id, jobId: row.job_id, workspaceId: row.workspace_id, level: row.level, message: row.message, metadata: row.metadata ?? undefined, createdAt: row.created_at };
}

function mapHeartbeat(row: DbHeartbeat): WorkerHeartbeat {
  return { id: row.id, workerId: row.worker_id, status: row.status, lastSeenAt: row.last_seen_at, metadata: row.metadata ?? undefined };
}

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { emitPlatformWebhook } from "@/lib/platform/webhooks";
import {
  appendSupabaseJobLog,
  cancelSupabaseJob,
  claimNextSupabaseJob,
  completeSupabaseJob,
  enqueueSupabaseJob,
  failSupabaseJob,
  getSupabaseJob,
  getSupabaseJobs,
  getSupabaseQueueHealth,
  recordSupabaseHeartbeat,
  recoverSupabaseStuckJobs,
  retrySupabaseJob,
  shouldUseSupabaseJobs,
  updateSupabaseJobStatus
} from "@/lib/jobs/supabase-job-queue";

export type BackgroundJobType =
  | "magic_video"
  | "ai_generation"
  | "tts_generation"
  | "image_generation"
  | "render_video"
  | "export_package"
  | "viral_clip"
  | "text_to_video"
  | "image_to_video"
  | "talking_character"
  | "backup"
  | "factory_generation";

export type BackgroundJobStatus = "queued" | "running" | "completed" | "failed" | "cancelled" | "retrying";
export type BackgroundJobLogLevel = "info" | "warning" | "error" | "debug";

export interface BackgroundJob {
  id: string;
  workspaceId: string;
  userId: string;
  type: BackgroundJobType;
  status: BackgroundJobStatus;
  priority: number;
  payload: Record<string, unknown>;
  result?: Record<string, unknown>;
  progress: number;
  currentStep: string;
  attempts: number;
  maxAttempts: number;
  errorMessage?: string;
  scheduledAt: string;
  startedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancelRequested: boolean;
  lockedAt?: string;
  lockedBy?: string;
  lockExpiredAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BackgroundJobLog {
  id: string;
  jobId: string;
  workspaceId: string;
  level: BackgroundJobLogLevel;
  message: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface WorkerHeartbeat {
  id: string;
  workerId: string;
  status: "active" | "idle" | "stopped";
  lastSeenAt: string;
  metadata?: Record<string, unknown>;
}

interface JobStore {
  jobs: BackgroundJob[];
  logs: BackgroundJobLog[];
  heartbeats: WorkerHeartbeat[];
}

const storePath = path.join(process.cwd(), ".data", "background-jobs.json");
let writeLock = Promise.resolve();

export async function enqueueJob(input: {
  workspaceId?: string;
  userId?: string;
  type: BackgroundJobType;
  priority?: number;
  payload?: Record<string, unknown>;
  maxAttempts?: number;
  scheduledAt?: string;
}) {
  if (shouldUseSupabaseJobs()) return enqueueSupabaseJob(input);
  return mutateStore(async (store) => {
    const now = new Date().toISOString();
    const job: BackgroundJob = {
      id: `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      workspaceId: input.workspaceId ?? "ws_1",
      userId: input.userId ?? "user_1",
      type: input.type,
      status: "queued",
      priority: input.priority ?? 5,
      payload: input.payload ?? {},
      progress: 0,
      currentStep: "Na fila",
      attempts: 0,
      maxAttempts: input.maxAttempts ?? 3,
      scheduledAt: input.scheduledAt ?? now,
      cancelRequested: false,
      createdAt: now,
      updatedAt: now
    };
    store.jobs.unshift(job);
    store.logs.unshift(logEntry(job, "info", "Job enfileirado", { type: job.type, priority: job.priority }));
    return job;
  });
}

export async function getJobs(filters: { workspaceId?: string; status?: BackgroundJobStatus; type?: BackgroundJobType } = {}) {
  if (shouldUseSupabaseJobs()) return getSupabaseJobs(filters);
  const store = await readStore();
  return store.jobs.filter((job) => {
    if (filters.workspaceId && job.workspaceId !== filters.workspaceId) return false;
    if (filters.status && job.status !== filters.status) return false;
    if (filters.type && job.type !== filters.type) return false;
    return true;
  });
}

export async function getJob(jobId: string) {
  if (shouldUseSupabaseJobs()) return getSupabaseJob(jobId);
  const store = await readStore();
  const job = store.jobs.find((item) => item.id === jobId);
  return job ? { job, logs: store.logs.filter((log) => log.jobId === jobId).reverse() } : null;
}

export async function updateJobStatus(jobId: string, patch: Partial<Pick<BackgroundJob, "status" | "progress" | "currentStep" | "result" | "errorMessage" | "cancelRequested">>) {
  if (shouldUseSupabaseJobs()) return updateSupabaseJobStatus(jobId, patch);
  return mutateJob(jobId, (job) => {
    Object.assign(job, patch, { updatedAt: new Date().toISOString() });
    return job;
  });
}

export async function appendJobLog(jobId: string, level: BackgroundJobLogLevel, message: string, metadata?: Record<string, unknown>) {
  if (shouldUseSupabaseJobs()) return appendSupabaseJobLog(jobId, level, message, metadata);
  return mutateStore(async (store) => {
    const job = store.jobs.find((item) => item.id === jobId);
    if (!job) return null;
    const entry = logEntry(job, level, message, metadata);
    store.logs.unshift(entry);
    return entry;
  });
}

export async function retryJob(jobId: string) {
  if (shouldUseSupabaseJobs()) return retrySupabaseJob(jobId);
  return mutateJob(jobId, (job) => {
    if (job.status === "cancelled") return job;
    job.status = "queued";
    job.progress = 0;
    job.currentStep = "Reenfileirado";
    job.errorMessage = undefined;
    job.cancelRequested = false;
    job.lockedAt = undefined;
    job.lockedBy = undefined;
    job.lockExpiredAt = undefined;
    job.scheduledAt = new Date(Date.now() + backoffMs(job.attempts)).toISOString();
    return job;
  }, "Job reenfileirado para retry");
}

export async function cancelJob(jobId: string) {
  if (shouldUseSupabaseJobs()) return cancelSupabaseJob(jobId);
  return mutateJob(jobId, (job) => {
    if (job.status === "completed" || job.status === "failed") return job;
    if (job.status === "running") {
      job.cancelRequested = true;
      job.currentStep = "Cancelamento solicitado";
      return job;
    }
    job.status = "cancelled";
    job.progress = 0;
    job.currentStep = "Cancelado";
    job.cancelledAt = new Date().toISOString();
    return job;
  }, "Cancelamento solicitado");
}

export async function failJob(jobId: string, errorMessage: string) {
  if (shouldUseSupabaseJobs()) return failSupabaseJob(jobId, errorMessage);
  return mutateJob(jobId, (job) => {
    const canRetry = job.attempts < job.maxAttempts && !job.cancelRequested && !/credito/i.test(errorMessage);
    job.status = canRetry ? "retrying" : "failed";
    job.errorMessage = errorMessage;
    job.currentStep = canRetry ? "Aguardando retry automatico" : "Falhou";
    job.progress = Math.min(job.progress, 99);
    job.lockedAt = undefined;
    job.lockedBy = undefined;
    job.lockExpiredAt = undefined;
    if (canRetry) job.scheduledAt = new Date(Date.now() + backoffMs(job.attempts)).toISOString();
    return job;
  }, `Job falhou: ${errorMessage}`, "error");
}

export async function completeJob(jobId: string, result: Record<string, unknown>) {
  if (shouldUseSupabaseJobs()) {
    const completed = await completeSupabaseJob(jobId, result);
    await emitCompletionWebhooks(completed, result);
    return completed;
  }
  const completed = await mutateJob(jobId, (job) => {
    job.status = "completed";
    job.result = result;
    job.progress = 100;
    job.currentStep = "Concluido";
    job.completedAt = new Date().toISOString();
    job.lockedAt = undefined;
    job.lockedBy = undefined;
    job.lockExpiredAt = undefined;
    return job;
  }, "Job concluido");
  await emitCompletionWebhooks(completed, result);
  return completed;
}

async function emitCompletionWebhooks(job: BackgroundJob | null | undefined, result: Record<string, unknown>) {
  if (!job?.workspaceId) return;
  const payload = { job_id: job.id, job_type: job.type, status: job.status, result };
  try {
    await emitPlatformWebhook({ workspaceId: job.workspaceId, eventType: "job_completed", payload });
    if (job.type === "render_video") await emitPlatformWebhook({ workspaceId: job.workspaceId, eventType: "render_completed", payload });
    if (job.type === "export_package") await emitPlatformWebhook({ workspaceId: job.workspaceId, eventType: "export_ready", payload });
  } catch (error) {
    await appendJobLog(job.id, "warning", "Falha ao emitir webhook de plataforma", { error: error instanceof Error ? error.message : "erro desconhecido" });
  }
}

export async function claimNextJob(workerId: string) {
  if (shouldUseSupabaseJobs()) return claimNextSupabaseJob(workerId);
  return mutateStore(async (store) => {
    const now = Date.now();
    const next = store.jobs
      .filter((job) => ["queued", "retrying"].includes(job.status))
      .filter((job) => new Date(job.scheduledAt).getTime() <= now)
      .sort((a, b) => b.priority - a.priority || new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())[0];
    if (!next) return null;
    next.status = "running";
    next.attempts += 1;
    next.startedAt = next.startedAt ?? new Date().toISOString();
    next.updatedAt = new Date().toISOString();
    next.lockedAt = new Date().toISOString();
    next.lockedBy = workerId;
    next.lockExpiredAt = new Date(Date.now() + 15 * 60_000).toISOString();
    next.currentStep = `Processando tentativa ${next.attempts}`;
    store.logs.unshift(logEntry(next, "info", "Job travado pelo worker", { workerId, attempts: next.attempts }));
    return next;
  });
}

export async function shouldCancel(jobId: string) {
  const current = await getJob(jobId);
  return current?.job.cancelRequested === true || current?.job.status === "cancelled";
}

export async function recordHeartbeat(workerId: string, status: WorkerHeartbeat["status"], metadata?: Record<string, unknown>) {
  if (shouldUseSupabaseJobs()) return recordSupabaseHeartbeat(workerId, status, metadata);
  return mutateStore(async (store) => {
    const now = new Date().toISOString();
    const existing = store.heartbeats.find((item) => item.workerId === workerId);
    if (existing) {
      existing.status = status;
      existing.lastSeenAt = now;
      existing.metadata = metadata;
      return existing;
    }
    const heartbeat: WorkerHeartbeat = { id: `heartbeat_${Date.now()}`, workerId, status, lastSeenAt: now, metadata };
    store.heartbeats.unshift(heartbeat);
    return heartbeat;
  });
}

export async function getQueueHealth() {
  if (shouldUseSupabaseJobs()) return getSupabaseQueueHealth();
  const store = await readStore();
  const now = Date.now();
  const stuckJobs = store.jobs.filter((job) => job.status === "running" && job.lockExpiredAt && new Date(job.lockExpiredAt).getTime() < now);
  return {
    heartbeats: store.heartbeats,
    pending: store.jobs.filter((job) => job.status === "queued" || job.status === "retrying").length,
    running: store.jobs.filter((job) => job.status === "running").length,
    failed: store.jobs.filter((job) => job.status === "failed").length,
    stuck: stuckJobs.length,
    workerActive: store.heartbeats.some((item) => item.status === "active" && now - new Date(item.lastSeenAt).getTime() < 60_000),
    backend: "local_dev"
  };
}

export async function recoverStuckJobs() {
  if (shouldUseSupabaseJobs()) return recoverSupabaseStuckJobs();
  return mutateStore(async (store) => {
    const now = Date.now();
    let recovered = 0;
    for (const job of store.jobs) {
      if (job.status !== "running" || !job.lockExpiredAt || new Date(job.lockExpiredAt).getTime() >= now) continue;
      recovered += 1;
      job.lockedAt = undefined;
      job.lockedBy = undefined;
      job.lockExpiredAt = undefined;
      job.errorMessage = "Job travado recuperado pelo worker.";
      if (job.attempts < job.maxAttempts) {
        job.status = "retrying";
        job.currentStep = "Recuperado e aguardando retry";
        job.scheduledAt = new Date(Date.now() + backoffMs(job.attempts)).toISOString();
      } else {
        job.status = "failed";
        job.currentStep = "Falhou apos lock expirado";
      }
      store.logs.unshift(logEntry(job, "warning", "Job travado recuperado"));
    }
    return recovered;
  });
}

async function mutateJob(jobId: string, updater: (job: BackgroundJob) => BackgroundJob, message?: string, level: BackgroundJobLogLevel = "info") {
  return mutateStore(async (store) => {
    const job = store.jobs.find((item) => item.id === jobId);
    if (!job) return null;
    const updated = updater(job);
    updated.updatedAt = new Date().toISOString();
    if (message) store.logs.unshift(logEntry(updated, level, message));
    return updated;
  });
}

async function readStore(): Promise<JobStore> {
  assertLocalJobStoreAllowed();
  try {
    const raw = await readFile(storePath, "utf8");
    const parsed = JSON.parse(raw) as Partial<JobStore>;
    return { jobs: parsed.jobs ?? [], logs: parsed.logs ?? [], heartbeats: parsed.heartbeats ?? [] };
  } catch {
    return { jobs: [], logs: [], heartbeats: [] };
  }
}

function mutateStore<T>(operation: (store: JobStore) => Promise<T>) {
  assertLocalJobStoreAllowed();
  const run = writeLock.then(async () => {
    const store = await readStore();
    const result = await operation(store);
    await mkdir(path.dirname(storePath), { recursive: true });
    await writeFile(storePath, JSON.stringify(store, null, 2), "utf8");
    return result;
  });
  writeLock = run.then(() => undefined, () => undefined);
  return run;
}

function logEntry(job: BackgroundJob, level: BackgroundJobLogLevel, message: string, metadata?: Record<string, unknown>): BackgroundJobLog {
  return { id: `job_log_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, jobId: job.id, workspaceId: job.workspaceId, level, message, metadata, createdAt: new Date().toISOString() };
}

function assertLocalJobStoreAllowed() {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Job queue real exige Supabase service role em producao. Fallback .data/background-jobs.json e permitido apenas em development.");
  }
}

function backoffMs(attempts: number) {
  return Math.min(60_000, 2 ** Math.max(0, attempts - 1) * 5_000);
}

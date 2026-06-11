import {
  adminWorkspaceSummaries,
  backupJobs,
  dataRequests,
  dataRetentionPolicies,
  demoModeSettings,
  environmentVariableStatuses,
  errorLogs,
  launchChecklistItems,
  providerHealthChecks,
  rateLimitRules,
  securityEvents,
  smokeTestSteps,
  storageBucketChecks,
  systemHealthChecks
} from "@/lib/mock-data";
import type { HealthStatus, LaunchStatus } from "@/lib/types";

export function getLaunchOverview() {
  const total = launchChecklistItems.length;
  const completed = launchChecklistItems.filter((item) => item.status === "completed").length;
  const errors = launchChecklistItems.filter((item) => item.status === "error").length;
  const progress = Math.round((completed / total) * 100);

  return {
    total,
    completed,
    errors,
    progress,
    status: errors ? "warning" as HealthStatus : progress === 100 ? "healthy" as HealthStatus : "warning" as HealthStatus,
    checklist: launchChecklistItems
  };
}

export function getEnvironmentSummary() {
  return {
    total: environmentVariableStatuses.length,
    configured: environmentVariableStatuses.filter((item) => item.status === "configured").length,
    missing: environmentVariableStatuses.filter((item) => item.status === "missing").length,
    invalid: environmentVariableStatuses.filter((item) => item.status === "invalid").length,
    variables: environmentVariableStatuses
  };
}

export function getProviderHealthSummary() {
  return {
    online: providerHealthChecks.filter((item) => item.status === "online").length,
    missingKeys: providerHealthChecks.filter((item) => item.status === "missing_key").length,
    offline: providerHealthChecks.filter((item) => item.status === "offline").length,
    checks: providerHealthChecks
  };
}

export function getStorageSummary() {
  return {
    total: storageBucketChecks.length,
    ready: storageBucketChecks.filter((item) => item.exists && item.policyStatus === "healthy").length,
    critical: storageBucketChecks.filter((item) => !item.exists || item.policyStatus === "critical").length,
    buckets: storageBucketChecks
  };
}

export function getSecuritySummary() {
  return {
    rlsStatus: "warning" as HealthStatus,
    missingKeys: environmentVariableStatuses.filter((item) => item.required && item.status !== "configured").length,
    suspendedWorkspaces: adminWorkspaceSummaries.filter((workspace) => workspace.status === "suspended").length,
    deniedAccess: securityEvents.filter((event) => event.eventType === "permission_denied").length,
    sensitiveEvents: securityEvents.filter((event) => ["api_key_changed", "workspace_suspended", "admin_action", "provider_error"].includes(event.eventType)),
    latestLogins: securityEvents.filter((event) => event.eventType === "login").slice(0, 5),
    events: securityEvents
  };
}

export function getJobMonitoringSummary() {
  const allJobs = [
    { id: "job_script_1", provider: "OpenAI", status: "completed", durationMs: 840 },
    { id: "job_voice_1", provider: "ElevenLabs", status: "processing", durationMs: 1200 },
    { id: "job_image_1", provider: "OpenAI Images", status: "failed", durationMs: 0 },
    { id: "job_render_1", provider: "Render Base", status: "queued", durationMs: 0 },
    { id: "job_clip_1", provider: "Viral Pipeline", status: "completed", durationMs: 3200 }
  ];

  return {
    queued: allJobs.filter((job) => job.status === "queued").length,
    processing: allJobs.filter((job) => job.status === "processing").length,
    failed: allJobs.filter((job) => job.status === "failed").length,
    completed: allJobs.filter((job) => job.status === "completed").length,
    averageTimeMs: Math.round(allJobs.reduce((total, job) => total + job.durationMs, 0) / allJobs.length),
    failuresByProvider: [{ provider: "OpenAI Images", failures: 1 }],
    jobs: allJobs
  };
}

export function getSystemHealthSummary() {
  const critical = systemHealthChecks.filter((item) => item.status === "critical").length;
  const warning = systemHealthChecks.filter((item) => item.status === "warning").length;

  return {
    status: critical ? "critical" as HealthStatus : warning ? "warning" as HealthStatus : "healthy" as HealthStatus,
    checks: systemHealthChecks,
    errors: errorLogs.filter((log) => !log.resolved),
    diskUsage: { usedGb: 18.4, totalGb: 100, percent: 18 }
  };
}

export function getProductionDocsSections() {
  return [
    { title: "Variaveis de ambiente", body: "Configure Supabase, APP_URL, storage e chaves server-side. Nunca exponha service role ou chaves de provider no frontend." },
    { title: "Deploy", body: "Rodar typecheck e build antes de publicar. Validar dominio, SSL, callbacks de auth e variaveis no provedor." },
    { title: "Providers", body: "Ativar OpenAI, voz e assets de forma incremental. Manter modo demo enquanto chaves reais nao forem auditadas." },
    { title: "Storage", body: "Criar buckets videos, thumbnails, audio, images, assets, exports e temp com policies por workspace." },
    { title: "Backups", body: "Executar backup manual antes de releases e agendar exports de banco/assets no ambiente real." },
    { title: "Erros comuns", body: "Chave ausente, APP_URL incorreta, bucket exports ausente, RLS sem policy de escrita e callback Auth errado." },
    { title: "Comandos uteis", body: "npm.cmd run typecheck, npm.cmd run build, npm.cmd run dev -- -H 127.0.0.1 -p 3011." }
  ];
}

export function createMockBackup() {
  return {
    id: `backup_${Date.now()}`,
    workspaceId: "ws_1",
    type: "full_backup" as const,
    status: "queued" as const,
    startedAt: new Date().toISOString()
  };
}

export function getProductionLaunchData() {
  return {
    launch: getLaunchOverview(),
    environment: getEnvironmentSummary(),
    providers: getProviderHealthSummary(),
    storage: getStorageSummary(),
    backups: backupJobs,
    retention: dataRetentionPolicies,
    security: getSecuritySummary(),
    rateLimits: rateLimitRules,
    jobs: getJobMonitoringSummary(),
    errors: errorLogs,
    health: getSystemHealthSummary(),
    dataRequests,
    smokeTestSteps,
    demoModeSettings
  };
}

export function statusTone(status: LaunchStatus | HealthStatus | string) {
  if (["completed", "healthy", "online", "configured", "ready"].includes(status)) return "text-emerald-300 border-emerald-400/20 bg-emerald-400/10";
  if (["error", "critical", "offline", "missing", "missing_key", "invalid", "failed"].includes(status)) return "text-red-300 border-red-400/20 bg-red-400/10";
  if (["in_progress", "warning", "running", "processing"].includes(status)) return "text-amber-300 border-amber-400/20 bg-amber-400/10";
  return "text-muted-foreground border-white/10 bg-secondary/40";
}

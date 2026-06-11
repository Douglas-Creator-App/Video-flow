import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { validateEnv, getStorageBuckets } from "@/lib/env";
import { createAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { getQueueHealth } from "@/lib/jobs/job-queue";
import { checkFfmpegAvailable } from "@/lib/media/ffmpeg";

type HealthRow = {
  key: string;
  status: "healthy" | "warning" | "critical";
  message: string;
};

export async function GET() {
  await requireAdmin();
  const rows: HealthRow[] = [];
  const env = validateEnv({ productionStrict: process.env.NODE_ENV === "production" });
  rows.push({
    key: "env",
    status: env.ok ? "healthy" : "critical",
    message: env.ok ? "Variaveis obrigatorias validas." : `Pendencias: ${[...env.missing, ...env.invalid].join(", ")}`
  });

  rows.push({
    key: "service_role",
    status: isSupabaseAdminConfigured() ? "healthy" : "critical",
    message: isSupabaseAdminConfigured() ? "Supabase service role disponivel." : "SUPABASE_SERVICE_ROLE_KEY ausente ou invalida."
  });

  rows.push({
    key: "providers",
    status: process.env.OPENAI_API_KEY ? "healthy" : "warning",
    message: process.env.OPENAI_API_KEY ? "OpenAI configurado para TTS/imagens/texto." : "OPENAI_API_KEY ausente; pipeline real Magic falhara sem fallback."
  });

  const ffmpeg = checkFfmpegAvailable();
  rows.push({
    key: "ffmpeg",
    status: ffmpeg.available ? "healthy" : "critical",
    message: ffmpeg.available ? `FFmpeg disponivel: ${ffmpeg.version}` : ffmpeg.error ?? "FFmpeg ausente."
  });

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ status: "critical", checks: rows });
  }

  const supabase = createAdminClient();
  const tables = ["workspaces", "subscriptions", "plans", "credit_wallets", "credit_transactions", "background_jobs", "background_job_logs", "worker_heartbeats", "audit_logs", "security_events", "rate_limit_events", "video_projects", "video_scenes", "video_renders", "export_packages", "media_usage_logs", "provider_usage_logs"];
  const tableChecks = await Promise.all(tables.map(async (table) => {
    const { error } = await supabase.from(table).select("id", { count: "exact", head: true });
    return { table, ok: !error, error: error?.message };
  }));
  const missingTables = tableChecks.filter((item) => !item.ok);
  rows.push({
    key: "migrations",
    status: missingTables.length ? "critical" : "healthy",
    message: missingTables.length ? `Tabelas pendentes: ${missingTables.map((item) => item.table).join(", ")}` : "Tabelas minimas da R6.6 presentes."
  });

  const bucketChecks = await Promise.all(getStorageBuckets().map(async (bucket) => {
    const { data, error } = await supabase.storage.getBucket(bucket);
    return { bucket, ok: Boolean(data && !error), error: error?.message };
  }));
  const missingBuckets = bucketChecks.filter((item) => !item.ok);
  rows.push({
    key: "storage_buckets",
    status: missingBuckets.length ? "critical" : "healthy",
    message: missingBuckets.length ? `Buckets ausentes: ${missingBuckets.map((item) => item.bucket).join(", ")}` : "Buckets privados existem."
  });

  const [{ count: plans }, { count: wallets }, { count: rateEvents }, { count: auditLogs }] = await Promise.all([
    supabase.from("plans").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("credit_wallets").select("id", { count: "exact", head: true }),
    supabase.from("rate_limit_events").select("id", { count: "exact", head: true }),
    supabase.from("audit_logs").select("id", { count: "exact", head: true })
  ]);
  rows.push({ key: "billing", status: plans && plans > 0 ? "healthy" : "critical", message: plans && plans > 0 ? `${plans} planos ativos.` : "Nenhum plano ativo encontrado." });
  rows.push({ key: "wallet", status: wallets && wallets > 0 ? "healthy" : "warning", message: wallets && wallets > 0 ? `${wallets} wallets criadas.` : "Nenhuma wallet ainda; sera criada no primeiro workspace/uso real." });
  rows.push({ key: "rate_limit", status: "healthy", message: `${rateEvents ?? 0} eventos de rate limit registrados.` });
  rows.push({ key: "audit_logs", status: "healthy", message: `${auditLogs ?? 0} audit logs registrados.` });

  const queue = await getQueueHealth();
  rows.push({
    key: "job_queue",
    status: queue.backend === "supabase" ? "healthy" : "critical",
    message: `Backend ${queue.backend}; pendentes ${queue.pending}; travados ${queue.stuck}; worker ${queue.workerActive ? "ativo" : "inativo"}.`
  });

  rows.push({
    key: "beta_pipeline",
    status: queue.backend === "supabase" && ffmpeg.available && Boolean(process.env.OPENAI_API_KEY) ? "healthy" : "warning",
    message: "Beta real exige Supabase jobs, OpenAI, Storage e FFmpeg para Magic -> Render -> Export."
  });

  const status = rows.some((item) => item.status === "critical") ? "critical" : rows.some((item) => item.status === "warning") ? "warning" : "healthy";
  return NextResponse.json({ status, checks: rows, queue });
}

import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";

const retention = {
  completedJobsDays: 45,
  failedJobsDays: 90,
  logsDays: 180,
  tempFilesDays: 7,
  exportsDays: 30
};

export async function POST(request: NextRequest) {
  await requireAdmin();
  const body = await request.json().catch(() => ({}));
  const dryRun = body.dry_run !== false;
  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ status: "blocked", dryRun, error: "Supabase service role nao configurada." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const cutoffs = {
    completedJobs: before(retention.completedJobsDays),
    failedJobs: before(retention.failedJobsDays),
    logs: before(retention.logsDays),
    exports: before(retention.exportsDays)
  };

  const candidates = await Promise.all([
    count("background_jobs", [["status", "completed"], ["completed_at", cutoffs.completedJobs]]),
    count("background_jobs", [["status", "failed"], ["updated_at", cutoffs.failedJobs]]),
    count("background_job_logs", [["created_at", cutoffs.logs]]),
    count("export_packages", [["status", "downloaded"], ["updated_at", cutoffs.exports]])
  ]);

  if (!dryRun) {
    await Promise.all([
      supabase.from("background_jobs").delete().eq("status", "completed").lt("completed_at", cutoffs.completedJobs),
      supabase.from("background_jobs").delete().eq("status", "failed").lt("updated_at", cutoffs.failedJobs),
      supabase.from("background_job_logs").delete().lt("created_at", cutoffs.logs),
      supabase.from("export_packages").delete().eq("status", "downloaded").lt("updated_at", cutoffs.exports)
    ]);
  }

  return NextResponse.json({
    status: dryRun ? "dry_run" : "completed",
    dryRun,
    retention,
    candidates: {
      completedJobs: candidates[0],
      failedJobs: candidates[1],
      logs: candidates[2],
      downloadedExports: candidates[3]
    },
    warning: dryRun ? "Nenhum registro removido. Envie dry_run=false para executar." : "Cleanup executado nas tabelas operacionais."
  });

  async function count(table: string, filters: Array<[string, string]>) {
    let query = supabase.from(table).select("id", { count: "exact", head: true });
    for (const [column, value] of filters) {
      if (column === "status") query = query.eq(column, value);
      else query = query.lt(column, value);
    }
    const { count: total, error } = await query;
    if (error) throw new Error(`Falha ao contar ${table}: ${error.message}`);
    return total ?? 0;
  }
}

function before(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

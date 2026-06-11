import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";

type UsageRow = {
  workspace_id?: string | null;
  user_id?: string | null;
  provider?: string | null;
  task_type?: string | null;
  action_type?: string | null;
  cost_estimate?: number | string | null;
  cost?: number | string | null;
  credits_charged?: number | string | null;
  reference_id?: string | null;
  created_at?: string | null;
};

type WorkspaceRow = { id: string; name: string; plan?: string | null };
type PlanRow = { id: string; name: string; monthly_price: number | string; yearly_price: number | string };
type SubscriptionRow = { workspace_id: string; plan_id: string; status: string };

export async function GET() {
  await requireAdmin();
  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json(empty("supabase_unconfigured"));
  }

  const supabase = createAdminClient();
  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);
  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);

  const [providerUsage, mediaUsage, workspaces, subscriptions, plans, renders, exports, jobs, heartbeats] = await Promise.all([
    supabase.from("provider_usage_logs").select("*").gte("created_at", monthStart.toISOString()).limit(5000),
    supabase.from("media_usage_logs").select("*").gte("created_at", monthStart.toISOString()).limit(5000),
    supabase.from("workspaces").select("id, name, plan").limit(1000),
    supabase.from("subscriptions").select("workspace_id, plan_id, status").in("status", ["trialing", "active"]),
    supabase.from("plans").select("id, name, monthly_price, yearly_price"),
    supabase.from("video_renders").select("workspace_id, video_project_id, file_size, created_at").gte("created_at", monthStart.toISOString()).limit(5000),
    supabase.from("export_packages").select("workspace_id, video_project_id, created_at").gte("created_at", monthStart.toISOString()).limit(5000),
    supabase.from("background_jobs").select("workspace_id, type, status, created_at").gte("created_at", monthStart.toISOString()).limit(5000),
    supabase.from("worker_heartbeats").select("*").order("last_seen_at", { ascending: false }).limit(20)
  ]);

  const errors = [providerUsage.error, mediaUsage.error, workspaces.error, subscriptions.error, plans.error, renders.error, exports.error, jobs.error, heartbeats.error]
    .filter(Boolean)
    .map((error) => error?.message);

  const workspaceRows = (workspaces.data ?? []) as WorkspaceRow[];
  const planRows = (plans.data ?? []) as PlanRow[];
  const subscriptionRows = (subscriptions.data ?? []) as SubscriptionRow[];
  const workspaceName = new Map(workspaceRows.map((row) => [row.id, row.name]));
  const planById = new Map(planRows.map((row) => [row.id, row]));
  const subByWorkspace = new Map(subscriptionRows.map((row) => [row.workspace_id, row]));
  const usageRows: UsageRow[] = [
    ...((providerUsage.data ?? []) as UsageRow[]).map((row) => ({ ...row, cost: row.cost_estimate, action_type: row.task_type })),
    ...((mediaUsage.data ?? []) as UsageRow[])
  ];

  const totals = usageRows.reduce((acc, row) => {
    const cost = amount(row.cost ?? row.cost_estimate);
    const credits = amount(row.credits_charged);
    acc.monthlyCost += cost;
    acc.monthlyCredits += credits;
    if (row.created_at && new Date(row.created_at) >= todayStart) acc.dailyCost += cost;
    return acc;
  }, { dailyCost: 0, monthlyCost: 0, monthlyCredits: 0 });

  const byProvider = groupUsage(usageRows, (row) => row.provider ?? "unknown");
  const byWorkspace = groupUsage(usageRows, (row) => row.workspace_id ?? "unknown", workspaceName);
  const byUser = groupUsage(usageRows, (row) => row.user_id ?? "system");
  const byVideo = groupUsage(usageRows, (row) => row.reference_id ?? "unlinked");

  const margins = workspaceRows.map((workspace) => {
    const subscription = subByWorkspace.get(workspace.id);
    const plan = subscription ? planById.get(subscription.plan_id) : undefined;
    const revenue = plan ? amount(plan.monthly_price) : 0;
    const providerCost = byWorkspace.find((item) => item.key === workspace.id)?.cost ?? 0;
    const storageCost = storageEstimate((renders.data ?? []).filter((row) => String(row.workspace_id) === workspace.id));
    const infraCost = revenue > 0 ? 12 : 0;
    const margin = revenue - providerCost - storageCost - infraCost;
    return {
      workspaceId: workspace.id,
      workspaceName: workspace.name,
      planName: plan?.name ?? workspace.plan ?? "sem plano",
      revenue,
      providerCost,
      storageCost,
      infraCost,
      margin,
      marginPercent: revenue > 0 ? Math.round((margin / revenue) * 100) : 0
    };
  });

  const queueSize = ((jobs.data ?? []) as Array<{ status: string }>).filter((job) => ["queued", "retrying"].includes(job.status)).length;
  const failedJobs = ((jobs.data ?? []) as Array<{ status: string }>).filter((job) => job.status === "failed").length;
  const activeWorker = ((heartbeats.data ?? []) as Array<{ last_seen_at?: string | null }>).some((heartbeat) => heartbeat.last_seen_at && Date.now() - new Date(heartbeat.last_seen_at).getTime() < 60_000);

  const alerts = [
    activeWorker ? null : { severity: "critical", title: "Worker inativo", message: "Nenhum heartbeat recente nos ultimos 60 segundos." },
    queueSize > 25 ? { severity: "high", title: "Fila crescendo", message: `${queueSize} jobs pendentes/retry no mes.` } : null,
    failedJobs > 0 ? { severity: "medium", title: "Jobs falhos", message: `${failedJobs} jobs falharam no periodo.` } : null,
    errors.length ? { severity: "high", title: "Leituras operacionais falharam", message: errors.join(" | ") } : null
  ].filter(Boolean);

  return NextResponse.json({
    source: "supabase",
    errors,
    totals,
    byProvider,
    byWorkspace,
    byUser,
    byVideo,
    margins,
    operations: {
      queueSize,
      failedJobs,
      activeWorker,
      workerCount: (heartbeats.data ?? []).length,
      rendersThisMonth: (renders.data ?? []).length,
      exportsThisMonth: (exports.data ?? []).length
    },
    alerts
  });
}

function empty(source: string) {
  return { source, errors: [], totals: { dailyCost: 0, monthlyCost: 0, monthlyCredits: 0 }, byProvider: [], byWorkspace: [], byUser: [], byVideo: [], margins: [], operations: { queueSize: 0, failedJobs: 0, activeWorker: false, workerCount: 0, rendersThisMonth: 0, exportsThisMonth: 0 }, alerts: [] };
}

function groupUsage(rows: UsageRow[], keyFn: (row: UsageRow) => string, labels?: Map<string, string>) {
  const grouped = new Map<string, { key: string; label: string; cost: number; credits: number; usage: number }>();
  for (const row of rows) {
    const key = keyFn(row);
    const current = grouped.get(key) ?? { key, label: labels?.get(key) ?? key, cost: 0, credits: 0, usage: 0 };
    current.cost += amount(row.cost ?? row.cost_estimate);
    current.credits += amount(row.credits_charged);
    current.usage += 1;
    grouped.set(key, current);
  }
  return [...grouped.values()].sort((a, b) => b.cost - a.cost);
}

function storageEstimate(rows: unknown[]) {
  const bytes = rows.reduce<number>((total, row) => total + amount((row as { file_size?: number | string | null }).file_size), 0);
  const gb = bytes / 1024 / 1024 / 1024;
  return Number((gb * 0.12).toFixed(4));
}

function amount(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

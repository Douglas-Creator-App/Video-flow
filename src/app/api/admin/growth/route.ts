import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";

type Row = Record<string, unknown>;

export async function GET() {
  await requireAdmin();
  if (!isSupabaseAdminConfigured()) return NextResponse.json(empty("supabase_unconfigured"));

  const supabase = createAdminClient();
  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const d7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const d30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [workspaces, users, subscriptions, plans, videos, renders, exports, providerUsage, mediaUsage, notifications, audit] = await Promise.all([
    supabase.from("workspaces").select("id, name, plan, owner_id, created_at").limit(5000),
    supabase.from("workspace_users").select("workspace_id, user_id, status, created_at").limit(10000),
    supabase.from("subscriptions").select("workspace_id, plan_id, status, billing_cycle, created_at, updated_at, cancel_at_period_end").limit(5000),
    supabase.from("plans").select("id, name, slug, monthly_price, yearly_price, included_credits, status").limit(100),
    supabase.from("video_projects").select("id, workspace_id, title, status, created_at").limit(10000),
    supabase.from("video_renders").select("id, workspace_id, video_project_id, status, render_url, created_at").limit(10000),
    supabase.from("export_packages").select("id, workspace_id, video_project_id, status, package_url, created_at").limit(10000),
    supabase.from("provider_usage_logs").select("workspace_id, user_id, provider, task_type, cost_estimate, credits_charged, created_at").gte("created_at", monthStart.toISOString()).limit(10000),
    supabase.from("media_usage_logs").select("workspace_id, user_id, provider, action_type, cost, credits_charged, created_at").gte("created_at", monthStart.toISOString()).limit(10000),
    supabase.from("operation_notifications").select("workspace_id, title, description, type, status, created_at").order("created_at", { ascending: false }).limit(40),
    supabase.from("audit_logs").select("workspace_id, action, entity_type, metadata, created_at").gte("created_at", d30.toISOString()).limit(5000)
  ]);

  const errors = [workspaces.error, users.error, subscriptions.error, plans.error, videos.error, renders.error, exports.error, providerUsage.error, mediaUsage.error, notifications.error, audit.error]
    .filter(Boolean)
    .map((error) => error?.message);

  const workspaceRows = rows(workspaces.data);
  const userRows = rows(users.data);
  const subscriptionRows = rows(subscriptions.data);
  const planRows = rows(plans.data);
  const videoRows = rows(videos.data);
  const renderRows = rows(renders.data);
  const exportRows = rows(exports.data);
  const usageRows: Row[] = [
    ...rows(providerUsage.data).map((row) => ({ ...row, cost: row.cost_estimate, action: row.task_type })),
    ...rows(mediaUsage.data).map((row) => ({ ...row, action: row.action_type }))
  ];

  const planById = new Map(planRows.map((plan) => [String(plan.id), plan]));
  const activeSubscriptions = subscriptionRows.filter((row) => ["active", "trialing"].includes(String(row.status)));
  const paidSubscriptions = subscriptionRows.filter((row) => row.status === "active");
  const trialSubscriptions = subscriptionRows.filter((row) => row.status === "trialing");
  const canceledSubscriptions = subscriptionRows.filter((row) => row.status === "canceled" || row.cancel_at_period_end === true);

  const mrr = paidSubscriptions.reduce((total, subscription) => {
    const plan = planById.get(String(subscription.plan_id));
    return total + monthlyRevenue(plan, String(subscription.billing_cycle ?? "monthly"));
  }, 0);
  const arr = mrr * 12;
  const activeUsers = new Set(userRows.filter((row) => row.status === "active").map((row) => String(row.user_id))).size;
  const generatedVideos = videoRows.length;
  const exportedVideos = exportRows.filter((row) => ["ready", "downloaded", "marked_as_published"].includes(String(row.status))).length;
  const providerCost = usageRows.reduce((total, row) => total + amount(row.cost), 0);
  const churnDenominator = Math.max(1, paidSubscriptions.length + canceledSubscriptions.length);
  const churnRate = canceledSubscriptions.length / churnDenominator;
  const arpa = paidSubscriptions.length ? mrr / paidSubscriptions.length : 0;
  const ltv = churnRate > 0 ? arpa / churnRate : arpa * 12;

  const signupCount = Math.max(workspaceRows.length, activeUsers);
  const visitorEstimate = Math.max(signupCount * 3, signupCount + trialSubscriptions.length + paidSubscriptions.length);
  const firstVideoWorkspaces = unique(videoRows.map((row) => row.workspace_id));
  const firstExportWorkspaces = unique(exportRows.map((row) => row.workspace_id));
  const funnel = [
    funnelStep("Visitante", visitorEstimate, visitorEstimate, "Estimado ate plugar analytics web completo."),
    funnelStep("Cadastro", signupCount, visitorEstimate, "Workspaces e membros criados."),
    funnelStep("Trial", trialSubscriptions.length, signupCount, "Assinaturas trialing no Supabase."),
    funnelStep("Primeiro video", firstVideoWorkspaces.size, signupCount, "Workspaces com pelo menos um video_project."),
    funnelStep("Primeira exportacao", firstExportWorkspaces.size, firstVideoWorkspaces.size, "Workspaces com export_package."),
    funnelStep("Assinante", paidSubscriptions.length, signupCount, "Assinaturas active.")
  ];

  const recentVideos = videoRows.filter((row) => dateAfter(row.created_at, d7)).length;
  const recentExports = exportRows.filter((row) => dateAfter(row.created_at, d7)).length;
  const retention = {
    d1: rate(unique(videoRows.filter((row) => dateAfter(row.created_at, new Date(now.getTime() - 24 * 60 * 60 * 1000))).map((row) => row.workspace_id)).size, workspaceRows.length),
    d7: rate(unique(videoRows.filter((row) => dateAfter(row.created_at, d7)).map((row) => row.workspace_id)).size, workspaceRows.length),
    d30: rate(unique(videoRows.filter((row) => dateAfter(row.created_at, d30)).map((row) => row.workspace_id)).size, workspaceRows.length)
  };

  const crm = {
    leads: Math.max(0, workspaceRows.length - activeSubscriptions.length),
    trials: trialSubscriptions.length,
    activeCustomers: paidSubscriptions.length,
    canceled: canceledSubscriptions.length
  };

  return NextResponse.json({
    source: "supabase",
    errors,
    executive: {
      mrr,
      arr,
      churnRate,
      cac: 0,
      ltv,
      activeUsers,
      generatedVideos,
      exportedVideos,
      providerCost,
      grossMargin: mrr > 0 ? Math.max(0, (mrr - providerCost) / mrr) : 0
    },
    funnel,
    productAnalytics: {
      timeToFirstVideoHours: estimateTimeToFirst(videoRows, workspaceRows),
      timeToFirstExportHours: estimateTimeToFirst(exportRows, workspaceRows),
      retention,
      recentVideos,
      recentExports,
      churnRate,
      ltv
    },
    affiliateProgram: {
      status: "BETA",
      cookieDays: 60,
      commissionTiers: [
        { tier: "Starter", commission: "20%", condition: "ate 10 vendas ativas" },
        { tier: "Growth", commission: "25%", condition: "11 a 50 vendas ativas" },
        { tier: "Scale", commission: "30%", condition: "mais de 50 vendas ativas" }
      ],
      trackingPattern: `${process.env.NEXT_PUBLIC_APP_URL ?? process.env.APP_URL ?? "https://app.videoflow.ai"}/signup?ref={affiliate_code}`,
      payoutStatus: "playbook pronto; payout externo ainda nao integrado"
    },
    referralProgram: {
      status: "BETA",
      inviterRewardCredits: 500,
      invitedRewardCredits: 250,
      discount: "15% no primeiro mes",
      expirationDays: 30
    },
    emailFlows: [
      flow("Boas-vindas", "BETA", "Disparar apos cadastro e workspace criado."),
      flow("Onboarding", "BETA", "Guiar ate primeiro Magic e primeira exportacao."),
      flow("Creditos baixos", "REAL", "Baseado em credit_wallets e notificacoes operacionais."),
      flow("Renovacao", "BETA", "Depende do provedor de billing definitivo."),
      flow("Cancelamento", "BETA", "Depende de evento de subscription canceled."),
      flow("Reativacao", "BETA", "Lista de workspaces cancelados e sem video recente.")
    ],
    notifications: rows(notifications.data),
    campaigns: [
      { code: "BETA30", status: "BETA", reward: "30% no primeiro ciclo", guardrail: "usar apenas no beta fechado" },
      { code: "FIRSTVIDEO", status: "BETA", reward: "creditos bonus apos primeira exportacao", guardrail: "bloquear abuso por workspace" }
    ],
    feedback: {
      status: "REAL",
      storage: "audit_logs",
      npsEventsLast30d: rows(audit.data).filter((row) => row.entity_type === "growth_feedback").length
    },
    crm,
    commercialAudit: buildCommercialAudit({ mrr, providerCost, churnRate, recentVideos, recentExports, generatedVideos, exportedVideos, activeUsers }),
    generatedAt: new Date().toISOString()
  });
}

function empty(source: string) {
  return {
    source,
    errors: [],
    executive: { mrr: 0, arr: 0, churnRate: 0, cac: 0, ltv: 0, activeUsers: 0, generatedVideos: 0, exportedVideos: 0, providerCost: 0, grossMargin: 0 },
    funnel: [],
    productAnalytics: { timeToFirstVideoHours: 0, timeToFirstExportHours: 0, retention: { d1: 0, d7: 0, d30: 0 }, recentVideos: 0, recentExports: 0, churnRate: 0, ltv: 0 },
    affiliateProgram: { status: "DEMO", cookieDays: 0, commissionTiers: [], trackingPattern: "", payoutStatus: "supabase admin indisponivel" },
    referralProgram: { status: "DEMO", inviterRewardCredits: 0, invitedRewardCredits: 0, discount: "", expirationDays: 0 },
    emailFlows: [],
    notifications: [],
    campaigns: [],
    feedback: { status: "DEMO", storage: "indisponivel", npsEventsLast30d: 0 },
    crm: { leads: 0, trials: 0, activeCustomers: 0, canceled: 0 },
    commercialAudit: [],
    generatedAt: new Date().toISOString()
  };
}

function rows(value: unknown): Row[] {
  return Array.isArray(value) ? (value as Row[]) : [];
}

function amount(value: unknown) {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function monthlyRevenue(plan: Row | undefined, billingCycle: string) {
  if (!plan) return 0;
  if (billingCycle === "yearly") return amount(plan.yearly_price) / 12;
  return amount(plan.monthly_price);
}

function unique(values: unknown[]) {
  return new Set(values.filter(Boolean).map(String));
}

function rate(part: number, total: number) {
  return total > 0 ? Math.round((part / total) * 100) : 0;
}

function dateAfter(value: unknown, threshold: Date) {
  if (!value) return false;
  const date = new Date(String(value));
  return Number.isFinite(date.getTime()) && date >= threshold;
}

function funnelStep(name: string, count: number, previous: number, note: string) {
  return { name, count, conversion: previous > 0 ? Math.round((count / previous) * 100) : 0, note };
}

function flow(name: string, status: "REAL" | "BETA" | "DEMO", trigger: string) {
  return { name, status, trigger };
}

function estimateTimeToFirst(events: Row[], workspaces: Row[]) {
  const workspaceCreatedAt = new Map(workspaces.map((row) => [String(row.id), String(row.created_at)]));
  const deltas = events
    .map((event) => {
      const createdAt = workspaceCreatedAt.get(String(event.workspace_id));
      if (!createdAt || !event.created_at) return null;
      const delta = new Date(String(event.created_at)).getTime() - new Date(createdAt).getTime();
      return Number.isFinite(delta) && delta >= 0 ? delta / 1000 / 60 / 60 : null;
    })
    .filter((value): value is number => value !== null);
  if (!deltas.length) return 0;
  return Math.round(deltas.reduce((total, value) => total + value, 0) / deltas.length);
}

function buildCommercialAudit(input: {
  mrr: number;
  providerCost: number;
  churnRate: number;
  recentVideos: number;
  recentExports: number;
  generatedVideos: number;
  exportedVideos: number;
  activeUsers: number;
}) {
  const items = [
    input.mrr === 0 ? { severity: "high", title: "Receita ainda nao comprovada", message: "MRR esta zerado ou sem assinatura ativa.", action: "Validar billing real antes de liberar beta pago." } : null,
    input.generatedVideos > 0 && input.exportedVideos / input.generatedVideos < 0.35 ? { severity: "high", title: "Gargalo entre video e exportacao", message: "Poucos videos chegam ao pacote final.", action: "Priorizar onboarding para primeira exportacao e revisar erros do Export Center." } : null,
    input.providerCost > input.mrr && input.mrr > 0 ? { severity: "critical", title: "Margem negativa", message: "Custo de providers supera receita mensal.", action: "Ajustar creditos por plano e limites por provider." } : null,
    input.churnRate > 0.08 ? { severity: "medium", title: "Churn acima do alvo", message: `Churn estimado em ${Math.round(input.churnRate * 100)}%.`, action: "Acionar fluxo de reativacao e pesquisa de cancelamento." } : null,
    input.recentVideos === 0 && input.activeUsers > 0 ? { severity: "medium", title: "Usuarios sem producao recente", message: "Nao ha videos nos ultimos 7 dias.", action: "Enviar campanha de retorno com bonus de credito controlado." } : null,
    input.recentExports === 0 && input.recentVideos > 0 ? { severity: "medium", title: "Exportacao parada", message: "Ha videos recentes, mas nenhuma exportacao recente.", action: "Criar alerta operacional para preview/render/export." } : null
  ].filter(Boolean);
  return items.length ? items : [{ severity: "low", title: "Operacao comercial saudavel", message: "Nenhum gargalo critico detectado pelos dados atuais.", action: "Continuar monitorando funil, margem e primeira exportacao." }];
}

import { createAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import type { BillingFeature, FeatureUsageDecision, Plan, Subscription, UsageSnapshot } from "@/lib/types";

export const featureCosts: Record<BillingFeature, number> = {
  generate_script: 1.2,
  generate_voice: 2.4,
  generate_image: 3,
  render_video: 6,
  export_package: 1,
  generate_thumbnail: 4,
  viral_clips: 12,
  ai_video: 20,
  bulk_generation: 50,
  create_channel: 0,
  create_project: 0,
  invite_user: 0,
  white_label: 0
};

type DbPlan = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  monthly_price: number;
  yearly_price: number;
  included_credits: number;
  max_workspaces: number;
  max_channels: number;
  max_projects: number;
  max_team_members: number;
  max_videos_per_month: number;
  max_renders_per_month: number;
  max_ai_video_generations: number;
  max_viral_clips: number;
  watermark_enabled: boolean;
  priority_queue: boolean;
  white_label_enabled: boolean;
  status: Plan["status"];
  created_at: string;
  updated_at: string;
};

type DbSubscription = {
  id: string;
  workspace_id: string;
  plan_id: string;
  status: Subscription["status"];
  billing_cycle: Subscription["billingCycle"];
  current_period_start: string;
  current_period_end: string;
  trial_ends_at: string | null;
  cancel_at_period_end: boolean;
  provider: Subscription["provider"];
  provider_subscription_id: string | null;
  created_at: string;
  updated_at: string;
};

type DbWallet = {
  id: string;
  workspace_id: string;
  balance: number;
  reserved_balance?: number;
  monthly_allowance: number;
  purchased_credits: number;
  used_this_period: number;
  reset_at: string;
  created_at: string;
  updated_at: string;
};

type DbFeatureFlag = {
  feature_key: BillingFeature;
  enabled: boolean;
  limit_value: number | null;
};

export async function canUseFeature(workspaceId: string, feature: BillingFeature, requiredCredits = featureCosts[feature]): Promise<FeatureUsageDecision> {
  if (!workspaceId || workspaceId === "ws_1") {
    return decision(false, "Workspace real obrigatorio para billing.", "workspace_suspended", requiredCredits, 0);
  }

  if (!isSupabaseAdminConfigured()) {
    return decision(false, "Billing real exige Supabase service role configurada.", "subscription_inactive", requiredCredits, 0);
  }

  const supabase = createAdminClient();
  const { data: workspace } = await supabase.from("workspaces").select("id, status").eq("id", workspaceId).maybeSingle();
  if (!workspace) return decision(false, "Workspace nao encontrado.", "workspace_suspended", requiredCredits, 0);
  if (String(workspace.status ?? "active") !== "active") {
    return decision(false, "Workspace suspenso. Reative pelo Admin Master antes de gerar.", "workspace_suspended", requiredCredits, 0);
  }

  // Modelo BYOK: cada usuário usa as próprias chaves e paga o consumo direto no provedor.
  // Por isso a geração é liberada sem checar saldo de créditos ou limite de plano.
  // (A cobrança real vem do provedor; aqui só validamos que o workspace está ativo.)
  // Pode-se reativar o modelo de créditos definindo BYOK_MODE=false.
  const byokMode = process.env.BYOK_MODE !== "false";
  if (byokMode) {
    return decision(true, "BYOK: geracao liberada (chaves do proprio usuario).", "ok", 0, Number.MAX_SAFE_INTEGER);
  }

  const { data: subscriptionRow, error: subscriptionError } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("workspace_id", workspaceId)
    .in("status", ["trialing", "active"])
    .order("current_period_end", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (subscriptionError) throw new Error(`Falha ao consultar assinatura: ${subscriptionError.message}`);
  const subscription = subscriptionRow ? mapSubscription(subscriptionRow as DbSubscription) : undefined;
  if (!subscription) return decision(false, "Assinatura ativa nao encontrada.", "subscription_inactive", requiredCredits, 0);

  const { data: planRow, error: planError } = await supabase.from("plans").select("*").eq("id", subscription.planId).eq("status", "active").maybeSingle();
  if (planError) throw new Error(`Falha ao consultar plano: ${planError.message}`);
  const plan = planRow ? mapPlan(planRow as DbPlan) : undefined;
  if (!plan) return decision(false, "Plano ativo nao encontrado para este workspace.", "subscription_inactive", requiredCredits, 0);

  const wallet = await ensureCreditWallet(workspaceId, plan);
  const remainingCredits = Math.max(0, wallet.balance - Number(wallet.reserved_balance ?? 0));

  const { data: flagRows, error: flagError } = await supabase
    .from("feature_flags")
    .select("feature_key, enabled, limit_value")
    .or(`workspace_id.eq.${workspaceId},workspace_id.is.null`)
    .eq("feature_key", feature);
  if (flagError) throw new Error(`Falha ao consultar feature flag: ${flagError.message}`);
  const flag = ((flagRows ?? []) as DbFeatureFlag[]).find((item) => item.enabled === false) ?? ((flagRows ?? []) as DbFeatureFlag[])[0];

  if (flag && !flag.enabled) {
    return decision(false, "Recurso desativado por feature flag neste workspace.", "feature_not_in_plan", requiredCredits, remainingCredits, plan);
  }

  if (!featureIncludedInPlan(plan, feature)) {
    return decision(false, "Recurso nao incluso no plano atual.", "feature_not_in_plan", requiredCredits, remainingCredits, plan);
  }

  const usage = await getUsageSnapshot(workspaceId);
  const limitMessage = monthlyLimitMessage(plan, usage, feature, flag?.limit_value ?? undefined);
  if (limitMessage) return decision(false, limitMessage, "monthly_limit", requiredCredits, remainingCredits, plan);

  if (remainingCredits < requiredCredits) {
    return decision(false, `Creditos insuficientes. Necessario: ${requiredCredits}. Disponivel: ${remainingCredits}.`, "credits_insufficient", requiredCredits, remainingCredits, plan);
  }

  return decision(true, "Uso liberado pelo Supabase: plano, feature flag e saldo real.", "ok", requiredCredits, remainingCredits, plan);
}

export async function ensureCreditWallet(workspaceId: string, plan?: Plan) {
  const supabase = createAdminClient();
  const { data: existing, error } = await supabase.from("credit_wallets").select("*").eq("workspace_id", workspaceId).maybeSingle();
  if (error) throw new Error(`Falha ao consultar credit wallet: ${error.message}`);
  if (existing) return existing as DbWallet;

  const initialCredits = Number(plan?.includedCredits ?? 0);
  const { data: wallet, error: insertError } = await supabase
    .from("credit_wallets")
    .insert({
      workspace_id: workspaceId,
      balance: initialCredits,
      monthly_allowance: initialCredits,
      purchased_credits: 0,
      used_this_period: 0,
      reset_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    })
    .select("*")
    .single();
  if (insertError) throw new Error(`Falha ao criar credit wallet: ${insertError.message}`);

  if (initialCredits > 0) {
    await supabase.from("credit_transactions").insert({
      workspace_id: workspaceId,
      type: "monthly_grant",
      amount: initialCredits,
      balance_after: initialCredits,
      description: "Saldo inicial criado automaticamente para workspace."
    });
  }

  return wallet as DbWallet;
}

export async function getWorkspaceSubscription(workspaceId: string): Promise<Subscription | undefined> {
  if (!isSupabaseAdminConfigured()) return undefined;
  const { data, error } = await createAdminClient()
    .from("subscriptions")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("current_period_end", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`Falha ao consultar assinatura: ${error.message}`);
  return data ? mapSubscription(data as DbSubscription) : undefined;
}

export async function getSubscriptionPlan(subscription?: Subscription): Promise<Plan | undefined> {
  if (!subscription || !isSupabaseAdminConfigured()) return undefined;
  const { data, error } = await createAdminClient().from("plans").select("*").eq("id", subscription.planId).maybeSingle();
  if (error) throw new Error(`Falha ao consultar plano: ${error.message}`);
  return data ? mapPlan(data as DbPlan) : undefined;
}

async function getUsageSnapshot(workspaceId: string): Promise<UsageSnapshot> {
  const supabase = createAdminClient();
  const periodStart = new Date();
  periodStart.setUTCDate(1);
  periodStart.setUTCHours(0, 0, 0, 0);
  const since = periodStart.toISOString();

  const [renders, aiVideo, viralClips, channels, projects, teamMembers] = await Promise.all([
    countRows("video_renders", workspaceId, since),
    countRows("background_jobs", workspaceId, since, "type", "text_to_video"),
    countRows("background_jobs", workspaceId, since, "type", "viral_clip"),
    supabase.from("channels").select("id", { count: "exact", head: true }).eq("workspace_id", workspaceId),
    supabase.from("projects").select("id", { count: "exact", head: true }).eq("workspace_id", workspaceId),
    supabase.from("workspace_users").select("id", { count: "exact", head: true }).eq("workspace_id", workspaceId).eq("status", "active")
  ]);

  return {
    workspaceId,
    videosThisMonth: Number(renders.count ?? 0),
    rendersThisMonth: Number(renders.count ?? 0),
    aiVideoGenerations: Number(aiVideo.count ?? 0),
    viralClips: Number(viralClips.count ?? 0),
    channels: Number(channels.count ?? 0),
    projects: Number(projects.count ?? 0),
    teamMembers: Number(teamMembers.count ?? 0),
    workspaceSuspended: false
  };
}

async function countRows(table: string, workspaceId: string, since: string, column?: string, value?: string) {
  const supabase = createAdminClient();
  let query = supabase.from(table).select("id", { count: "exact", head: true }).eq("workspace_id", workspaceId).gte("created_at", since);
  if (column && value) query = query.eq(column, value);
  return query;
}

function mapPlan(row: DbPlan): Plan {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? "",
    monthlyPrice: Number(row.monthly_price),
    yearlyPrice: Number(row.yearly_price),
    includedCredits: Number(row.included_credits),
    maxWorkspaces: Number(row.max_workspaces),
    maxChannels: Number(row.max_channels),
    maxProjects: Number(row.max_projects),
    maxTeamMembers: Number(row.max_team_members),
    maxVideosPerMonth: Number(row.max_videos_per_month),
    maxRendersPerMonth: Number(row.max_renders_per_month),
    maxAiVideoGenerations: Number(row.max_ai_video_generations),
    maxViralClips: Number(row.max_viral_clips),
    watermarkEnabled: row.watermark_enabled,
    priorityQueue: row.priority_queue,
    whiteLabelEnabled: row.white_label_enabled,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapSubscription(row: DbSubscription): Subscription {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    planId: row.plan_id,
    status: row.status,
    billingCycle: row.billing_cycle,
    currentPeriodStart: row.current_period_start,
    currentPeriodEnd: row.current_period_end,
    trialEndsAt: row.trial_ends_at ?? undefined,
    cancelAtPeriodEnd: row.cancel_at_period_end,
    provider: row.provider,
    providerSubscriptionId: row.provider_subscription_id ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function decision(
  allowed: boolean,
  reason: string,
  code: FeatureUsageDecision["code"],
  requiredCredits: number,
  remainingCredits: number,
  plan?: Plan
): FeatureUsageDecision {
  return {
    allowed,
    reason,
    code,
    requiredCredits,
    remainingCredits,
    watermarkEnabled: plan?.watermarkEnabled ?? true
  };
}

function featureIncludedInPlan(plan: Plan, feature: BillingFeature) {
  if (feature === "white_label") return plan.whiteLabelEnabled;
  if (feature === "ai_video") return plan.maxAiVideoGenerations > 0;
  if (feature === "viral_clips") return plan.maxViralClips > 0;
  if (feature === "create_channel") return plan.maxChannels > 0;
  if (feature === "create_project") return plan.maxProjects > 0;
  if (feature === "invite_user") return plan.maxTeamMembers > 1;
  return true;
}

function monthlyLimitMessage(plan: Plan, usage: UsageSnapshot, feature: BillingFeature, overrideLimit?: number) {
  const limit = overrideLimit;
  if (feature === "render_video" && usage.rendersThisMonth >= (limit ?? plan.maxRendersPerMonth)) return "Limite mensal de renders atingido.";
  if (feature === "generate_script" && usage.videosThisMonth >= (limit ?? plan.maxVideosPerMonth)) return "Limite mensal de videos atingido.";
  if (feature === "ai_video" && usage.aiVideoGenerations >= (limit ?? plan.maxAiVideoGenerations)) return "Limite mensal de AI Video atingido.";
  if (feature === "viral_clips" && usage.viralClips >= (limit ?? plan.maxViralClips)) return "Limite mensal de cortes virais atingido.";
  if (feature === "create_channel" && usage.channels >= (limit ?? plan.maxChannels)) return "Limite de canais do plano atingido.";
  if (feature === "create_project" && usage.projects >= (limit ?? plan.maxProjects)) return "Limite de projetos do plano atingido.";
  if (feature === "invite_user" && usage.teamMembers >= (limit ?? plan.maxTeamMembers)) return "Limite de usuarios do plano atingido.";
  return "";
}

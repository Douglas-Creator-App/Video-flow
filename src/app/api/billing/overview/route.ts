import { NextResponse, type NextRequest } from "next/server";
import { requireWorkspace } from "@/lib/auth";
import { canUseFeature, ensureCreditWallet } from "@/lib/billing";
import { createAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import type { BillingFeature, BillingProvider, Plan, PlanStatus, Subscription, SubscriptionStatus } from "@/lib/types";

const billingFeatures: Array<{ label: string; feature: BillingFeature }> = [
  { label: "Roteiro", feature: "generate_script" },
  { label: "Voz", feature: "generate_voice" },
  { label: "Imagem", feature: "generate_image" },
  { label: "Render", feature: "render_video" },
  { label: "AI Video", feature: "ai_video" },
  { label: "White label", feature: "white_label" }
];

export async function GET(request: NextRequest) {
  const workspaceId = request.nextUrl.searchParams.get("workspace_id");
  if (!workspaceId) {
    return NextResponse.json({ error: "workspace_id obrigatorio." }, { status: 400 });
  }

  await requireWorkspace(workspaceId);

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json(
      { error: "Billing real exige Supabase service role configurada.", realMode: false },
      { status: 503 }
    );
  }

  const supabase = createAdminClient();
  const [
    subscriptionResult,
    plansResult,
    walletResult,
    transactionsResult,
    invoicesResult,
    eventsResult,
    channelsResult,
    projectsResult,
    teamMembersResult,
    rendersResult,
    aiVideoResult,
    viralClipsResult
  ] = await Promise.all([
    supabase
      .from("subscriptions")
      .select("*")
      .eq("workspace_id", workspaceId)
      .in("status", ["trialing", "active", "past_due"])
      .order("current_period_end", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("plans")
      .select("*")
      .eq("status", "active")
      .order("monthly_price", { ascending: true }),
    supabase.from("credit_wallets").select("*").eq("workspace_id", workspaceId).maybeSingle(),
    supabase
      .from("credit_transactions")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(12),
    supabase
      .from("invoices")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(12),
    supabase
      .from("billing_events")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(12),
    supabase.from("channels").select("id", { count: "exact", head: true }).eq("workspace_id", workspaceId),
    supabase.from("projects").select("id", { count: "exact", head: true }).eq("workspace_id", workspaceId),
    supabase.from("workspace_users").select("id", { count: "exact", head: true }).eq("workspace_id", workspaceId).eq("status", "active"),
    supabase.from("video_renders").select("id", { count: "exact", head: true }).eq("workspace_id", workspaceId),
    supabase.from("background_jobs").select("id", { count: "exact", head: true }).eq("workspace_id", workspaceId).eq("type", "text_to_video"),
    supabase.from("background_jobs").select("id", { count: "exact", head: true }).eq("workspace_id", workspaceId).eq("type", "viral_clip")
  ]);

  const firstError = [
    subscriptionResult.error,
    plansResult.error,
    walletResult.error,
    transactionsResult.error,
    invoicesResult.error,
    eventsResult.error,
    channelsResult.error,
    projectsResult.error,
    teamMembersResult.error,
    rendersResult.error,
    aiVideoResult.error,
    viralClipsResult.error
  ].find(Boolean);
  if (firstError) {
    return NextResponse.json({ error: firstError.message }, { status: 500 });
  }

  const plans = (plansResult.data ?? []).map(mapPlan);
  const subscription = subscriptionResult.data ? mapSubscription(subscriptionResult.data) : null;
  const currentPlan = subscription ? plans.find((plan) => plan.id === subscription.planId) ?? null : null;
  const wallet = walletResult.data
    ? mapWallet(walletResult.data)
    : currentPlan
      ? mapWallet(await ensureCreditWallet(workspaceId, currentPlan))
      : null;

  const featureChecks = await Promise.all(
    billingFeatures.map(async (item) => ({
      ...item,
      decision: await canUseFeature(workspaceId, item.feature)
    }))
  );

  return NextResponse.json({
    realMode: true,
    subscription,
    currentPlan,
    plans,
    wallet,
    usage: {
      channels: channelsResult.count ?? 0,
      projects: projectsResult.count ?? 0,
      teamMembers: teamMembersResult.count ?? 0,
      videosThisMonth: rendersResult.count ?? 0,
      rendersThisMonth: rendersResult.count ?? 0,
      aiVideoGenerations: aiVideoResult.count ?? 0,
      viralClips: viralClipsResult.count ?? 0,
      workspaceSuspended: false
    },
    featureChecks,
    transactions: (transactionsResult.data ?? []).map(mapTransaction),
    invoices: (invoicesResult.data ?? []).map(mapInvoice),
    events: (eventsResult.data ?? []).map(mapBillingEvent)
  });
}

function mapPlan(row: Record<string, unknown>): Plan {
  return {
    id: String(row.id),
    name: String(row.name),
    slug: String(row.slug),
    description: String(row.description ?? ""),
    monthlyPrice: Number(row.monthly_price ?? 0),
    yearlyPrice: Number(row.yearly_price ?? 0),
    includedCredits: Number(row.included_credits ?? 0),
    maxWorkspaces: Number(row.max_workspaces ?? 0),
    maxChannels: Number(row.max_channels ?? 0),
    maxProjects: Number(row.max_projects ?? 0),
    maxTeamMembers: Number(row.max_team_members ?? 0),
    maxVideosPerMonth: Number(row.max_videos_per_month ?? 0),
    maxRendersPerMonth: Number(row.max_renders_per_month ?? 0),
    maxAiVideoGenerations: Number(row.max_ai_video_generations ?? 0),
    maxViralClips: Number(row.max_viral_clips ?? 0),
    watermarkEnabled: Boolean(row.watermark_enabled),
    priorityQueue: Boolean(row.priority_queue),
    whiteLabelEnabled: Boolean(row.white_label_enabled),
    status: String(row.status ?? "active") as PlanStatus,
    createdAt: String(row.created_at ?? ""),
    updatedAt: String(row.updated_at ?? "")
  };
}

function mapSubscription(row: Record<string, unknown>): Subscription {
  return {
    id: String(row.id ?? ""),
    workspaceId: String(row.workspace_id ?? ""),
    planId: String(row.plan_id ?? ""),
    status: String(row.status ?? "trialing") as SubscriptionStatus,
    billingCycle: String(row.billing_cycle ?? "monthly") as Subscription["billingCycle"],
    currentPeriodStart: String(row.current_period_start ?? ""),
    currentPeriodEnd: String(row.current_period_end ?? ""),
    trialEndsAt: row.trial_ends_at ? String(row.trial_ends_at) : undefined,
    cancelAtPeriodEnd: Boolean(row.cancel_at_period_end),
    provider: String(row.provider ?? "placeholder") as BillingProvider,
    providerSubscriptionId: row.provider_subscription_id ? String(row.provider_subscription_id) : undefined,
    createdAt: String(row.created_at ?? ""),
    updatedAt: String(row.updated_at ?? "")
  };
}

function mapWallet(row: Record<string, unknown>) {
  return {
    id: String(row.id ?? ""),
    workspaceId: String(row.workspace_id ?? ""),
    balance: Number(row.balance ?? 0),
    reservedBalance: Number(row.reserved_balance ?? 0),
    monthlyAllowance: Number(row.monthly_allowance ?? 0),
    purchasedCredits: Number(row.purchased_credits ?? 0),
    usedThisPeriod: Number(row.used_this_period ?? 0),
    resetAt: String(row.reset_at ?? ""),
    createdAt: String(row.created_at ?? ""),
    updatedAt: String(row.updated_at ?? "")
  };
}

function mapTransaction(row: Record<string, unknown>) {
  return {
    id: String(row.id ?? ""),
    type: String(row.type ?? ""),
    amount: Number(row.amount ?? 0),
    balanceAfter: Number(row.balance_after ?? 0),
    description: String(row.description ?? ""),
    referenceType: row.reference_type ? String(row.reference_type) : undefined,
    referenceId: row.reference_id ? String(row.reference_id) : undefined,
    createdAt: String(row.created_at ?? "")
  };
}

function mapInvoice(row: Record<string, unknown>) {
  return {
    id: String(row.id ?? ""),
    status: String(row.status ?? "draft"),
    amount: Number(row.amount ?? 0),
    currency: String(row.currency ?? "BRL"),
    providerInvoiceId: row.provider_invoice_id ? String(row.provider_invoice_id) : undefined,
    invoiceUrl: row.invoice_url ? String(row.invoice_url) : undefined,
    createdAt: String(row.created_at ?? "")
  };
}

function mapBillingEvent(row: Record<string, unknown>) {
  return {
    id: String(row.id ?? ""),
    provider: String(row.provider ?? "placeholder"),
    eventType: String(row.event_type ?? ""),
    status: String(row.status ?? "pending"),
    createdAt: String(row.created_at ?? "")
  };
}

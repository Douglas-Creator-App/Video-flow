import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { createAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";

type WorkspaceRow = {
  id: string;
  name: string;
  slug: string;
  plan: string;
  status?: string | null;
  owner_id: string;
};

type WorkspaceUserRow = {
  workspace_id: string;
  role_id: string;
  status: string;
};

type RoleRow = {
  id: string;
  name: string;
  is_system: boolean;
};

type PermissionRow = {
  role_id: string;
  permission: { key: string } | Array<{ key: string }> | null;
};

export async function GET(request: Request) {
  const { user } = await requireAuth();
  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ user: { id: user.id, email: user.email ?? null, profile: null }, workspaces: [], currentWorkspace: null, selectedWorkspaceId: null });
  }

  const url = new URL(request.url);
  const requestedWorkspaceId = url.searchParams.get("workspace_id");
  const admin = createAdminClient();

  const [profileResult, membershipsResult] = await Promise.all([
    admin.from("user_profiles").select("full_name, avatar_url").eq("id", user.id).maybeSingle(),
    admin.from("workspace_users").select("workspace_id, role_id, status").eq("user_id", user.id).eq("status", "active")
  ]);

  const memberships = (membershipsResult.data ?? []) as WorkspaceUserRow[];
  const workspaceIds = memberships.map((item) => item.workspace_id);
  if (!workspaceIds.length) {
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email ?? null,
        profile: profileResult.data ?? null
      },
      workspaces: [],
      currentWorkspace: null,
      selectedWorkspaceId: null
    });
  }

  const [workspacesResult, rolesResult, permissionsResult, subscriptionsResult, plansResult, walletsResult, flagsResult] = await Promise.all([
    admin.from("workspaces").select("id, name, slug, plan, owner_id, status").in("id", workspaceIds),
    admin.from("roles").select("id, name, is_system").in("id", memberships.map((item) => item.role_id)),
    admin.from("role_permissions").select("role_id, permission:permissions(key)").in("role_id", memberships.map((item) => item.role_id)),
    admin.from("subscriptions").select("workspace_id, plan_id, status, billing_cycle, current_period_start, current_period_end, trial_ends_at, cancel_at_period_end, provider, provider_subscription_id, created_at, updated_at").in("workspace_id", workspaceIds).in("status", ["trialing", "active"]),
    admin.from("plans").select("id, name, slug, description, monthly_price, yearly_price, included_credits, max_workspaces, max_channels, max_projects, max_team_members, max_videos_per_month, max_renders_per_month, max_ai_video_generations, max_viral_clips, watermark_enabled, priority_queue, white_label_enabled, status, created_at, updated_at").eq("status", "active"),
    admin.from("credit_wallets").select("workspace_id, balance, reserved_balance, monthly_allowance, purchased_credits, used_this_period, reset_at, created_at, updated_at").in("workspace_id", workspaceIds),
    admin.from("feature_flags").select("workspace_id, feature_key, enabled, limit_value").or(`workspace_id.is.null,workspace_id.in.(${workspaceIds.join(",")})`)
  ]);

  if (workspacesResult.error) throw new Error(`Falha ao carregar workspaces: ${workspacesResult.error.message}`);
  if (rolesResult.error) throw new Error(`Falha ao carregar roles: ${rolesResult.error.message}`);
  if (permissionsResult.error) throw new Error(`Falha ao carregar permissions: ${permissionsResult.error.message}`);
  if (subscriptionsResult.error) throw new Error(`Falha ao carregar subscriptions: ${subscriptionsResult.error.message}`);
  if (plansResult.error) throw new Error(`Falha ao carregar plans: ${plansResult.error.message}`);
  if (walletsResult.error) throw new Error(`Falha ao carregar wallets: ${walletsResult.error.message}`);
  if (flagsResult.error) throw new Error(`Falha ao carregar feature flags: ${flagsResult.error.message}`);

  const workspaces = (workspacesResult.data ?? []) as WorkspaceRow[];
  const roles = new Map((rolesResult.data ?? []).map((role: RoleRow) => [role.id, role]));
  const permissionsByRole = new Map<string, string[]>();
  for (const row of (permissionsResult.data ?? []) as PermissionRow[]) {
    const permission = Array.isArray(row.permission) ? row.permission[0] : row.permission;
    const key = permission?.key;
    if (!key) continue;
    const list = permissionsByRole.get(row.role_id) ?? [];
    list.push(key);
    permissionsByRole.set(row.role_id, list);
  }
  const planById = new Map((plansResult.data ?? []).map((plan) => [plan.id, plan]));
  const subscriptionByWorkspace = new Map((subscriptionsResult.data ?? []).map((sub) => [sub.workspace_id, sub]));
  const walletByWorkspace = new Map((walletsResult.data ?? []).map((wallet) => [wallet.workspace_id, wallet]));
  const flags = (flagsResult.data ?? []).filter((flag) => flag.workspace_id === null || workspaceIds.includes(flag.workspace_id));

  const selectedWorkspaceId = requestedWorkspaceId && workspaceIds.includes(requestedWorkspaceId) ? requestedWorkspaceId : workspaceIds[0];
  const membershipByWorkspace = new Map(memberships.map((item) => [item.workspace_id, item]));

  const summaries = workspaces.map((workspace) => {
    const membership = membershipByWorkspace.get(workspace.id);
    const role = membership ? roles.get(membership.role_id) : undefined;
    const permissions = membership ? permissionsByRole.get(membership.role_id) ?? [] : [];
    const subscription = subscriptionByWorkspace.get(workspace.id);
    const plan = subscription ? planById.get(subscription.plan_id) : null;
    const wallet = walletByWorkspace.get(workspace.id) ?? null;
    return {
      id: workspace.id,
      name: workspace.name,
      slug: workspace.slug,
      plan: workspace.plan,
      status: workspace.status ?? "active",
      role: role?.name ?? "Member",
      isOwner: workspace.owner_id === user.id,
      permissions,
      subscription: subscription ? mapSubscription(subscription) : null,
      planDetails: plan ? mapPlan(plan) : null,
      wallet: wallet ? mapWallet(wallet) : null
    };
  });

  const currentWorkspace = summaries.find((item) => item.id === selectedWorkspaceId) ?? summaries[0] ?? null;
  const currentFeatureFlags = flags.filter((flag) => flag.workspace_id === null || flag.workspace_id === currentWorkspace?.id);

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email ?? null,
      profile: profileResult.data ?? null
    },
    workspaces: summaries,
    currentWorkspace,
    featureFlags: currentFeatureFlags,
    selectedWorkspaceId: currentWorkspace?.id ?? null
  });
}

function mapPlan(row: Record<string, unknown>) {
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
    status: String(row.status ?? "active"),
    createdAt: String(row.created_at ?? ""),
    updatedAt: String(row.updated_at ?? "")
  };
}

function mapSubscription(row: Record<string, unknown>) {
  return {
    id: String(row.id ?? ""),
    workspaceId: String(row.workspace_id ?? ""),
    planId: String(row.plan_id ?? ""),
    status: String(row.status ?? "trialing"),
    billingCycle: String(row.billing_cycle ?? "monthly"),
    currentPeriodStart: String(row.current_period_start ?? ""),
    currentPeriodEnd: String(row.current_period_end ?? ""),
    trialEndsAt: row.trial_ends_at ? String(row.trial_ends_at) : undefined,
    cancelAtPeriodEnd: Boolean(row.cancel_at_period_end),
    provider: String(row.provider ?? "placeholder"),
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
    reserved_balance: Number(row.reserved_balance ?? 0),
    monthlyAllowance: Number(row.monthly_allowance ?? 0),
    purchasedCredits: Number(row.purchased_credits ?? 0),
    usedThisPeriod: Number(row.used_this_period ?? 0),
    resetAt: String(row.reset_at ?? ""),
    createdAt: String(row.created_at ?? ""),
    updatedAt: String(row.updated_at ?? "")
  };
}

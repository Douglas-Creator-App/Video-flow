import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { persistAuditLog } from "@/lib/audit-server";
import { recordSecurityEvent, recordRateLimitHit, resolveRateLimitConfig } from "@/lib/security";

export class AuthError extends Error {
  status: number;
  code: string;

  constructor(message: string, status = 401, code = "unauthorized") {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export type AuthUser = {
  id: string;
  email?: string | null;
};

export type AuthContext = {
  user: AuthUser;
  workspaceId?: string;
  permissions: Set<string>;
  role?: string;
  isOwner?: boolean;
  isAdmin?: boolean;
};

export async function requireAuth() {
  const supabase = await createBrowserSafeServerClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    throw new AuthError("Autenticacao obrigatoria.", 401, "auth_required");
  }
  return { user: data.user, supabase };
}

export async function requireAdmin(workspaceId?: string) {
  const { user } = await requireAuth();
  const admin = isSupabaseAdminConfigured() ? createAdminClient() : null;

  if (admin) {
    const { data: platformAdmin } = await admin
      .from("platform_admins")
      .select("status, role")
      .eq("user_id", user.id)
      .maybeSingle();
    if (platformAdmin?.status === "active") return { user, isPlatformAdmin: true, role: platformAdmin.role ?? "admin" };
  }

  if (!workspaceId) throw new AuthError("Permissao administrativa obrigatoria.", 403, "admin_required");
  const workspace = await resolveWorkspaceAccess(workspaceId, user.id);
  if (!workspace.isOwner) {
    await recordSecurityEvent({
      workspaceId,
      userId: user.id,
      eventType: "permission_denied",
      severity: "high",
      metadata: { permission: "admin_required" }
    });
    throw new AuthError("Permissao administrativa obrigatoria.", 403, "admin_required");
  }
  return workspace;
}

export async function requireWorkspace(workspaceId: string) {
  const { user } = await requireAuth();
  return resolveWorkspaceAccess(workspaceId, user.id);
}

export async function requirePermission(workspaceId: string, permissionKey: string) {
  const workspace = await requireWorkspace(workspaceId);
  if (workspace.isOwner) return workspace;
  if (workspace.permissions.has(permissionKey)) return workspace;
  await recordSecurityEvent({
    workspaceId,
    userId: workspace.user.id,
    eventType: "permission_denied",
    severity: "high",
    metadata: { permission: permissionKey }
  });
  throw new AuthError("Permissao insuficiente.", 403, "permission_denied");
}

export async function requireRateLimit(input: {
  workspaceId: string;
  feature: string;
  route: string;
  userId: string;
  metadata?: Record<string, unknown>;
}) {
  if (!isSupabaseAdminConfigured()) return;
  const config = await resolveRateLimitConfig(input.workspaceId, input.feature);
  const windowStartedAt = new Date(Date.now() - config.windowSeconds * 1000).toISOString();
  const admin = createAdminClient();
  const { count: eventCount, error } = await admin
    .from("rate_limit_events")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", input.workspaceId)
    .eq("feature", input.feature)
    .gte("created_at", windowStartedAt);
  if (error) throw new Error(`Falha ao ler rate limit: ${error.message}`);
  const count = eventCount ?? 0;
  if (count >= config.limitCount) {
    await recordSecurityEvent({
      workspaceId: input.workspaceId,
      userId: input.userId,
      eventType: "credit_block",
      severity: "high",
      metadata: { feature: input.feature, route: input.route, reason: "rate_limit_exceeded", limit: config.limitCount, windowSeconds: config.windowSeconds, ...input.metadata }
    });
    throw new AuthError("Limite de uso atingido. Aguarde a janela de rate limit.", 429, "rate_limited");
  }
  await recordRateLimitHit({
    workspaceId: input.workspaceId,
    userId: input.userId,
    feature: input.feature,
    route: input.route,
    metadata: input.metadata
  });
}

export async function recordAuthAudit(action: "login" | "logout" | "create" | "delete" | "update", input: {
  workspaceId?: string | null;
  entityType?: string;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  await persistAuditLog({
    action,
    workspaceId: input.workspaceId ?? null,
    entityType: input.entityType ?? null,
    entityId: input.entityId ?? null,
    metadata: input.metadata ?? {}
  });
}

async function createBrowserSafeServerClient() {
  const cookieStore = await cookies();
  type CookieToSet = {
    name: string;
    value: string;
    options?: Parameters<typeof cookieStore.set>[2];
  };
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server components and route handlers may not mutate cookies here.
        }
      }
    }
  });
}

async function resolveWorkspaceAccess(workspaceId: string, userId: string): Promise<AuthContext> {
  const admin = createAdminClient();
  const { data: workspace, error: workspaceError } = await admin
    .from("workspaces")
    .select("id, owner_id, name, slug")
    .eq("id", workspaceId)
    .maybeSingle();
  if (workspaceError || !workspace) throw new AuthError("Workspace nao encontrado.", 404, "workspace_not_found");

  if (workspace.owner_id === userId) {
    return {
      user: { id: userId },
      workspaceId: workspace.id,
      permissions: new Set(["*"]),
      role: "Owner",
      isOwner: true,
      isAdmin: true
    };
  }

  const { data: membership, error: membershipError } = await admin
    .from("workspace_users")
    .select("id, role_id, status")
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId)
    .maybeSingle();
  if (membershipError || !membership || membership.status !== "active") {
    await recordSecurityEvent({
      workspaceId,
      userId,
      eventType: "permission_denied",
      severity: "high",
      metadata: { reason: "workspace_membership_missing_or_inactive" }
    });
    throw new AuthError("Acesso ao workspace negado.", 403, "workspace_forbidden");
  }

  const [{ data: role }, { data: permissionRows }] = await Promise.all([
    admin.from("roles").select("name, is_system").eq("id", membership.role_id).maybeSingle(),
    admin
      .from("role_permissions")
      .select("permission:permissions(key)")
      .eq("role_id", membership.role_id)
  ]);

  const permissions = new Set(
    (permissionRows ?? [])
      .map((item) => (item.permission as { key?: string } | null)?.key)
      .filter((key): key is string => Boolean(key))
  );

  return {
    user: { id: userId },
    workspaceId: workspace.id,
    permissions,
    role: role?.name ?? "Member",
    isOwner: false,
    isAdmin: role?.is_system ?? false
  };
}

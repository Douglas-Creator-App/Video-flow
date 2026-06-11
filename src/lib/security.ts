import { createAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";

const defaultLimits: Record<string, { limitCount: number; windowSeconds: number }> = {
  openai_text: { limitCount: 60, windowSeconds: 60 },
  openai_tts: { limitCount: 20, windowSeconds: 60 },
  openai_images: { limitCount: 30, windowSeconds: 60 },
  export_package: { limitCount: 10, windowSeconds: 3600 },
  render_video: { limitCount: 12, windowSeconds: 3600 },
  jobs: { limitCount: 120, windowSeconds: 3600 },
  providers_test: { limitCount: 12, windowSeconds: 3600 },
  storage_signed_url: { limitCount: 30, windowSeconds: 3600 }
};

export async function recordSecurityEvent(input: {
  workspaceId: string;
  userId?: string | null;
  eventType: "login" | "failed_login" | "permission_denied" | "api_key_changed" | "workspace_suspended" | "provider_error" | "credit_block" | "admin_action";
  severity?: "low" | "medium" | "high" | "critical";
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, unknown>;
}) {
  if (!isSupabaseAdminConfigured()) return { skipped: true };
  const admin = createAdminClient();
  const { error } = await admin.from("security_events").insert({
    workspace_id: input.workspaceId,
    user_id: input.userId ?? null,
    event_type: input.eventType,
    severity: input.severity ?? "low",
    ip_address: input.ipAddress ?? null,
    user_agent: input.userAgent ?? null,
    metadata: input.metadata ?? {}
  });
  if (error) throw new Error(`Falha ao persistir security event: ${error.message}`);
  return { inserted: true };
}

export async function recordRateLimitHit(input: {
  workspaceId: string;
  userId: string;
  feature: string;
  route: string;
  metadata?: Record<string, unknown>;
}) {
  if (!isSupabaseAdminConfigured()) return { skipped: true };
  const admin = createAdminClient();
  const { error } = await admin.from("rate_limit_events").insert({
    workspace_id: input.workspaceId,
    user_id: input.userId,
    feature: input.feature,
    route: input.route,
    metadata: input.metadata ?? {}
  });
  if (error) throw new Error(`Falha ao persistir rate limit: ${error.message}`);
  return { inserted: true };
}

export async function resolveRateLimitConfig(workspaceId: string, feature: string) {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("rate_limits")
    .select("feature, limit_count, window_seconds")
    .eq("workspace_id", workspaceId)
    .eq("feature", feature)
    .maybeSingle();
  if (error) throw new Error(`Falha ao ler configuracao de rate limit: ${error.message}`);
  if (data) return { limitCount: data.limit_count, windowSeconds: data.window_seconds };
  return defaultLimits[feature] ?? { limitCount: 60, windowSeconds: 60 };
}

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";

export async function persistAuditLogWithSession(input: {
  action: "login" | "logout" | "create" | "delete" | "update";
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}) {
  const cookieStore = await cookies();
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll() {
        // no-op in server audit helper
      }
    }
  });
  const { data } = await supabase.auth.getUser();
  await persistAuditLog({
    ...input,
    actorId: data.user?.id ?? null
  });
}

export async function persistAuditLog(input: {
  action: "login" | "logout" | "create" | "delete" | "update";
  workspaceId?: string | null;
  actorId?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  if (!isSupabaseAdminConfigured()) return { skipped: true };
  const admin = createAdminClient();
  const { error } = await admin.from("audit_logs").insert({
    workspace_id: input.workspaceId ?? null,
    actor_id: input.actorId ?? null,
    action: input.action,
    entity_type: input.entityType ?? null,
    entity_id: input.entityId ?? null,
    metadata: input.metadata ?? {},
    ip_address: input.ipAddress ?? null,
    user_agent: input.userAgent ?? null
  });
  if (error) throw new Error(`Falha ao persistir audit log: ${error.message}`);
  return { inserted: true };
}

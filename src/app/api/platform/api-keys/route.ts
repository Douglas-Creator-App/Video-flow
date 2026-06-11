import { NextResponse, type NextRequest } from "next/server";
import { requirePermission } from "@/lib/auth";
import { createAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { createPublicApiKey, PLATFORM_SCOPES } from "@/lib/platform/api-keys";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get("workspace_id") ?? "";
  if (!workspaceId) return NextResponse.json({ error: "workspace_id obrigatorio." }, { status: 400 });
  await requirePermission(workspaceId, "admin.manage");
  if (!isSupabaseAdminConfigured()) return NextResponse.json({ keys: [], source: "supabase_unconfigured" });
  const { data, error } = await createAdminClient()
    .from("public_api_keys")
    .select("id, name, key_prefix, scopes, status, rate_limit_per_minute, last_used_at, expires_at, created_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ keys: data ?? [], availableScopes: PLATFORM_SCOPES });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const workspaceId = String(body.workspace_id ?? "");
  if (!workspaceId) return NextResponse.json({ error: "workspace_id obrigatorio." }, { status: 400 });
  const context = await requirePermission(workspaceId, "admin.manage");
  if (!isSupabaseAdminConfigured()) return NextResponse.json({ error: "Supabase admin nao configurado." }, { status: 503 });

  const scopes = Array.isArray(body.scopes) ? body.scopes.map(String).filter((scope: string) => scope === "*" || PLATFORM_SCOPES.includes(scope as never)) : ["jobs.read", "credits.read"];
  const key = createPublicApiKey();
  const { data, error } = await createAdminClient().from("public_api_keys").insert({
    workspace_id: workspaceId,
    name: String(body.name ?? "API key"),
    key_prefix: key.prefix,
    key_hash: key.hash,
    scopes,
    rate_limit_per_minute: Number(body.rate_limit_per_minute ?? 60),
    expires_at: body.expires_at ?? null,
    created_by: context.user.id
  }).select("id, name, key_prefix, scopes, status, rate_limit_per_minute, created_at").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ key: data, secret: key.secret, warning: "Copie agora. O segredo nao sera exibido novamente." });
}

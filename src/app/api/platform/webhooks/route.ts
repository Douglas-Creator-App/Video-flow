import { NextResponse, type NextRequest } from "next/server";
import { requirePermission } from "@/lib/auth";
import { createWebhookSecret } from "@/lib/platform/webhooks";
import { createAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";

const allowedEvents = ["job_completed", "render_completed", "export_ready", "credits_low", "subscription_updated", "*"];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get("workspace_id") ?? "";
  if (!workspaceId) return NextResponse.json({ error: "workspace_id obrigatorio." }, { status: 400 });
  await requirePermission(workspaceId, "admin.manage");
  if (!isSupabaseAdminConfigured()) return NextResponse.json({ endpoints: [], deliveries: [], source: "supabase_unconfigured" });
  const supabase = createAdminClient();
  const [endpoints, deliveries] = await Promise.all([
    supabase.from("webhook_endpoints").select("id, url, events, status, failure_count, last_delivery_at, created_at").eq("workspace_id", workspaceId).order("created_at", { ascending: false }),
    supabase.from("webhook_deliveries").select("id, endpoint_id, event_type, status, http_status, error_message, attempts, created_at").eq("workspace_id", workspaceId).order("created_at", { ascending: false }).limit(40)
  ]);
  const error = endpoints.error ?? deliveries.error;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ endpoints: endpoints.data ?? [], deliveries: deliveries.data ?? [], allowedEvents });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const workspaceId = String(body.workspace_id ?? "");
  if (!workspaceId) return NextResponse.json({ error: "workspace_id obrigatorio." }, { status: 400 });
  const context = await requirePermission(workspaceId, "admin.manage");
  if (!isSupabaseAdminConfigured()) return NextResponse.json({ error: "Supabase admin nao configurado." }, { status: 503 });
  const url = String(body.url ?? "");
  const urlValidation = validateWebhookUrl(url);
  if (urlValidation) return NextResponse.json({ error: urlValidation }, { status: 400 });
  const events = Array.isArray(body.events) ? body.events.map(String).filter((event: string) => allowedEvents.includes(event)) : ["job_completed"];
  const secret = createWebhookSecret();
  const { data, error } = await createAdminClient().from("webhook_endpoints").insert({
    workspace_id: workspaceId,
    url,
    events,
    secret_encrypted: secret,
    created_by: context.user.id
  }).select("id, url, events, status, created_at").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ endpoint: data, secret, warning: "Copie agora. O segredo assina os webhooks e nao sera exibido novamente." });
}

function validateWebhookUrl(value: string) {
  try {
    const url = new URL(value);
    const isLocal = ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
    if (url.protocol === "https:") return "";
    if (process.env.NODE_ENV !== "production" && isLocal && url.protocol === "http:") return "";
    return "Webhook deve usar HTTPS. HTTP so e aceito para localhost em desenvolvimento.";
  } catch {
    return "URL de webhook invalida.";
  }
}

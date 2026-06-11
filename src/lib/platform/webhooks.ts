import { createHmac, randomBytes } from "node:crypto";
import { createAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";

export type PlatformWebhookEvent =
  | "job_completed"
  | "render_completed"
  | "export_ready"
  | "credits_low"
  | "subscription_updated";

export function createWebhookSecret() {
  return `whsec_${randomBytes(24).toString("base64url")}`;
}

export async function emitPlatformWebhook(input: {
  workspaceId: string;
  eventType: PlatformWebhookEvent;
  payload: Record<string, unknown>;
}) {
  if (!isSupabaseAdminConfigured()) return { delivered: 0, skipped: true };
  const supabase = createAdminClient();
  const { data: endpoints, error } = await supabase
    .from("webhook_endpoints")
    .select("id, url, secret_encrypted, events, status")
    .eq("workspace_id", input.workspaceId)
    .eq("status", "active");
  if (error) throw new Error(`Falha ao buscar webhooks: ${error.message}`);

  const targets = (endpoints ?? []).filter((endpoint) => {
    const events = Array.isArray(endpoint.events) ? endpoint.events.map(String) : [];
    return events.includes(input.eventType) || events.includes("*");
  });

  let delivered = 0;
  for (const endpoint of targets) {
    const payload = {
      id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      type: input.eventType,
      workspace_id: input.workspaceId,
      created_at: new Date().toISOString(),
      data: input.payload
    };
    const body = JSON.stringify(payload);
    const signature = signWebhookPayload(body, String(endpoint.secret_encrypted));
    const { data: delivery } = await supabase.from("webhook_deliveries").insert({
      workspace_id: input.workspaceId,
      endpoint_id: endpoint.id,
      event_type: input.eventType,
      payload,
      status: "pending",
      attempts: 1
    }).select("id").single();

    try {
      const response = await fetch(String(endpoint.url), {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "user-agent": "VideoFlow-Webhooks/1.0",
          "x-video-flow-event": input.eventType,
          "x-video-flow-signature": signature
        },
        body
      });
      const ok = response.ok;
      await supabase.from("webhook_deliveries").update({
        status: ok ? "delivered" : "failed",
        http_status: response.status,
        error_message: ok ? null : `HTTP ${response.status}`,
        delivered_at: ok ? new Date().toISOString() : null
      }).eq("id", delivery?.id);
      await supabase.from("webhook_endpoints").update({
        failure_count: ok ? 0 : 1,
        last_delivery_at: new Date().toISOString()
      }).eq("id", endpoint.id);
      if (ok) delivered += 1;
    } catch (error) {
      await supabase.from("webhook_deliveries").update({
        status: "failed",
        error_message: error instanceof Error ? error.message : "Falha de rede"
      }).eq("id", delivery?.id);
      await supabase.from("webhook_endpoints").update({
        failure_count: 1,
        last_delivery_at: new Date().toISOString()
      }).eq("id", endpoint.id);
    }
  }

  return { delivered, skipped: false };
}

export function signWebhookPayload(body: string, secret: string) {
  return `sha256=${createHmac("sha256", secret).update(body).digest("hex")}`;
}

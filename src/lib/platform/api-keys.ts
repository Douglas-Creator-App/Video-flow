import { createHash, randomBytes } from "node:crypto";
import type { NextRequest } from "next/server";
import { createAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";

export const PLATFORM_SCOPES = [
  "projects.write",
  "render.write",
  "jobs.read",
  "exports.write",
  "credits.read",
  "marketplace.write",
  "webhooks.write"
] as const;

export type PlatformScope = (typeof PLATFORM_SCOPES)[number];

export type PublicApiKeyContext = {
  id: string;
  workspaceId: string;
  name: string;
  scopes: string[];
  rateLimitPerMinute: number;
};

export function createPublicApiKey() {
  const secret = `vf_live_${randomBytes(32).toString("base64url")}`;
  return {
    secret,
    prefix: secret.slice(0, 15),
    hash: hashApiKey(secret)
  };
}

export function hashApiKey(secret: string) {
  return createHash("sha256").update(secret).digest("hex");
}

export async function authenticatePublicApiKey(request: NextRequest, requiredScope: PlatformScope): Promise<PublicApiKeyContext> {
  if (!isSupabaseAdminConfigured()) throw new PlatformAuthError("Supabase admin nao configurado.", 503, "platform_unconfigured");
  const token = extractToken(request);
  if (!token) throw new PlatformAuthError("API key obrigatoria.", 401, "api_key_required");

  const supabase = createAdminClient();
  const keyHash = hashApiKey(token);
  const { data, error } = await supabase
    .from("public_api_keys")
    .select("id, workspace_id, name, scopes, status, rate_limit_per_minute, expires_at")
    .eq("key_hash", keyHash)
    .maybeSingle();

  if (error) throw new PlatformAuthError(`Falha ao validar API key: ${error.message}`, 500, "api_key_lookup_failed");
  if (!data || data.status !== "active") throw new PlatformAuthError("API key invalida ou revogada.", 401, "api_key_invalid");
  if (data.expires_at && new Date(data.expires_at).getTime() < Date.now()) throw new PlatformAuthError("API key expirada.", 401, "api_key_expired");

  const scopes = Array.isArray(data.scopes) ? data.scopes.map(String) : [];
  if (!scopes.includes(requiredScope) && !scopes.includes("*")) throw new PlatformAuthError("Escopo insuficiente para esta API.", 403, "scope_denied");

  const context = {
    id: String(data.id),
    workspaceId: String(data.workspace_id),
    name: String(data.name),
    scopes,
    rateLimitPerMinute: Number(data.rate_limit_per_minute ?? 60)
  };
  await enforcePublicRateLimit(context);
  await supabase.from("public_api_keys").update({ last_used_at: new Date().toISOString() }).eq("id", context.id);
  return context;
}

export async function recordPlatformUsage(input: {
  workspaceId: string;
  apiKeyId?: string | null;
  eventType: string;
  resourceType?: string | null;
  resourceId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  if (!isSupabaseAdminConfigured()) return;
  await createAdminClient().from("platform_usage_events").insert({
    workspace_id: input.workspaceId,
    api_key_id: input.apiKeyId ?? null,
    event_type: input.eventType,
    resource_type: input.resourceType ?? null,
    resource_id: input.resourceId ?? null,
    metadata: input.metadata ?? {}
  });
}

async function enforcePublicRateLimit(context: PublicApiKeyContext) {
  const since = new Date(Date.now() - 60_000).toISOString();
  const { count, error } = await createAdminClient()
    .from("platform_usage_events")
    .select("id", { count: "exact", head: true })
    .eq("api_key_id", context.id)
    .gte("created_at", since);
  if (error) throw new PlatformAuthError(`Falha no rate limit publico: ${error.message}`, 500, "rate_limit_failed");
  if ((count ?? 0) >= context.rateLimitPerMinute) throw new PlatformAuthError("Rate limit da API publica atingido.", 429, "rate_limited");
}

function extractToken(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  if (authorization?.toLowerCase().startsWith("bearer ")) return authorization.slice(7).trim();
  return request.headers.get("x-api-key")?.trim() ?? "";
}

export class PlatformAuthError extends Error {
  status: number;
  code: string;

  constructor(message: string, status: number, code: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function platformErrorResponse(error: unknown) {
  if (error instanceof PlatformAuthError) {
    return Response.json({ error: error.message, code: error.code }, { status: error.status });
  }
  const message = error instanceof Error ? error.message : "Erro inesperado na API publica.";
  return Response.json({ error: message, code: "platform_error" }, { status: 500 });
}

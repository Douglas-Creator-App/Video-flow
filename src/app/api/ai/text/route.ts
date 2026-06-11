import { NextResponse, type NextRequest } from "next/server";
import { registerAuditLog } from "@/lib/audit";
import { requireAuth, requirePermission, requireRateLimit } from "@/lib/auth";
import { canUseFeature } from "@/lib/billing";
import { runProviderTask } from "@/lib/providers/provider-router";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { user } = await requireAuth();
  const workspace = await requirePermission(String(body.workspace_id ?? "ws_1"), "content.create");
  await requireRateLimit({ workspaceId: workspace.workspaceId!, userId: user.id, feature: "openai_text", route: "/api/ai/text" });
  const usage = await canUseFeature(workspace.workspaceId ?? "ws_1", "generate_script");
  if (!usage.allowed) return NextResponse.json({ status: "blocked", error: usage.reason, usage }, { status: 402 });

  const result = await runProviderTask({
    type: "text",
    workspaceId: workspace.workspaceId ?? "ws_1",
    userId: user.id,
    systemPrompt: body.systemPrompt ?? body.system_prompt ?? "Voce e um assistente de conteudo do Video Flow.",
    prompt: body.userPrompt ?? body.user_prompt ?? body.prompt ?? "",
    allowFallback: body.allow_fallback === true
  }) as {
    status: string;
    providerMode: "real" | "mock" | "fallback";
    provider: string;
    model: string;
    text: string;
    inputTokens: number;
    outputTokens: number;
    cost: number;
    durationMs: number;
    warning: string | null;
  };

  await registerAuditLog({
    action: "create",
    entityType: "ai_generation",
    metadata: { provider: "openai", provider_mode: result.providerMode, model: result.model, status: result.status, cost: result.cost, durationMs: result.durationMs }
  });

  return NextResponse.json({ ...result, usage, is_demo: result.providerMode !== "real" });
}


import { NextResponse, type NextRequest } from "next/server";
import { registerAuditLog } from "@/lib/audit";
import { requireAuth, requirePermission, requireRateLimit } from "@/lib/auth";
import { canUseFeature } from "@/lib/billing";
import { runProviderTask } from "@/lib/providers/provider-router";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { user } = await requireAuth();
  const workspaceId = String(body.workspace_id ?? "");
  if (!workspaceId) return NextResponse.json({ status: "failed", error: "workspace_id obrigatorio." }, { status: 400 });
  await requirePermission(workspaceId, "content.create");
  await requireRateLimit({ workspaceId, userId: user.id, feature: "openai_images", route: "/api/ai/images" });
  const usage = await canUseFeature(workspaceId, "generate_image");
  if (!usage.allowed) return NextResponse.json({ status: "blocked", error: usage.reason, usage }, { status: 402 });

  const result = await runProviderTask({
    type: "image",
    workspaceId,
    userId: user.id,
    prompt: body.prompt ?? "",
    style: body.style,
    aspectRatio: body.aspect_ratio,
    quantity: body.quantity,
    provider: body.provider,
    referenceId: body.reference_id ?? body.referenceId,
    allowFallback: body.allow_fallback === true
  });

  await registerAuditLog({
    action: "create",
    entityType: "image_generation",
    metadata: { provider: "openai_images", provider_mode: result.providerMode, status: result.status, cost: result.cost, durationMs: result.durationMs }
  });

  return NextResponse.json({ ...result, usage, is_demo: result.providerMode !== "real" });
}


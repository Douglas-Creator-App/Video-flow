import { NextResponse, type NextRequest } from "next/server";
import { registerAuditLog } from "@/lib/audit";
import { requireAuth, requirePermission, requireRateLimit } from "@/lib/auth";
import { canUseFeature } from "@/lib/billing";
import { runProviderTask } from "@/lib/providers/provider-router";

export async function POST(request: NextRequest) {
  const body = await request.json();
  try {
    const workspaceId = String(body.workspace_id ?? "");
    if (!workspaceId) return NextResponse.json({ status: "failed", error: "workspace_id obrigatorio." }, { status: 400 });
    const { user } = await requireAuth();
    await requirePermission(workspaceId, "content.create");
    await requireRateLimit({ workspaceId, userId: user.id, feature: "openai_images", route: "/api/media/images" });
    const usage = await canUseFeature(workspaceId, "generate_image");
    if (!usage.allowed) return NextResponse.json({ status: "blocked", error: usage.reason, usage }, { status: 402 });

    const result = await runProviderTask({
      type: "image",
      workspaceId,
      userId: user.id,
      prompt: body.prompt ?? "Video Flow scene",
      style: body.style ?? "cinematografico",
      aspectRatio: body.aspect_ratio ?? "9:16",
      quantity: body.quantity ?? 1,
      provider: body.provider,
      referenceId: body.reference_id ?? body.referenceId,
      allowFallback: body.allow_fallback === true
    }) as {
      status: string;
      providerMode: "real" | "mock" | "fallback";
      provider: string;
      images: string[];
      imageUrl: string;
      cost: number;
      durationMs: number;
      warning: string | null;
    };

    await registerAuditLog({
      action: "create",
      entityType: "image_generation",
      metadata: { provider: "openai_images", provider_mode: result.providerMode, status: result.status, cost: result.cost, durationMs: result.durationMs }
    });

    return NextResponse.json({
      image_url: result.imageUrl,
      provider: body.provider ?? "openai_images",
      provider_mode: result.providerMode,
      warning: result.warning,
      is_demo: result.providerMode !== "real",
      cost_estimate: 0.04,
      usage,
      status: result.status
    });
  } catch (error) {
    return NextResponse.json({ status: "failed", error: error instanceof Error ? error.message : "Erro ao gerar imagem." }, { status: 500 });
  }
}


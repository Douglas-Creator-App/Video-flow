import { NextResponse, type NextRequest } from "next/server";
import { requireAuth, requirePermission, requireRateLimit } from "@/lib/auth";
import { runProviderTask, type ProviderTaskType } from "@/lib/providers/provider-router";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const workspaceId = String(body.workspace_id ?? "");
  if (!workspaceId) return NextResponse.json({ status: "failed", error: "workspace_id obrigatorio." }, { status: 400 });
  const type = (body.type ?? "text") as ProviderTaskType;
  const startedAt = Date.now();
  try {
    const { user } = await requireAuth();
    await requirePermission(workspaceId, "workspace.manage");
    await requireRateLimit({ workspaceId, userId: user.id, feature: "providers_test", route: "/api/providers/test" });
    const result = await runProviderTask({
      type,
      workspaceId,
      userId: user.id,
      prompt: body.prompt ?? "Teste Video Flow",
      text: body.text ?? "Teste curto de voz Video Flow.",
      provider: body.provider,
      quantity: type === "image" || type === "thumbnail" ? 1 : undefined,
      allowFallback: body.allow_fallback === true
    });
    return NextResponse.json({ status: "completed", duration_ms: Date.now() - startedAt, result });
  } catch (error) {
    return NextResponse.json({
      status: "failed",
      duration_ms: Date.now() - startedAt,
      error: error instanceof Error ? error.message : "Falha ao testar provider."
    }, { status: 400 });
  }
}

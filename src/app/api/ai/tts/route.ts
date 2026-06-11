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
  await requireRateLimit({ workspaceId, userId: user.id, feature: "openai_tts", route: "/api/ai/tts" });
  const usage = await canUseFeature(workspaceId, "generate_voice");
  if (!usage.allowed) return NextResponse.json({ status: "blocked", error: usage.reason, usage }, { status: 402 });

  const result = await runProviderTask({
    type: "tts",
    workspaceId,
    userId: user.id,
    text: body.text ?? "",
    voiceId: body.voice_id ?? body.voice,
    provider: body.provider === "elevenlabs" ? "elevenlabs" : "openai_tts",
    referenceId: body.reference_id ?? body.referenceId,
    allowFallback: body.allow_fallback === true
  }) as {
    status: string;
    providerMode: "real" | "mock" | "fallback";
    provider: string;
    audioUrl: string;
    durationSeconds: number;
    cost: number;
    durationMs: number;
    warning: string | null;
  };

  await registerAuditLog({
    action: "create",
    entityType: "audio_generation",
    metadata: { provider: result.provider, provider_mode: result.providerMode, status: result.status, cost: result.cost, durationMs: result.durationMs }
  });

  return NextResponse.json({ ...result, usage, is_demo: result.providerMode !== "real" });
}


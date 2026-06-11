import { NextResponse } from "next/server";
import { requireWorkspace } from "@/lib/auth";
import { persistAuditLog } from "@/lib/audit-server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const workspaceId = String(body.workspace_id ?? "");
  const type = String(body.type ?? "suggestion");
  const message = String(body.message ?? "").trim();
  const score = Number(body.score ?? 0);

  if (!workspaceId) return NextResponse.json({ error: "workspace_id obrigatorio." }, { status: 400 });
  if (!message) return NextResponse.json({ error: "Mensagem obrigatoria." }, { status: 400 });
  if (!["bug", "suggestion", "nps", "satisfaction"].includes(type)) {
    return NextResponse.json({ error: "Tipo de feedback invalido." }, { status: 400 });
  }

  const context = await requireWorkspace(workspaceId);
  await persistAuditLog({
    action: "create",
    workspaceId,
    actorId: context.user.id,
    entityType: "growth_feedback",
    metadata: {
      type,
      message,
      score: Number.isFinite(score) ? score : null,
      source: "growth_engine"
    }
  });

  return NextResponse.json({ ok: true });
}

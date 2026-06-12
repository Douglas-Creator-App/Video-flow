import { NextResponse, type NextRequest } from "next/server";
import { registerAuditLog } from "@/lib/audit";
import { requireAuth, requirePermission } from "@/lib/auth";
import { getPremiumTemplate, templateToMagicSettings } from "@/lib/premium-templates";

const allowedActions = ["create_channel", "magic_mode", "save_personal", "duplicate", "edit_settings"] as const;

export async function POST(request: NextRequest) {
  const body = await request.json();
  await requireAuth();
  const workspaceId = String(body.workspace_id ?? "");
  if (!workspaceId) return NextResponse.json({ status: "failed", error: "workspace_id obrigatorio." }, { status: 400 });
  await requirePermission(workspaceId, "workspace.manage");
  const action = allowedActions.includes(body.action) ? body.action : "magic_mode";
  const template = getPremiumTemplate(body.template_id ?? "");

  await registerAuditLog({
    action: action === "edit_settings" ? "update" : "create",
    entityType: "premium_template",
    entityId: template.id,
    metadata: { event: "template_action", action, template: template.name }
  });

  if (action !== "magic_mode") {
    return NextResponse.json({
      status: "not_implemented",
      action,
      template_id: template.id,
      error: "Esta acao de template ainda nao possui persistencia real. Use Magic Mode para aplicar as configuracoes do template.",
      available_action: "magic_mode"
    }, { status: 501 });
  }

  return NextResponse.json({
    status: "ready",
    action,
    template_id: template.id,
    message: `Magic Mode preparado com o template ${template.name}.`,
    magic_settings: templateToMagicSettings(template),
    inherited: {
      niche: template.niche,
      format: template.defaultFormat,
      duration: template.defaultDuration,
      narrative_type: template.narrativeType,
      voice_id: template.defaultVoiceId,
      visual_style: template.visualStyle,
      subtitle_style: template.subtitleStyle,
      music_mood: template.musicMood,
      thumbnail_prompt: template.thumbnailPrompt
    },
    provider_mode: "settings_only"
  });
}

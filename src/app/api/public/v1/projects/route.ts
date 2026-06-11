import { NextResponse, type NextRequest } from "next/server";
import { authenticatePublicApiKey, platformErrorResponse, recordPlatformUsage } from "@/lib/platform/api-keys";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const key = await authenticatePublicApiKey(request, "projects.write");
    const body = await request.json();
    const supabase = createAdminClient();
    const { data, error } = await supabase.from("projects").insert({
      workspace_id: key.workspaceId,
      name: String(body.name ?? body.nome ?? "Projeto via API"),
      description: body.description ?? body.descricao ?? null,
      main_niche: String(body.main_niche ?? body.nicho_principal ?? "Geral"),
      logo: body.logo ?? null,
      primary_color: String(body.primary_color ?? body.cor_principal ?? "#0f9f7a"),
      language: String(body.language ?? body.idioma ?? "pt-BR"),
      country: String(body.country ?? body.pais ?? "Brasil"),
      status: "ativo"
    }).select("*").single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    await recordPlatformUsage({ workspaceId: key.workspaceId, apiKeyId: key.id, eventType: "public.project_created", resourceType: "project", resourceId: data.id });
    return NextResponse.json({ project: data }, { status: 201 });
  } catch (error) {
    return platformErrorResponse(error);
  }
}

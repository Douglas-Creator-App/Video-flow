import { NextResponse, type NextRequest } from "next/server";
import { requirePermission } from "@/lib/auth";
import { createAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isSupabaseAdminConfigured()) return NextResponse.json({ error: "Supabase admin nao configurado." }, { status: 503 });
  const supabase = createAdminClient();
  const { data: endpoint, error: readError } = await supabase.from("webhook_endpoints").select("id, workspace_id").eq("id", id).maybeSingle();
  if (readError || !endpoint) return NextResponse.json({ error: "Webhook nao encontrado." }, { status: 404 });
  await requirePermission(String(endpoint.workspace_id), "admin.manage");
  const { error } = await supabase.from("webhook_endpoints").update({ status: "disabled", updated_at: new Date().toISOString() }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, status: "disabled" });
}

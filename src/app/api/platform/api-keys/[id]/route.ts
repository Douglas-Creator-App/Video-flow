import { NextResponse, type NextRequest } from "next/server";
import { requirePermission } from "@/lib/auth";
import { createAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isSupabaseAdminConfigured()) return NextResponse.json({ error: "Supabase admin nao configurado." }, { status: 503 });
  const supabase = createAdminClient();
  const { data: key, error: readError } = await supabase.from("public_api_keys").select("id, workspace_id").eq("id", id).maybeSingle();
  if (readError || !key) return NextResponse.json({ error: "API key nao encontrada." }, { status: 404 });
  await requirePermission(String(key.workspace_id), "admin.manage");
  const { error } = await supabase.from("public_api_keys").update({ status: "revoked", revoked_at: new Date().toISOString() }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, status: "revoked" });
}

import { NextResponse, type NextRequest } from "next/server";
import { requireAuth, requireWorkspace } from "@/lib/auth";
import { createAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get("workspace_id");
  const videoProjectId = searchParams.get("video_project_id");
  await requireAuth();
  if (!workspaceId) return NextResponse.json({ status: "failed", error: "workspace_id obrigatorio." }, { status: 400 });
  await requireWorkspace(workspaceId);

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ renders: [], source: "supabase_unconfigured" });
  }

  let query = createAdminClient()
    .from("video_renders")
    .select("id, workspace_id, video_project_id, render_url, status, duration_seconds, file_size, logs, created_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });
  if (videoProjectId) query = query.eq("video_project_id", videoProjectId);
  const { data, error } = await query;
  if (error) throw new Error(`Falha ao listar renders: ${error.message}`);
  return NextResponse.json({ renders: data ?? [], source: "supabase" });
}

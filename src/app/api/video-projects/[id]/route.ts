import { NextResponse, type NextRequest } from "next/server";
import { requireAuth, requireWorkspace } from "@/lib/auth";
import { getVideoProjectBundle } from "@/lib/video/video-repository";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const workspaceId = request.nextUrl.searchParams.get("workspace_id");
  await requireAuth();
  if (!workspaceId) return NextResponse.json({ status: "failed", error: "workspace_id obrigatorio." }, { status: 400 });
  await requireWorkspace(workspaceId);

  const bundle = await getVideoProjectBundle(id);
  if (!bundle || bundle.project.workspaceId !== workspaceId) {
    return NextResponse.json({ status: "not_found", error: "Video project nao encontrado." }, { status: 404 });
  }

  return NextResponse.json({ status: "ready", bundle });
}

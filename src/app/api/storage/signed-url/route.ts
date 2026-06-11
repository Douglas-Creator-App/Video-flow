import { NextResponse, type NextRequest } from "next/server";
import { requireAuth, requirePermission } from "@/lib/auth";
import { getSignedMediaUrl, parseStorageUrl, validateMediaExists } from "@/lib/storage/media-storage";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const url = String(body.url ?? body.storage_url ?? "");
  const expiresIn = body.expires_in ? Number(body.expires_in) : undefined;
  await requireAuth();

  if (!parseStorageUrl(url)) {
    if (!body.workspace_id) {
      return NextResponse.json({ status: "failed", error: "workspace_id obrigatorio para arquivos fora do storage." }, { status: 400 });
    }
    await requirePermission(String(body.workspace_id), "export_video");
    return NextResponse.json({ status: "passthrough", signed_url: url, url });
  }

  const workspaceId = url.replace("supabase://", "").split("/")[1];
  if (!workspaceId) return NextResponse.json({ status: "failed", error: "URL de storage invalida." }, { status: 400 });
  await requirePermission(workspaceId, "export_video");
  const exists = await validateMediaExists(url, { minSize: 1 });
  if (!exists.exists) {
    return NextResponse.json({ status: "failed", error: exists.error ?? "Arquivo nao encontrado no Storage." }, { status: 404 });
  }

  const signedUrl = await getSignedMediaUrl(url, expiresIn);
  return NextResponse.json({ status: "ready", signed_url: signedUrl, expires_in: expiresIn ?? Number(process.env.MEDIA_SIGNED_URL_TTL_SECONDS ?? 3600) });
}

import { NextResponse, type NextRequest } from "next/server";
import { requireAuth, requirePermission, requireRateLimit } from "@/lib/auth";
import { canUseFeature } from "@/lib/billing";
import { generateThumbnailReal } from "@/lib/media/thumbnail-generator";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const workspaceId = String(body.workspace_id ?? "");
  if (!workspaceId) return NextResponse.json({ status: "failed", error: "workspace_id obrigatorio." }, { status: 400 });
  const { user } = await requireAuth();
  await requirePermission(workspaceId, "content.create");
  await requireRateLimit({ workspaceId, userId: user.id, feature: "openai_images", route: "/api/media/thumbnails" });
  const usage = await canUseFeature(workspaceId, "generate_thumbnail");
  if (!usage.allowed) return NextResponse.json({ status: "blocked", error: usage.reason, usage }, { status: 402 });

  try {
    const result = await generateThumbnailReal({
      workspaceId,
      userId: user.id,
      videoProjectId: body.video_project_id ?? body.video_project_id ?? body.reference_id ?? "thumbnail",
      title: body.title ?? body.prompt ?? "Video Flow thumbnail",
      prompt: body.prompt,
      baseVideoPath: body.base_video_path ?? body.baseVideoPath,
      allowFallback: body.allow_fallback === true
    });

    return NextResponse.json({
      status: result.status,
      provider: result.provider,
      provider_mode: "real",
      warning: null,
      is_demo: false,
      image_urls: [result.thumbnailUrl],
      selected_image_url: result.thumbnailUrl,
      cost_estimate: result.cost,
      usage
    });
  } catch (error) {
    return NextResponse.json({ status: "failed", error: error instanceof Error ? error.message : "Erro ao gerar thumbnails." }, { status: 500 });
  }
}


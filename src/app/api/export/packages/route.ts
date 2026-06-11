import { NextResponse, type NextRequest } from "next/server";
import { bulkExportJobs, exportPackages, manualPublications, videoMetadataItems } from "@/lib/mock-data";
import { requireAuth, requirePermission, requireRateLimit } from "@/lib/auth";
import { createExportPackage } from "@/lib/export-center";
import { createBulkExportPackage, createRealExportPackage } from "@/lib/export/export-package";
import { createAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import type { ExportPlatform } from "@/lib/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const workspaceId = searchParams.get("workspace_id");
  await requireAuth();
  if (!workspaceId) return NextResponse.json({ status: "failed", error: "workspace_id obrigatorio." }, { status: 400 });
  await requirePermission(workspaceId, "export_video");
  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ packages: [], metadata: [], bulk_export_jobs: [], manual_publications: [], source: "supabase_unconfigured" });
  }
  const supabase = createAdminClient();
  const [packages, metadata, bulkJobs, publications] = await Promise.all([
    supabase.from("export_packages").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: false }),
    supabase.from("video_metadata").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: false }),
    supabase.from("bulk_export_jobs").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: false }),
    supabase.from("manual_publications").select("*").eq("workspace_id", workspaceId).order("created_at", { ascending: false })
  ]);
  if (packages.error) throw new Error(`Falha ao listar export packages: ${packages.error.message}`);
  if (metadata.error) throw new Error(`Falha ao listar video metadata: ${metadata.error.message}`);
  if (bulkJobs.error) throw new Error(`Falha ao listar bulk export jobs: ${bulkJobs.error.message}`);
  if (publications.error) throw new Error(`Falha ao listar manual publications: ${publications.error.message}`);
  return NextResponse.json({
    packages: packages.data ?? [],
    metadata: metadata.data ?? [],
    bulk_export_jobs: bulkJobs.data ?? [],
    manual_publications: publications.data ?? [],
    source: "supabase"
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const workspaceId = String(body.workspace_id ?? "");
  if (!workspaceId) return NextResponse.json({ status: "failed", error: "workspace_id obrigatorio." }, { status: 400 });
  const action = body.action ?? "create_package";
  const { user } = await requireAuth();
  await requirePermission(workspaceId, "export_video");
  await requireRateLimit({ workspaceId, userId: user.id, feature: "export_package", route: "/api/export/packages" });

  if (action === "bulk_export") {
    const realBulk = await createBulkExportPackage(body.selected_video_ids ?? [], (body.target_platform ?? "youtube_shorts") as ExportPlatform);
    if (realBulk.status === "ready") {
      return NextResponse.json({
        job: {
          id: `bulk_export_${Date.now()}`,
          workspaceId,
          userId: user.id,
          selectedVideoIds: body.selected_video_ids ?? [],
          targetPlatform: body.target_platform ?? "youtube_shorts",
          status: "ready",
          packageUrl: realBulk.packageUrl,
          createdAt: new Date().toISOString()
        },
        status: "ready",
        warning: "ZIP em lote real criado.",
        artifact_verified: true
      });
    }
    return NextResponse.json({
      job: {
        id: `bulk_export_${Date.now()}`,
        workspaceId,
        userId: user.id,
        selectedVideoIds: body.selected_video_ids ?? [],
        targetPlatform: body.target_platform ?? "youtube_shorts",
        status: "preparing",
        packageUrl: undefined,
        createdAt: new Date().toISOString()
      },
      status: "preparing",
      artifact_verified: false,
      warning: realBulk.error ?? "Manifest em lote criado. ZIP real nao foi liberado porque storage/worker ainda nao verificou o pacote."
    });
  }

  if (action === "mark_published") {
    if (body.artifact_verified !== true) {
      return NextResponse.json({
        status: "blocked",
        error: "Publicacao manual bloqueada: pacote ZIP/MP4 ainda nao foi verificado."
      }, { status: 409 });
    }

    return NextResponse.json({
      publication: {
        id: `manual_publication_${Date.now()}`,
        workspaceId,
        videoProjectId: body.video_project_id ?? "video_1",
        exportPackageId: body.export_package_id,
        platform: body.platform ?? "youtube_shorts",
        publishedUrl: body.published_url ?? "",
        publishedAt: body.published_at ?? new Date().toISOString(),
        notes: body.notes ?? "",
        createdAt: new Date().toISOString()
      },
      status: "marked_as_published"
    });
  }

  const realResult = await createRealExportPackage(body.video_project_id ?? "video_1", (body.target_platform ?? "youtube_shorts") as ExportPlatform);
  if (realResult.status === "ready") {
    return NextResponse.json({ ...realResult, status: "ready", artifact_verified: true, warning: realResult.warning });
  }

  const result = createExportPackage({
    workspaceId,
    channelId: body.channel_id ?? "channel_1",
    videoProjectId: body.video_project_id ?? "video_1",
    targetPlatform: (body.target_platform ?? "youtube_shorts") as ExportPlatform,
    title: body.title
  });

  return NextResponse.json({
    ...result,
    status: "preparing",
    artifact_verified: false,
    error: realResult.error,
    warning: realResult.error ?? "Manifest do pacote pronto. Download e publicacao manual ficam bloqueados ate ZIP/MP4 reais serem verificados."
  });
}

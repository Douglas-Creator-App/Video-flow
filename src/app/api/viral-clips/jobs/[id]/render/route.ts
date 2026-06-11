import { NextResponse, type NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { viralMoments } from "@/lib/mock-data";
import { aspectRatioForOutput } from "@/lib/viral/viral-clips-pipeline";
import type { ReframeMode, ViralClip, ViralSubtitleStyle } from "@/lib/types";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireAuth();
  const body = await request.json();
  const selectedIds = Array.isArray(body.moment_ids) ? body.moment_ids : [];
  const moments = viralMoments.filter((moment) => moment.viralClipJobId === id && (selectedIds.length === 0 || selectedIds.includes(moment.id)));
  const clips = moments.map<ViralClip>((moment, index) => ({
    id: `${id}_rendered_clip_${index + 1}`,
    workspaceId: moment.workspaceId,
    viralClipJobId: id,
    sourceVideoId: moment.sourceVideoId,
    viralMomentId: moment.id,
    title: body.titles?.[moment.id] ?? moment.title,
    startTime: Number(body.adjustments?.[moment.id]?.start ?? moment.startTime),
    endTime: Number(body.adjustments?.[moment.id]?.end ?? moment.endTime),
    durationSeconds: Math.round(Number(body.adjustments?.[moment.id]?.end ?? moment.endTime) - Number(body.adjustments?.[moment.id]?.start ?? moment.startTime)),
    aspectRatio: aspectRatioForOutput(body.output_format ?? "shorts"),
    subtitleStyle: (body.subtitle_style ?? "tiktok") as ViralSubtitleStyle,
    reframeMode: (body.reframe_mode ?? "blurred_background") as ReframeMode,
    renderUrl: "/media/mock-render.mp4",
    thumbnailUrl: `/media/mock-thumbnail-${(index % 6) + 1}.jpg`,
    status: "completed",
    createdAt: new Date().toISOString()
  }));
  return NextResponse.json({
    status: "completed",
    provider_mode: "demo",
    is_demo: true,
    warning: "Render de cortes executado em modo demonstracao; nao houve transcricao/download/render externo real.",
    logs: [
      "Momentos aprovados recebidos",
      "Reframe e legendas aplicados em configuracao mock",
      "Arquivo demonstrativo anexado aos cortes"
    ],
    clips
  });
}

import { NextResponse, type NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { sourceVideos, videoTranscripts, viralClipJobs, viralClips, viralMoments } from "@/lib/mock-data";
import { viralSteps } from "@/lib/viral/viral-clips-pipeline";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireAuth();
  const job = viralClipJobs.find((item) => item.id === id) ?? viralClipJobs[0];
  const sourceVideo = sourceVideos.find((item) => item.sourceUrl === job.sourceUrl) ?? sourceVideos[0];
  const transcript = videoTranscripts.find((item) => item.sourceVideoId === sourceVideo.id) ?? videoTranscripts[0];
  const moments = viralMoments.filter((item) => item.viralClipJobId === job.id);
  const clips = viralClips.filter((item) => item.viralClipJobId === job.id);
  return NextResponse.json({
    job,
    source_video: sourceVideo,
    transcript,
    moments,
    clips,
    steps: viralSteps,
    logs: [
      "Job criado",
      "Video fonte validado",
      "Audio extraido",
      "Transcricao concluida",
      "Momentos analisados",
      clips.length ? "Cortes renderizados" : "Aguardando renderizacao dos selecionados"
    ]
  });
}

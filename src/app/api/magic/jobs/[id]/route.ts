import { NextResponse, type NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { magicVideoJobs } from "@/lib/mock-data";
import { magicSteps } from "@/lib/magic/magic-pipeline";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireAuth();
  const job = magicVideoJobs.find((item) => item.id === id) ?? magicVideoJobs[0];
  return NextResponse.json({
    job,
    logs: [
      "Job carregado",
      "Workspace validado",
      "Etapas sincronizadas com Realtime quando Supabase estiver conectado",
      job.status === "ready_for_editor" ? "Projeto pronto para editor" : job.errorMessage ?? "Aguardando nova execucao"
    ],
    steps: magicSteps
  });
}

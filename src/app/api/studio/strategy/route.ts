import { NextResponse, type NextRequest } from "next/server";
import { registerAuditLog } from "@/lib/audit";
import { requireAuth, requirePermission } from "@/lib/auth";
import { createAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";

type StrategyOverview = {
  activeChannels: number;
  videoProjects: number;
  exportsReady: number;
  pendingJobs: number;
  failedJobs: number;
  creditsBalance: number;
  recommendations: string[];
};

export async function GET(request: NextRequest) {
  const workspaceId = request.nextUrl.searchParams.get("workspace_id");
  await requireAuth();
  if (!workspaceId) return NextResponse.json({ status: "failed", error: "workspace_id obrigatorio." }, { status: 400 });
  await requirePermission(workspaceId, "content.create");
  const overview = await getRealOverview(workspaceId);
  return NextResponse.json({
    status: "ready",
    provider_mode: "workspace_data",
    overview,
    suggestions: overview.recommendations
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const workspaceId = String(body.workspace_id ?? "");
  const question = String(body.question ?? "Qual canal devo focar?");
  await requireAuth();
  if (!workspaceId) return NextResponse.json({ status: "failed", error: "workspace_id obrigatorio." }, { status: 400 });
  await requirePermission(workspaceId, "content.create");
  const overview = await getRealOverview(workspaceId);

  await registerAuditLog({
    action: "create",
    entityType: "studio_strategy",
    metadata: { question, provider_mode: "workspace_data", workspace_id: workspaceId }
  });

  return NextResponse.json({
    status: "completed",
    provider_mode: "workspace_data",
    answer: answerFromOverview(question, overview),
    overview
  });
}

async function getRealOverview(workspaceId: string): Promise<StrategyOverview> {
  if (!isSupabaseAdminConfigured()) {
    return {
      activeChannels: 0,
      videoProjects: 0,
      exportsReady: 0,
      pendingJobs: 0,
      failedJobs: 0,
      creditsBalance: 0,
      recommendations: ["Supabase service role nao configurado. Strategist real precisa consultar dados persistidos do workspace."]
    };
  }

  const admin = createAdminClient();
  const [channels, videos, exportsReady, pendingJobs, failedJobs, wallet] = await Promise.all([
    countRows("channels", workspaceId, "status", "active"),
    countRows("video_projects", workspaceId),
    countRows("export_packages", workspaceId, "status", "ready"),
    countRows("background_jobs", workspaceId, "status", "queued"),
    countRows("background_jobs", workspaceId, "status", "failed"),
    admin.from("credit_wallets").select("balance").eq("workspace_id", workspaceId).maybeSingle()
  ]);
  if (wallet.error) throw new Error(`Falha ao consultar wallet: ${wallet.error.message}`);

  const overview = {
    activeChannels: channels,
    videoProjects: videos,
    exportsReady,
    pendingJobs,
    failedJobs,
    creditsBalance: Number(wallet.data?.balance ?? 0),
    recommendations: [] as string[]
  };
  overview.recommendations = buildRecommendations(overview);
  return overview;
}

async function countRows(table: string, workspaceId: string, column?: string, value?: string) {
  const admin = createAdminClient();
  let query = admin.from(table).select("id", { count: "exact", head: true }).eq("workspace_id", workspaceId);
  if (column && value) query = query.eq(column, value);
  const { count, error } = await query;
  if (error) throw new Error(`Falha ao consultar ${table}: ${error.message}`);
  return count ?? 0;
}

function buildRecommendations(overview: Omit<StrategyOverview, "recommendations">) {
  const recommendations: string[] = [];
  if (overview.activeChannels === 0) recommendations.push("Crie ou conecte pelo menos um canal antes de escalar producao.");
  if (overview.videoProjects === 0) recommendations.push("Gere o primeiro video real pelo Magic Mode para medir tempo ate valor.");
  if (overview.exportsReady === 0 && overview.videoProjects > 0) recommendations.push("Priorize render/export para transformar projetos em pacotes publicaveis.");
  if (overview.failedJobs > 0) recommendations.push("Revise a fila: existem jobs falhos afetando a operacao.");
  if (overview.creditsBalance <= 10) recommendations.push("Saldo de creditos baixo; ajuste consumo antes de rodar producao em lote.");
  if (!recommendations.length) recommendations.push("Operacao saudavel para beta: mantenha foco em consistencia de producao e exports prontos.");
  return recommendations;
}

function answerFromOverview(question: string, overview: StrategyOverview) {
  const normalized = question.toLowerCase();
  if (normalized.includes("canal")) return overview.activeChannels ? `Ha ${overview.activeChannels} canal(is) ativo(s). Foque no canal com mais projetos/exportacoes recentes.` : "Nenhum canal ativo encontrado neste workspace.";
  if (normalized.includes("template")) return "Use templates que ja estejam ligados ao Magic Mode real; acoes de duplicar/salvar ainda nao devem ser tratadas como persistidas.";
  if (normalized.includes("credito") || normalized.includes("custo")) return `Saldo atual: ${overview.creditsBalance} creditos. Evite jobs em lote se o saldo estiver baixo.`;
  if (normalized.includes("fila") || normalized.includes("job")) return `Fila atual: ${overview.pendingJobs} pendente(s), ${overview.failedJobs} falho(s). Corrija falhas antes de escalar.`;
  return overview.recommendations.join(" ");
}

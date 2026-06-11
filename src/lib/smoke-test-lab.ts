import { smokeModuleValidations, smokeTestIssues, smokeTestVideoResults } from "@/lib/mock-data";
import type { SmokeIssueSeverity } from "@/lib/types";

export function getSmokeTestSummary() {
  const planned = smokeTestVideoResults.length;
  const generated = smokeTestVideoResults.filter((video) => ["generated", "rendered", "exported", "ready_manual_publish"].includes(video.status)).length;
  const rendered = smokeTestVideoResults.filter((video) => ["rendered", "exported", "ready_manual_publish"].includes(video.status)).length;
  const exported = smokeTestVideoResults.filter((video) => video.exportPackageUrl).length;
  const failed = smokeTestVideoResults.filter((video) => ["failed", "blocked"].includes(video.status)).length;
  const totalTime = smokeTestVideoResults.reduce((total, video) => total + video.generationTimeSeconds, 0);
  const totalCredits = smokeTestVideoResults.reduce((total, video) => total + video.creditsConsumed, 0);
  const realReadiness = Math.round(((exported / planned) * 45) + ((smokeModuleValidations.filter((item) => item.status === "approved").length / smokeModuleValidations.length) * 35) + 10);

  return {
    planned,
    generated,
    rendered,
    exported,
    failed,
    successRate: Math.round((exported / planned) * 100),
    failureRate: Math.round((failed / planned) * 100),
    averageTimeSeconds: Math.round(totalTime / planned),
    averageCredits: Math.round(totalCredits / planned),
    totalCredits,
    realReadiness,
    byChannel: ["Historias Biblicas", "Estoicismo com Anime", "Curiosidades Historicas"].map((channel) => {
      const videos = smokeTestVideoResults.filter((video) => video.channel === channel);
      return {
        channel,
        planned: videos.length,
        exported: videos.filter((video) => video.exportPackageUrl).length,
        averageQuality: Math.round(videos.reduce((total, video) => total + video.qualityScore, 0) / videos.length),
        credits: videos.reduce((total, video) => total + video.creditsConsumed, 0)
      };
    }),
    issuesBySeverity: (["critical", "high", "medium", "low"] as SmokeIssueSeverity[]).map((severity) => ({
      severity,
      count: smokeTestIssues.filter((issue) => issue.severity === severity).length
    }))
  };
}

export function getSmokeGargles() {
  return [
    "Render real e pacote ZIP ainda nao foram comprovados em ambiente de producao.",
    "Providers reais ausentes deixam voz, imagem e parte do Magic Mode em modo mockado.",
    "Consumo de creditos ainda e estimado e precisa reconciliacao por provider.",
    "Editor pode ficar pesado em videos horizontais com muitas cenas.",
    "UX precisa avisar melhor quando o job/render/export e mockado."
  ];
}

export function getUrgentImprovements() {
  return [
    "Bloquear visualmente render/export real quando nao existir arquivo MP4/ZIP verificavel.",
    "Adicionar badge global de Demo/Mock nos resultados de geracao.",
    "Conectar media_usage_logs por etapa ao controle de creditos.",
    "Executar teste visual do editor para videos de 3 a 5 minutos.",
    "Implementar smoke test automatizado de rota para Magic, Editor, Render e Export Center."
  ];
}

export function getCreditReconciliation() {
  const moduleCosts = [
    { module: "roteiro", estimatedCredits: 42, loggedCredits: 42, status: "ok" },
    { module: "voz", estimatedCredits: 64, loggedCredits: 64, status: "ok" },
    { module: "imagens", estimatedCredits: 96, loggedCredits: 96, status: "ok" },
    { module: "render", estimatedCredits: 38, loggedCredits: 0, status: "blocked_until_verified" },
    { module: "export", estimatedCredits: 12, loggedCredits: 0, status: "blocked_until_zip" }
  ];

  return {
    totalEstimated: moduleCosts.reduce((total, item) => total + item.estimatedCredits, 0),
    totalLogged: moduleCosts.reduce((total, item) => total + item.loggedCredits, 0),
    moduleCosts,
    observation: "Render e export nao debitam creditos finais enquanto MP4/ZIP reais nao forem verificados."
  };
}

export function getPhase22Retest() {
  return {
    readiness: 74,
    tests: [
      { id: "retest_short_1", label: "Video curto - Historias Biblicas", status: "passed", result: "Fluxo gerou roteiro/cenas/quality; render final bloqueado corretamente sem MP4 real." },
      { id: "retest_short_2", label: "Video curto - Estoicismo Anime", status: "passed", result: "Modo mock visivel e creditos de render nao debitados." },
      { id: "retest_short_3", label: "Video curto - Curiosidades Historicas", status: "passed", result: "Quality Score e thumbnail entram em revisao quando abaixo do threshold." },
      { id: "retest_long_1", label: "Video longo 16:9", status: "needs_review", result: "Editor suporta fluxo, mas longa duracao ainda requer teste visual real." },
      { id: "retest_export_1", label: "Exportacao completa", status: "passed", result: "Download/publicacao ficam bloqueados sem ZIP e MP4 verificados." },
      { id: "retest_credits_1", label: "Teste de creditos", status: "passed", result: "Render/export final nao debitam creditos enquanto artefato real nao existe." },
      { id: "retest_editor_1", label: "Teste de editor", status: "passed", result: "Editor exibe aviso demo e bloqueia download final sem renderUrl verificado." },
      { id: "retest_render_1", label: "Teste de render", status: "passed", result: "API nao retorna completed para render final sem storage real." }
    ],
    fixedBugs: [
      "Render final deixou de ser marcado como completed sem MP4 verificado.",
      "Export Center deixou de liberar download/publicacao sem ZIP e MP4 reais.",
      "Creditos de render/export final ficam bloqueados ate artefato verificavel.",
      "Editor ganhou aviso claro de modo demonstracao.",
      "Test Lab passou a mostrar reteste e reconciliação de creditos."
    ],
    remainingBugs: [
      "Providers reais ainda precisam ser configurados.",
      "Render engine real e worker de ZIP ainda nao existem.",
      "Teste visual automatizado do editor ainda nao foi implementado."
    ],
    fragileModules: ["Render", "Export Center", "Voice Engine", "Image Engine", "Filas/workers"],
    approvedModules: ["Templates", "Canais", "Quality Score", "Logs", "Onboarding/Quick Start", "Test Lab"]
  };
}

export { smokeModuleValidations, smokeTestIssues, smokeTestVideoResults };

import {
  channels,
  contentFactories,
  contentSeries,
  creditWallets,
  factoryAlerts,
  factoryQueueJobs,
  factorySchedules,
  factoryTemplates,
  ideaBankItems,
  premiumTemplates,
  productionRules,
  providerCostSummaries,
  reviewQueueItems,
  topicSuggestions,
  trendTopics
} from "@/lib/mock-data";
import type { ContentFactory, FactoryJobStatus } from "@/lib/types";

const pipelineSteps = [
  "Selecionar ideia",
  "Aplicar template",
  "Gerar roteiro",
  "Gerar voz",
  "Criar cenas",
  "Escolher assets",
  "Criar thumbnail",
  "Criar video project",
  "Enviar para quality gate",
  "Adicionar na fila de render"
];

export function getFactory(factoryId: string) {
  return contentFactories.find((factory) => factory.id === factoryId);
}

export function getFactoryContext(factoryId: string) {
  const factory = getFactory(factoryId);
  if (!factory) return null;

  return {
    factory,
    channel: channels.find((channel) => channel.id === factory.channelId),
    template: premiumTemplates.find((template) => template.id === factory.templateId),
    rules: productionRules.filter((rule) => rule.factoryId === factoryId),
    schedules: factorySchedules.filter((schedule) => schedule.factoryId === factoryId),
    queue: factoryQueueJobs.filter((job) => job.factoryId === factoryId),
    reviews: reviewQueueItems.filter((item) => item.factoryId === factoryId),
    alerts: factoryAlerts.filter((alert) => alert.factoryId === factoryId || !alert.factoryId)
  };
}

export function getFactoryDashboard(factoryId: string) {
  const context = getFactoryContext(factoryId);
  if (!context) return null;

  const completed = context.queue.filter((job) => job.status === "completed");
  const failed = context.queue.filter((job) => job.status === "failed");
  const generated = context.queue.length;
  const rendered = completed.length;
  const credits = context.queue.reduce((total, job) => total + job.creditsConsumed, 0);
  const qualityScores = context.queue.map((job) => job.qualityScore).filter((score) => score > 0);
  const averageQuality = qualityScores.length
    ? Math.round(qualityScores.reduce((total, score) => total + score, 0) / qualityScores.length)
    : 0;

  return {
    ...context,
    metrics: {
      ideasUsed: ideaBankItems.filter((idea) => idea.channelId === context.factory.channelId && ["approved", "generating", "produced"].includes(idea.status)).length,
      videosGenerated: generated,
      videosRendered: rendered,
      creditsConsumed: credits,
      failures: failed.length,
      averageQuality,
      pendingReviews: context.reviews.filter((item) => item.status === "pending").length
    },
    resourcePlan: getResourcePlan(context.factory),
    productionDecision: getProductionLimitDecision(context.factory)
  };
}

export function getFactoryAnalytics() {
  const totalJobs = factoryQueueJobs.length;
  const completed = factoryQueueJobs.filter((job) => job.status === "completed").length;
  const failed = factoryQueueJobs.filter((job) => job.status === "failed").length;
  const activeFactories = contentFactories.filter((factory) => factory.status === "active").length;
  const credits = factoryQueueJobs.reduce((total, job) => total + job.creditsConsumed, 0);
  const costs = providerCostSummaries.reduce((total, row) => total + row.estimatedCost, 0);
  const scores = factoryQueueJobs.map((job) => job.qualityScore).filter((score) => score > 0);

  return {
    activeFactories,
    totalFactories: contentFactories.length,
    totalJobs,
    completed,
    failed,
    successRate: totalJobs ? Math.round((completed / totalJobs) * 100) : 0,
    failureRate: totalJobs ? Math.round((failed / totalJobs) * 100) : 0,
    creditsConsumed: credits,
    estimatedCost: costs,
    averageQuality: scores.length ? Math.round(scores.reduce((total, score) => total + score, 0) / scores.length) : 0,
    byFactory: contentFactories.map((factory) => {
      const queue = factoryQueueJobs.filter((job) => job.factoryId === factory.id);
      const factoryScores = queue.map((job) => job.qualityScore).filter((score) => score > 0);
      return {
        factory,
        generated: queue.length,
        rendered: queue.filter((job) => job.status === "completed").length,
        failed: queue.filter((job) => job.status === "failed").length,
        credits: queue.reduce((total, job) => total + job.creditsConsumed, 0),
        averageQuality: factoryScores.length ? Math.round(factoryScores.reduce((total, score) => total + score, 0) / factoryScores.length) : 0
      };
    })
  };
}

export function getResourcePlan(factory: ContentFactory) {
  const lowCredits = getProductionLimitDecision(factory).status !== "ready";
  return factory.resourcePriority.map((resource, index) => ({
    resource,
    priority: index + 1,
    mode: lowCredits && resource.toLowerCase().includes("ia") ? "limitado" : "ativo",
    note: resource.toLowerCase().includes("ia")
      ? "Usar apenas quando biblioteca e bancos gratuitos nao atenderem."
      : "Preferencia alta para reduzir custo e manter consistencia visual."
  }));
}

export function getProductionLimitDecision(factory: ContentFactory) {
  const wallet = creditWallets.find((item) => item.workspaceId === factory.workspaceId);
  const queued = factoryQueueJobs.filter((job) => job.factoryId === factory.id && ["queued", "generating", "rendering"].includes(job.status)).length;

  if (!wallet) return { status: "blocked" as const, message: "Carteira de creditos nao encontrada." };
  if (wallet.balance < 500) return { status: "blocked" as const, message: "Creditos insuficientes para nova rodada automatica." };
  if (queued >= 6) return { status: "limited" as const, message: "Fila congestionada. Nova rodada deve aguardar capacidade." };
  if (factory.status !== "active") return { status: "paused" as const, message: "Factory pausada. Nenhum job automatico sera criado." };

  return { status: "ready" as const, message: "Pronta para gerar com controle de creditos e quality gate." };
}

export function runFactoryGeneration(factoryId: string) {
  const context = getFactoryContext(factoryId);
  if (!context) return null;

  const selectedIdea = ideaBankItems.find((idea) => idea.channelId === context.factory.channelId && idea.status !== "archived") ?? ideaBankItems[0];
  const topic = topicSuggestions.find((item) => item.potentialScore >= 80) ?? topicSuggestions[0];
  const trend = trendTopics.find((item) => item.trendScore >= 80) ?? trendTopics[0];
  const estimatedQuality = Math.max(62, Math.min(92, Math.round(((selectedIdea?.score ?? 76) + (topic?.potentialScore ?? 78) + (trend?.trendScore ?? 74)) / 3)));
  const qualityGate = estimatedQuality >= context.factory.qualityGateThreshold;
  const status: FactoryJobStatus = qualityGate && !context.factory.requireReview ? "rendering" : "review";

  return {
    provider_mode: "internal_mock",
    publish_blocked: true,
    message: "Geracao simulada criada no backend. Publicacao automatica permanece bloqueada.",
    factory: context.factory,
    selectedIdea,
    topic,
    trend,
    estimatedQuality,
    qualityGate: {
      passed: qualityGate,
      threshold: context.factory.qualityGateThreshold,
      requiresReview: context.factory.requireReview,
      nextStep: qualityGate && !context.factory.requireReview ? "render_queue" : "review_queue"
    },
    job: {
      id: `factory_job_${Date.now()}`,
      title: selectedIdea?.title ?? topic?.title ?? "Ideia automatica",
      status,
      currentStep: status === "rendering" ? "Fila de render" : "Aguardando revisao",
      progress: status === "rendering" ? 88 : 76,
      creditsConsumed: status === "rendering" ? 28 : 18,
      qualityScore: estimatedQuality
    },
    resourcePlan: getResourcePlan(context.factory),
    pipeline: pipelineSteps.map((step, index) => ({
      step,
      status: index < 8 ? "completed" : index === 8 ? (qualityGate ? "completed" : "review") : status
    }))
  };
}

export function getAdminFactoryInsights() {
  const analytics = getFactoryAnalytics();
  return {
    ...analytics,
    templates: factoryTemplates.length,
    schedules: factorySchedules.length,
    series: contentSeries.length,
    alerts: factoryAlerts.length,
    pendingReviews: reviewQueueItems.filter((item) => item.status === "pending").length
  };
}

export { contentFactories, contentSeries, factoryAlerts, factoryQueueJobs, factorySchedules, factoryTemplates, productionRules, reviewQueueItems };

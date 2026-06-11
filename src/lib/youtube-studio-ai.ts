import {
  bulkJobs,
  calendarAiSuggestions,
  channelHealthScores,
  channels,
  contentCalendarItems,
  exportPackages,
  ideaBankItems,
  manualPublications,
  premiumTemplates,
  providerCostSummaries,
  strategyRecommendations,
  templatePacks,
  titleLabResults,
  topicSuggestions,
  trackedChannels,
  trendTopics,
  videoOpportunities,
  videoProjects,
  videoQualityScores
} from "@/lib/mock-data";

export function getChannelInsights(channelId: string, period = "30d") {
  const channel = channels.find((item) => item.id === channelId) ?? channels[0];
  const generated = videoProjects.length + bulkJobs.filter((job) => job.channelId === channel.id).reduce((sum, job) => sum + job.quantity, 0);
  const exported = exportPackages.filter((item) => item.channelId === channel.id).length;
  const published = manualPublications.filter((item) => exportPackages.some((pkg) => pkg.id === item.exportPackageId && pkg.channelId === channel.id)).length;
  const weeklyProduction = contentCalendarItems.filter((item) => item.channelId === channel.id).length + 3;
  const monthlyProduction = weeklyProduction * 4;
  const templatesUsed = premiumTemplates.filter((template) => template.niche.toLowerCase().includes(channel.niche.toLowerCase().split(" ")[0] ?? "")).slice(0, 3);
  const averageProductionTime = channel.channelType === "historia" ? "42 min" : "18 min";
  return { channel, period, generated, exported, published, weeklyProduction, monthlyProduction, templatesUsed, averageProductionTime };
}

export function getExecutiveOverview() {
  return {
    activeChannels: channels.filter((item) => item.status === "ativo").length,
    production: bulkJobs.reduce((sum, job) => sum + job.quantity, 0) + videoProjects.length,
    generatedVideos: videoProjects.length,
    credits: providerCostSummaries.reduce((sum, item) => sum + item.creditsCharged, 0),
    templates: premiumTemplates.length,
    ideas: ideaBankItems.length,
    trends: trendTopics.length,
    averageQuality: Math.round(videoQualityScores.reduce((sum, item) => sum + item.overallScore, 0) / videoQualityScores.length)
  };
}

export function answerStrategistQuestion(question: string) {
  const normalized = question.toLowerCase();
  if (normalized.includes("canal")) return "Foque em Estoico Diario esta semana: tem bom health score, template forte e baixa complexidade operacional.";
  if (normalized.includes("template")) return "O template Estoicismo com Anime tem melhor relacao entre score, custo e volume de ideias.";
  if (normalized.includes("credito") || normalized.includes("custo")) return "Os maiores custos estimados estao em imagem e voz. Use Stock Video Mode e templates com menor complexidade visual.";
  if (normalized.includes("nicho")) return "Luxo e Tecnologia estao subutilizados no workspace, apesar de bom potencial comercial.";
  return "Priorize canais com maior health score, reaproveite videos em shorts e transforme tendencias salvas em ideias aprovadas.";
}

export function getReportRows() {
  return {
    production: videoProjects.map((video) => ({ id: video.id, title: video.title, status: video.status, format: video.format })),
    templates: premiumTemplates.slice(0, 8).map((template) => ({ id: template.id, name: template.name, usage: template.usageCount, score: template.score.viralPotential })),
    videos: videoQualityScores.map((score) => ({ videoProjectId: score.videoProjectId, score: score.overallScore, retention: score.retentionScore })),
    channels: channelHealthScores.map((score) => ({ channelId: score.channelId, score: score.overallScore, consistency: score.consistency }))
  };
}

export function getInsightsMetrics() {
  return {
    ideasGenerated: topicSuggestions.length + titleLabResults.length,
    ideasUsed: ideaBankItems.filter((item) => ["approved", "generating", "produced"].includes(item.status)).length,
    videosProduced: videoProjects.length,
    completionRate: 78,
    averageScore: Math.round(videoQualityScores.reduce((sum, item) => sum + item.overallScore, 0) / videoQualityScores.length)
  };
}

export function getAdminMasterInsights() {
  return {
    templatesMostUsed: premiumTemplates.slice().sort((a, b) => b.usageCount - a.usageCount).slice(0, 5),
    channelsMostActive: channels.slice(0, 3),
    resourcesMostUsed: ["Magic Mode", "Templates", "Quality", "Export Center"],
    moduleCosts: providerCostSummaries
  };
}

export { calendarAiSuggestions, channelHealthScores, strategyRecommendations, templatePacks, titleLabResults, trackedChannels, trendTopics, videoOpportunities };

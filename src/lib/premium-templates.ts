import { premiumTemplates, templatePackItems, templatePacks } from "@/lib/mock-data";
import type { MagicAdvancedSettings, PremiumTemplate, PremiumTemplateCategory } from "@/lib/types";

export const templateCategories: Array<PremiumTemplateCategory | "Todos"> = [
  "Todos",
  "Canal Dark",
  "Historias Biblicas",
  "Estoicismo",
  "Curiosidades",
  "Biografias",
  "Luxo",
  "Misterios",
  "Historia",
  "Motivacional",
  "Documentario",
  "Anime Filosofico",
  "Top 10",
  "Comparativo de Marcas"
];

export function searchPremiumTemplates(filters: {
  query?: string;
  category?: PremiumTemplateCategory | "Todos";
  favoritesOnly?: boolean;
  featuredOnly?: boolean;
}) {
  const query = filters.query?.trim().toLowerCase() ?? "";
  return premiumTemplates.filter((template) => {
    const matchesQuery = !query || [
      template.name,
      template.description,
      template.niche,
      template.category,
      ...template.tags
    ].join(" ").toLowerCase().includes(query);
    const matchesCategory = !filters.category || filters.category === "Todos" || template.category === filters.category;
    const matchesFavorite = !filters.favoritesOnly || template.favorite;
    const matchesFeatured = !filters.featuredOnly || template.isFeatured;
    return matchesQuery && matchesCategory && matchesFavorite && matchesFeatured;
  });
}

export function getPremiumTemplate(templateId: string) {
  return premiumTemplates.find((template) => template.id === templateId) ?? premiumTemplates[0];
}

export function getTemplatePacks() {
  return templatePacks.map((pack) => ({
    ...pack,
    templates: templatePackItems
      .filter((item) => item.templatePackId === pack.id)
      .map((item) => getPremiumTemplate(item.templateId))
  }));
}

export function getTemplateScoreAverage(template: PremiumTemplate) {
  const scoreValues = Object.values(template.score);
  return Math.round(scoreValues.reduce((sum, value) => sum + value, 0) / scoreValues.length);
}

export function templateToMagicSettings(template: PremiumTemplate): Partial<MagicAdvancedSettings> {
  return {
    scriptInstructions: template.prompts.script,
    imageInstructions: template.imagePromptStyle,
    targetAudience: `${template.niche} - criadores de conteudo e canais automatizados`,
    language: template.language,
    narrationTone: template.narrativeType,
    cta: "Transforme este tema em um video completo no Magic Mode.",
    sceneCount: template.defaultDuration === "30s" ? 5 : template.defaultDuration === "60s" ? 8 : 12,
    customScript: "",
    useZoom: true,
    useOrganicMotion: template.visualStyle !== "minimalista",
    autoThumbnail: true,
    autoMusic: true,
    autoSubtitles: true
  };
}

export function createTemplateUsageSummary(template: PremiumTemplate) {
  return {
    canCreateChannel: true,
    canUseMagic: true,
    canDuplicate: true,
    canSavePersonal: true,
    inheritedSettings: [
      template.visualStyle,
      template.defaultVoiceId,
      template.defaultFormat,
      template.narrativeType,
      template.defaultDuration,
      template.subtitleStyle,
      template.musicMood
    ]
  };
}
